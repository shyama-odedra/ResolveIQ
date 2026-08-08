require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Department.deleteMany({});

  const departments = await Department.insertMany([
    { name: "IT Support", description: "Hardware, software, and access issues" },
    { name: "Network Ops", description: "Connectivity and infrastructure" },
    { name: "Security", description: "Access control and security incidents" },
    { name: "HR", description: "Employee-facing HR requests" },
  ]);

  const users = [
    { name: "Admin User", email: "admin@ticketflow.ai", password: "password123", role: "admin" },
    { name: "Maya Manager", email: "manager@ticketflow.ai", password: "password123", role: "manager" },
    {
      name: "Alex Agent",
      email: "agent@ticketflow.ai",
      password: "password123",
      role: "agent",
      department: departments[0]._id,
    },
    {
      name: "Priya Employee",
      email: "employee@ticketflow.ai",
      password: "password123",
      role: "employee",
    },
  ];

  for (const u of users) {
    await User.create(u);
  }

  console.log("Seed complete. Demo accounts (all passwords: password123):");
  users.forEach((u) => console.log(`  ${u.role.padEnd(8)} -> ${u.email}`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
