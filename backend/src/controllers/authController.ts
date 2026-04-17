import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import { asyncHandler } from "../middleware/errorHandler";
import { generateToken, generateRefreshToken, AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { syncUserToSupabase } from "../services/supabaseSync";

// ─── POST /api/v1/auth/register ───────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, cityPreference, categoryPreferences } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, error: "Email already registered", code: "EMAIL_EXISTS" });
  }

  const user = await User.create({
    name,
    email,
    password,
    cityPreference: cityPreference || "Both",
    categoryPreferences: categoryPreferences || [],
    isEmailVerified: false,
    emailVerificationToken: crypto.randomBytes(32).toString("hex"),
  });

  const token = generateToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  logger.info(`New user registered: ${email}`);

  // Sync to Supabase
  syncUserToSupabase({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }).catch(() => {});

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cityPreference: user.cityPreference,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
    message: "Account created successfully! Please verify your email.",
  });
});

// ─── POST /api/v1/auth/login ──────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
    return res.status(401).json({ success: false, error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: "Account deactivated. Contact support.", code: "ACCOUNT_DEACTIVATED" });
  }

  // Update last login
  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $inc: { loginCount: 1 },
  });

  const token = generateToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  logger.info(`User logged in: ${email}`);

  // Sync update to Supabase
  syncUserToSupabase({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }).catch(() => {});

  res.json({
    success: true,
    token,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      cityPreference: user.cityPreference,
      categoryPreferences: user.categoryPreferences,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
    },
  });
});

// ─── GET /api/v1/auth/me ─────────────────────────────────────
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).populate("bookmarkedEvents", "title date city");
  if (!user) return res.status(404).json({ success: false, error: "User not found", code: "NOT_FOUND" });

  res.json({ success: true, data: user });
});

// ─── PUT /api/v1/auth/profile ────────────────────────────────
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, cityPreference, categoryPreferences, notificationsEnabled } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, cityPreference, categoryPreferences, notificationsEnabled },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  // Sync update to Supabase
  syncUserToSupabase({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }).catch(() => {});

  res.json({ success: true, data: user, message: "Profile updated" });
});

// ─── PUT /api/v1/auth/change-password ────────────────────────
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Current and new passwords required" });
  }

  const user = await User.findById(req.userId).select("+password");
  if (!user || !user.password) return res.status(404).json({ success: false, error: "User not found" });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ success: false, error: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

// ─── POST /api/v1/auth/refresh-token ─────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: incomingToken } = req.body;
  if (!incomingToken) {
    return res.status(400).json({ success: false, error: "Refresh token required" });
  }

  try {
    const jwt = await import("jsonwebtoken");
    const secret = (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "") + "_refresh";
    const decoded = jwt.default.verify(incomingToken, secret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Invalid session" });
    }
    const newToken = generateToken(user._id.toString(), user.role);
    res.json({ success: true, token: newToken, expiresIn: 7 * 24 * 60 * 60 });
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired refresh token" });
  }
});
