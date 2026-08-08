const mongoose = require("mongoose");

// Append-only audit trail. Never updated or deleted, only inserted —
// mirrors how real ITSM systems (ServiceNow included) keep history
// separate from the mutable entity itself.
const activityLogSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "assigned",
        "unassigned",
        "status_changed",
        "priority_changed",
        "department_changed",
        "comment_added",
        "attachment_added",
        "ai_suggestion_generated",
        "ai_suggestion_overridden",
      ],
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
