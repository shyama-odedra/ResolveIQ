const express = require("express");
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", getDepartments);
router.post("/", authorize("admin"), createDepartment);
router.put("/:id", authorize("admin"), updateDepartment);
router.delete("/:id", authorize("admin"), deleteDepartment);

module.exports = router;
