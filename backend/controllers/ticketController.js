const Ticket = require("../models/Ticket");
const { ALLOWED_TRANSITIONS, PRIORITIES } = require("../models/Ticket");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { analyzeTicket } = require("../utils/geminiService");
const { findSimilarTicket } = require("../utils/similarityService");
const { classifyPriority } = require("../utils/priorityService");
const { logActivity, notifyUser } = require("../utils/activityHelper");
const { emitToTicket, emitToRoles, emitToUser } = require("../sockets/socket");

const SLA_HOURS = {
  critical: Number(process.env.SLA_CRITICAL_HOURS) || 1,
  high: Number(process.env.SLA_HIGH_HOURS) || 4,
  medium: Number(process.env.SLA_MEDIUM_HOURS) || 24,
  low: Number(process.env.SLA_LOW_HOURS) || 72,
};

const computeSlaDeadline = (priority) => {
  const hours = SLA_HOURS[priority] || SLA_HOURS.medium;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

// Runs Gemini triage on a ticket and saves priority + suggestions on it.
async function runAiTriage(ticket) {
  let similar = null;
  try {
    similar = await findSimilarTicket(ticket.title, ticket.description);
    if (similar && similar.ticketId?.toString() === ticket._id.toString()) similar = null;
  } catch (err) {
    console.warn("[tickets] similarity lookup failed:", err.message);
  }

  let department = null;
  try {
    if (ticket.department) {
      const populated = await ticket.populate("department", "name");
      department = populated.department?.name || null;
    }
  } catch (_) {}

  // Always the CURRENT title/description, so Re-analyze sees any edits.
  const aiResult = await analyzeTicket(ticket.title, ticket.description, {
    similar,
    department,
    category: ticket.aiSuggestion?.source === "gemini" ? ticket.aiSuggestion.category : undefined,
  });
  ticket.aiSuggestion = aiResult;
  ticket.similarTicketRef = similar ? similar.ticketId : null;
  ticket.priority = aiResult.priority;
  ticket.slaDeadline = computeSlaDeadline(ticket.priority);
  await ticket.save();
  return ticket;
}

// @route POST /api/tickets
// Creates a ticket, then runs the AI pipeline: check for a similar resolved
// ticket first (cheap), and only fall back to a live Gemini call if nothing
// close enough is found.
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, department } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  const attachments = (req.files || []).map((f) => ({
    filename: f.originalname,
    url: `/uploads/${f.filename}`,
    mimeType: f.mimetype,
    size: f.size,
  }));

  const ticket = await Ticket.create({
    title,
    description,
    department: department || undefined,
    createdBy: req.user._id,
    attachments,
  });

  // AI pipeline (non-blocking failure: ticket still gets created even if this fails).
  // A similar resolved ticket, if any, is passed to Gemini as extra context;
  // urgency is always judged from this ticket's own text.
  try {
    await runAiTriage(ticket);
    await logActivity(ticket._id, req.user._id, "ai_suggestion_generated", {
      source: ticket.aiSuggestion.source,
    });
  } catch (err) {
    console.error("[tickets] AI pipeline failed:", err.message);
    ticket.priority = classifyPriority(title, description).priority;
    ticket.slaDeadline = computeSlaDeadline(ticket.priority);
    await ticket.save();
  }

  await logActivity(ticket._id, req.user._id, "created", { title });

  // Notify all agents/managers of a new ticket
  await emitToRoles(["agent", "manager"], "ticket:new", ticket);

  res.status(201).json({ ticket });
});

// @route GET /api/tickets
// Supports search + filters + role-based visibility
const getTickets = asyncHandler(async (req, res) => {
  const { search, status, priority, department, assignedTo, from, to } = req.query;
  const filter = {};

  // Employees only see their own tickets
  if (req.user.role === "employee") {
    filter.createdBy = req.user._id;
  }

  if (search) filter.$text = { $search: search };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (department) filter.department = department;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("department", "name")
    .sort({ createdAt: -1 });

  res.json({ tickets });
});

// @route GET /api/tickets/:id
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("department", "name")
    .populate("similarTicketRef", "title resolvedAt");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (
    req.user.role === "employee" &&
    ticket.createdBy._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this ticket");
  }

  res.json({ ticket });
});

