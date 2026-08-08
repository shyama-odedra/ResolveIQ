const express = require("express");
const router = express.Router();
const {
  getSummary,
  getTicketsPerDay,
  getDepartmentDistribution,
  getPriorityDistribution,
  getAvgResolutionTime,
  getSlaPerformance,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("manager", "admin"));

router.get("/summary", getSummary);
router.get("/tickets-per-day", getTicketsPerDay);
router.get("/department-distribution", getDepartmentDistribution);
router.get("/priority-distribution", getPriorityDistribution);
router.get("/resolution-time", getAvgResolutionTime);
router.get("/sla-performance", getSlaPerformance);

module.exports = router;
