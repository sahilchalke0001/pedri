const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define schema once here or import it from models/User.js
const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String },
  email: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

// POST /api/users
router.post("/", async (req, res) => {
  const { clerkUserId, fullName, email } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ message: "Clerk User ID is required." });
  }

  try {
    let user = await User.findOne({ clerkUserId });

    if (user) {
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      await user.save();
      return res.status(200).json({ message: "User updated.", user });
    } else {
      user = new User({ clerkUserId, fullName, email });
      await user.save();
      return res.status(201).json({ message: "User created.", user });
    }
  } catch (error) {
    console.error("Error in /api/users:", error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
