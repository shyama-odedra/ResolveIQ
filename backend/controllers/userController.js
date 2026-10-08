const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @route GET /api/users  (agents/managers/admin — e.g. for assignment dropdowns)
const getUsers = asyncHandler(async (req, res) => {
  const { role, department } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;

  const users = await User.find(filter).select("-password").sort({ name: 1 });
  res.json({ users });
});

// @route PUT /api/users/:id/role  (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ["employee", "agent", "manager", "admin"];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
    "-password"
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user });
});

// @route PUT /api/users/:id/status  (admin only — activate/deactivate)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select(
    "-password"
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user });
});

module.exports = { getUsers, updateUserRole, updateUserStatus };
