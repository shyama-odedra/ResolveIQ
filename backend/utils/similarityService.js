const Ticket = require("../models/Ticket");

// Simple keyword-based similarity: uses MongoDB's text index (title + description)
// against resolved/closed tickets, ranked by textScore. Cheap, no external calls,
// good enough to demonstrate the "check history before calling AI" pattern.
async function findSimilarTicket(title, description) {
  const query = `${title} ${description}`;

  const candidates = await Ticket.find(
    {
      $text: { $search: query },
      status: { $in: ["resolved", "closed"] },
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(1)
    .populate("assignedTo", "name email")
    .lean();

  if (!candidates.length) return null;

  const best = candidates[0];
  // textScore isn't a normalized 0-1 similarity, so we clamp/normalize
  // roughly for display purposes.
  const similarityScore = Math.min(1, (best.score || 0) / 5);

  // Only surface it if it clears a minimal relevance bar
  if (similarityScore < 0.15) return null;

  return {
    ticketId: best._id,
    title: best.title,
    similarityScore: Number(similarityScore.toFixed(2)),
    resolution: best.aiSuggestion?.suggestions || [],
    resolutionTimeMs:
      best.resolvedAt && best.createdAt
        ? new Date(best.resolvedAt) - new Date(best.createdAt)
        : null,
    assignedAgent: best.assignedTo ? best.assignedTo.name : null,
  };
}

module.exports = { findSimilarTicket };
