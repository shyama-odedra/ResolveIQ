const express = require("express");
const router = express.Router({ mergeParams: true });
const ActivityLog = require("../models/ActivityLog");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorMiddleware");

router.use(protect);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const logs = await ActivityLog.find({ ticket: req.params.ticketId })
      .populate("actor", "name avatar role")
      .sort({ createdAt: 1 });
    res.json({ logs });
  })
);

module.exports = router;
