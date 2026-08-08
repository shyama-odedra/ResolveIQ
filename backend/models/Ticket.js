const mongoose = require("mongoose");

const STATUSES = ["open", "assigned", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high"];

// The only legal forward moves. Enforced server-side so the workflow
// can't be skipped no matter what the client sends.
const ALLOWED_TRANSITIONS = {
  open: ["assigned"],
  assigned: ["in_progress", "open"], // allow un-assign back to open
  in_progress: ["resolved"],
  resolved: ["closed", "in_progress"], // allow reopen if not actually fixed
  closed: [], // terminal
};

const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    url: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const aiSuggestionSchema = new mongoose.Schema(
  {
    category: String,
    priority: { type: String, enum: PRIORITIES },
    department: String,
    estimatedResolution: String,
    suggestions: [String],
    generatedAt: Date,
    source: { type: String, enum: ["gemini", "reused_similar"], default: "gemini" },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: "open" },
    priority: { type: String, enum: PRIORITIES, default: "medium" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    attachments: [attachmentSchema],

    aiSuggestion: aiSuggestionSchema,
    similarTicketRef: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },

    slaDeadline: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Text index for keyword-based search & similarity matching
ticketSchema.index({ title: "text", description: "text" });

// Validate state transitions on every save that changes status
ticketSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("status")) {
    const prevStatus = this._previousStatus;
    if (prevStatus && prevStatus !== this.status) {
      const allowed = ALLOWED_TRANSITIONS[prevStatus] || [];
      if (!allowed.includes(this.status)) {
        return next(
          new Error(`Invalid transition: ${prevStatus} -> ${this.status}`)
        );
      }
    }
    if (this.status === "resolved") this.resolvedAt = new Date();
    if (this.status === "closed") this.closedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
