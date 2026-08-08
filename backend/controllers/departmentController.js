const Department = require("../models/Department");
const { asyncHandler } = require("../middleware/errorMiddleware");

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Department name is required");
  }
  const department = await Department.create({ name, description });
  res.status(201).json({ department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }
  res.json({ department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }
  res.json({ message: "Department deleted" });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