// @route PUT /api/tickets/:id/assign
const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.assignedTo = agentId;
  ticket._previousStatus = ticket.status;
  ticket.status = "assigned";
  await ticket.save();

  await logActivity(ticket._id, req.user._id, "assigned", { agentId });
  await notifyUser(agentId, "ticket_assigned", `You've been assigned ticket: ${ticket.title}`, ticket._id);
  emitToTicket(ticket._id.toString(), "ticket:updated", ticket);

  res.json({ ticket });
});

// @route PUT /api/tickets/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const allowed = ALLOWED_TRANSITIONS[ticket.status] || [];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(
      `Cannot move ticket from '${ticket.status}' to '${status}'. Allowed: ${allowed.join(", ") || "none (terminal state)"}`
    );
  }

  ticket._previousStatus = ticket.status;
  ticket.status = status;
  await ticket.save();

  await logActivity(ticket._id, req.user._id, "status_changed", {
    from: ticket._previousStatus,
    to: status,
  });
  await notifyUser(
    ticket.createdBy.toString(),
    "status_changed",
    `Your ticket "${ticket.title}" is now ${status}`,
    ticket._id
  );
  emitToTicket(ticket._id.toString(), "ticket:updated", ticket);

  res.json({ ticket });
});

// @route POST /api/tickets/:id/analyze
// Re-runs AI triage (priority + resolution suggestions) on an existing ticket.
const reanalyzeTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (req.user.role === "employee" && ticket.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to analyze this ticket");
  }

  await runAiTriage(ticket);
  await logActivity(ticket._id, req.user._id, "ai_suggestion_generated", {
    source: ticket.aiSuggestion.source,
  });

  const populated = await Ticket.findById(ticket._id)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("department", "name")
    .populate("similarTicketRef", "title resolvedAt");
  emitToTicket(ticket._id.toString(), "ticket:updated", populated);
  res.json({ ticket: populated });
});

// @route PUT /api/tickets/:id/priority
const updatePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  if (!PRIORITIES.includes(priority)) {
    res.status(400);
    throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const oldPriority = ticket.priority;
  ticket.priority = priority;
  ticket.slaDeadline = computeSlaDeadline(priority);
  await ticket.save();

  await logActivity(ticket._id, req.user._id, "priority_changed", { from: oldPriority, to: priority });
  emitToTicket(ticket._id.toString(), "ticket:updated", ticket);

  res.json({ ticket });
});

// @route PUT /api/tickets/:id
// Employee editing their own ticket, only allowed before it's assigned
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to edit this ticket");
  }

  if (ticket.status !== "open") {
    res.status(400);
    throw new Error("Ticket can only be edited while it is still open");
  }

  const { title, description } = req.body;
  if (title) ticket.title = title;
  if (description) ticket.description = description;
  await ticket.save();

  emitToTicket(ticket._id.toString(), "ticket:updated", ticket);
  res.json({ ticket });
});

// @route DELETE /api/tickets/:id
// Who can delete:
//   - the employee who raised it, but only while it is still "open" (a mistaken ticket)
//   - managers and admins, at any stage
// It is a soft delete, so the audit log keeps the full history.
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const isOwner = ticket.createdBy.toString() === req.user._id.toString();
  const isPrivileged = ["manager", "admin"].includes(req.user.role);

  if (!isPrivileged) {
    if (!isOwner) {
      res.status(403);
      throw new Error("You can only delete tickets you created");
    }
    if (ticket.status !== "open") {
      res.status(400);
      throw new Error("This ticket is already being handled. Ask a manager to remove it.");
    }
  }

  ticket.deletedAt = new Date();
  ticket.deletedBy = req.user._id;
  await ticket.save();

  await logActivity(ticket._id, req.user._id, "deleted", { title: ticket.title });

  // Let the people involved know, unless they were the one who deleted it
  const toNotify = new Set();
  if (ticket.assignedTo) toNotify.add(ticket.assignedTo.toString());
  if (!isOwner) toNotify.add(ticket.createdBy.toString());
  toNotify.delete(req.user._id.toString());
  for (const userId of toNotify) {
    await notifyUser(userId, "ticket_deleted", `Ticket "${ticket.title}" was deleted`, ticket._id);
  }

  // Live-update anyone looking at it or at a list that contains it
  const payload = { _id: ticket._id.toString() };
  emitToTicket(payload._id, "ticket:deleted", payload);
  emitToUser(ticket.createdBy.toString(), "ticket:deleted", payload);
  await emitToRoles(["agent", "manager", "admin"], "ticket:deleted", payload);

  res.json({ message: "Ticket deleted", id: payload._id });
});

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  updatePriority,
  reanalyzeTicket,
  updateTicket,
  deleteTicket,
};
