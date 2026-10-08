const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  updatePriority,
  reanalyzeTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.post("/", upload.array("attachments", 5), createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket); // employee editing own open ticket
router.delete("/:id", deleteTicket); // owner (while open) or manager/admin
router.post("/:id/analyze", reanalyzeTicket);
router.put("/:id/assign", authorize("agent", "manager", "admin"), assignTicket);
router.put("/:id/status", authorize("agent", "manager", "admin"), updateStatus);
router.put("/:id/priority", authorize("agent", "manager", "admin"), updatePriority);

module.exports = router;
