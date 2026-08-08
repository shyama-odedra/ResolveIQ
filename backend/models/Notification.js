const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "ticket_assigned",
        "status_changed",
        "new_comment",
        "ticket_escalated",
        "sla_breach_warning",
      ],
      required: true,
    },
    message: { type: String, required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
