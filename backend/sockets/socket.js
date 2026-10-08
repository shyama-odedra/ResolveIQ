const jwt = require("jsonwebtoken");

let io;

// Rooms: each user joins `user:<id>` for personal notifications,
// and `ticket:<id>` when viewing a specific ticket for live comment/status updates.
function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("joinTicket", (ticketId) => {
      socket.join(`ticket:${ticketId}`);
    });

    socket.on("leaveTicket", (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// Emit helpers used by controllers
const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToTicket = (ticketId, event, payload) => {
  if (!io) return;
  io.to(`ticket:${ticketId}`).emit(event, payload);
};

const emitToRoles = async (roles, event, payload) => {
  if (!io) return;
  const User = require("../models/User");
  const users = await User.find({ role: { $in: roles } }, "_id");
  users.forEach((u) => io.to(`user:${u._id}`).emit(event, payload));
};

module.exports = { initSocket, getIO, emitToUser, emitToTicket, emitToRoles };
