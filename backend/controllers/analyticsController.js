const Ticket = require("../models/Ticket");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @route GET /api/analytics/summary
const getSummary = asyncHandler(async (req, res) => {
  const [total, open, assigned, inProgress, resolved, closed] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: "open" }),
    Ticket.countDocuments({ status: "assigned" }),
    Ticket.countDocuments({ status: "in_progress" }),
    Ticket.countDocuments({ status: "resolved" }),
    Ticket.countDocuments({ status: "closed" }),
  ]);

  res.json({ total, open, assigned, inProgress, resolved, closed });
});

// @route GET /api/analytics/tickets-per-day?days=14
const getTicketsPerDay = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 14;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await Ticket.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ data: data.map((d) => ({ date: d._id, count: d.count })) });
});

// @route GET /api/analytics/department-distribution
const getDepartmentDistribution = asyncHandler(async (req, res) => {
  const data = await Ticket.aggregate([
    { $match: { department: { $ne: null } } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "dept",
      },
    },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, department: { $ifNull: ["$dept.name", "Unassigned"] }, count: 1 } },
  ]);

  res.json({ data });
});

// @route GET /api/analytics/priority-distribution
const getPriorityDistribution = asyncHandler(async (req, res) => {
  const data = await Ticket.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $project: { _id: 0, priority: "$_id", count: 1 } },
  ]);
  res.json({ data });
});

// @route GET /api/analytics/resolution-time
const getAvgResolutionTime = asyncHandler(async (req, res) => {
  const result = await Ticket.aggregate([
    { $match: { resolvedAt: { $ne: null } } },
    {
      $project: {
        resolutionMs: { $subtract: ["$resolvedAt", "$createdAt"] },
      },
    },
    { $group: { _id: null, avgMs: { $avg: "$resolutionMs" } } },
  ]);

  const avgMs = result[0]?.avgMs || 0;
  res.json({
    avgMs,
    avgHours: Number((avgMs / (1000 * 60 * 60)).toFixed(1)),
  });
});

// @route GET /api/analytics/sla-performance
const getSlaPerformance = asyncHandler(async (req, res) => {
  const resolvedTickets = await Ticket.find({
    resolvedAt: { $ne: null },
    slaDeadline: { $ne: null },
  }).select("resolvedAt slaDeadline");

  let met = 0;
  let breached = 0;
  resolvedTickets.forEach((t) => {
    if (new Date(t.resolvedAt) <= new Date(t.slaDeadline)) met++;
    else breached++;
  });

  const total = met + breached;
  res.json({
    met,
    breached,
    metPercentage: total ? Number(((met / total) * 100).toFixed(1)) : 0,
  });
});

module.exports = {
  getSummary,
  getTicketsPerDay,
  getDepartmentDistribution,
  getPriorityDistribution,
  getAvgResolutionTime,
  getSlaPerformance,
};
