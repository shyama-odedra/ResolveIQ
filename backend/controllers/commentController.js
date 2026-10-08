const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { logActivity, notifyUser } = require("../utils/activityHelper");
const { emitToTicket } = require("../sockets/socket");

// @route POST /api/tickets/:ticketId/comments
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const ticket = await Ticket.findById(req.params.ticketId);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const comment = await Comment.create({
    ticket: ticket._id,
    author: req.user._id,
    text,
  });
  await comment.populate("author", "name avatar role");

  await logActivity(ticket._id, req.user._id, "comment_added", { commentId: comment._id });

  const notifyTarget =
    req.user._id.toString() === ticket.createdBy.toString()
      ? ticket.assignedTo
      : ticket.createdBy;

  if (notifyTarget) {
    await notifyUser(notifyTarget.toString(), "new_comment", `New comment on "${ticket.title}"`, ticket._id);
  }

  emitToTicket(ticket._id.toString(), "comment:new", comment);
  res.status(201).json({ comment });
});

// @route GET /api/tickets/:ticketId/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ ticket: req.params.ticketId })
    .populate("author", "name avatar role")
    .sort({ createdAt: 1 });
  res.json({ comments });
});

module.exports = { addComment, getComments };
