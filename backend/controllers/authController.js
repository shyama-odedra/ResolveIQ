const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Only allow self-registration as 'employee'. Higher roles are granted
  // by an admin via the user management endpoints, not at signup.
  const user = await User.create({
    name,
    email,
    password,
    role: "employee",
    department: department || undefined,
  });

  const token = generateToken(user._id, user.role);
  res.status(201).json({ user: user.toSafeObject(), token });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  const token = generateToken(user._id, user.role);
  res.json({ user: user.toSafeObject(), token });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, department } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (department) user.department = department;

  await user.save();
  res.json({ user: user.toSafeObject() });
});

// @route PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new password are required");
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
