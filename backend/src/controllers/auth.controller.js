// backend/src/controllers/auth.controller.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "call_compliance_auditor_secret_key_change_me",
    {
      expiresIn: "30d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user data provided",
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server Error during registration",
    });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Check for user (must select password since select: false is set)
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.comparePassword(password))) {
      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server Error during authentication",
    });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server Error retrieving profile",
    });
  }
};
