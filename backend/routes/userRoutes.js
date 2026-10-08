const express = require("express");
const router = express.Router();
const { getUsers, updateUserRole, updateUserStatus } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("agent", "manager", "admin"), getUsers);
router.put("/:id/role", authorize("admin"), updateUserRole);
router.put("/:id/status", authorize("admin"), updateUserStatus);

module.exports = router;
