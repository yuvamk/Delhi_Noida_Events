import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

// ─── generateToken ────────────────────────────────────────────
export function generateToken(userId: string, role: string = "user"): string {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET || JWT_SECRET + "_refresh";
  return jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
}

// ─── protect: requires valid JWT ─────────────────────────────
export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required", code: "NO_TOKEN" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "User no longer exists or deactivated", code: "USER_GONE" });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, error: "Invalid token", code: "INVALID_TOKEN" });
  }
}

// ─── optionalAuth: attaches user if token present ─────────────
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");
    if (user) { req.user = user; req.userId = user._id.toString(); }
    next();
  } catch {
    next(); // silently fail — it's optional
  }
}

// ─── adminOnly ────────────────────────────────────────────────
export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !["admin", "moderator"].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: "Admin access required", code: "FORBIDDEN" });
  }
  next();
}

// ─── superAdminOnly ───────────────────────────────────────────
export function superAdminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Super admin access required", code: "FORBIDDEN" });
  }
  next();
}

/**
 * ─── scraperOnly ──────────────────────────────────────────────
 * Used for Python scraper callbacks. 
 * Validates against SCRAPER_API_KEY in .env.
 */
export function scraperOnly(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] || req.headers["X-API-Key"];
  const validKey = process.env.SCRAPER_API_KEY;

  if (!validKey || apiKey !== validKey) {
    logger.warn(`❌ Unauthorized scraper attempt from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: "Invalid Scraper API Key",
      code: "UNAUTHORIZED_SCRAPER"
    });
  }
  
  next();
}

