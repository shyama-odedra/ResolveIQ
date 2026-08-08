const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");
const { emitToUser, emitToTicket } = require("../sockets/socket");

// Records an audit log entry and broadcasts it to anyone viewing the ticket.
async function logActivity(ticketId, actorId, action, meta = {}) {
  const entry = await ActivityLog.create({ ticket: ticketId, actor: actorId, action, meta });
  emitToTicket(ticketId.toString(), "activity:new", entry);
  return entry;
}

// Creates a notification for a user and pushes it in real time.
async function notifyUser(userId, type, message, ticketId = null) {
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    ticket: ticketId,
  });
  emitToUser(userId.toString(), "notification:new", notification);
  return notification;
}

module.exports = { logActivity, notifyUser };
