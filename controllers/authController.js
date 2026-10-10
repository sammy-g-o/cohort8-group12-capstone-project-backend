import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const signToken = (id, role, organizationId) => {
  return jwt.sign({ id, role, organizationId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Name, email and password are required", 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError("Email already registered", 409));
    }

    // ...existing required-field and duplicate-email checks...

    const allowedSignupRoles = ["volunteer", "coordinator"];
    if (role && !allowedSignupRoles.includes(role)) {
      return next(new AppError("You can't register with that role", 403));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      role, // undefined falls back to the schema default ("volunteer")
      passwordHash,
    });

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          timestamp: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken(user._id, user.role, user.organizationId);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
