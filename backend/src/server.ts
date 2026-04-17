/**
 * Delhi-Noida Events — Production-Grade Express Server
 * ─────────────────────────────────────────────────────────────
 * High-traffic optimizations:
 *  • PM2 cluster mode ready (handles worker_id, IPC)
 *  • Request timeout middleware (15s hard limit)
 *  • Slow request logging (>2s)
 *  • HTTP keep-alive tuning (reduces TCP overhead)
 *  • Graceful shutdown with connection draining
 *  • Response time header
 *  • Memory usage monitoring + auto-restart warning
 *  • Cache-Control headers on all public routes
 *  • Health + readiness + metrics endpoints
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

// Routes
import eventRoutes from "./routes/eventRoutes";
import authRoutes from "./routes/authRoutes";
import bookmarkRoutes from "./routes/bookmarkRoutes";
import adminRoutes from "./routes/adminRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";

import {
  cacheMiddleware, TTL, invalidateEventCaches,
  getRedisInfo, buildKey, isRedisAvailable,
} from "./services/redisService";

dotenv.config();

const app = express();

// ── Trust proxy (for Nginx/load balancer) ─────────────────────
app.set("trust proxy", process.env.TRUST_PROXY || 1);

// ── Compression (gzip/brotli for all responses) ───────────────
app.use(compression({
  level: 6,
  threshold: 1024,        // only compress responses >1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));

// ── Security Headers ───────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // handled by Next.js frontend
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ── CORS ───────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
  "https://delhi-noida-events.vercel.app",
  ...(process.env.EXTRA_ORIGINS?.split(",") || []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id", "If-None-Match"],
  exposedHeaders: ["X-Cache", "X-RateLimit-Remaining", "ETag", "X-Response-Time"],
  maxAge: 86400, // preflight cache 24h
}));

// ── Request parsing ────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));          // reduced from 10mb — security
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Response time header ───────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    res.setHeader("X-Response-Time", `${ms}ms`);
    // Slow request logging (threshold: 2000ms)
    if (ms > 2000) {
      logger.warn(`🐌 Slow request: ${req.method} ${req.path} — ${ms}ms (status ${res.statusCode})`);
    }
  });
  next();
});

// ── Request timeout (15 seconds hard limit) ────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT_MS || "15000", 10);
  req.setTimeout(TIMEOUT, () => {
    logger.error(`⏰ Request timeout: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(503).json({ success: false, error: "Request timeout", code: "TIMEOUT" });
    }
  });
  next();
});

// ── HTTP Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  morgan.token("worker", () => process.env.pm_id || "0");
  app.use(morgan(":method :url :status :res[content-length] - :response-time ms [w::worker]", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req, res) => res.statusCode < 400 && req.path === "/api/v1/health",
  }));
}

// ── Rate Limiting ──────────────────────────────────────────────
// Use store: memory (switch to RedisStore in production for multi-instance)
const globalLimiter = rateLimit({
  windowMs:  60 * 1000,
  max: parseInt(process.env.GLOBAL_RATE_LIMIT || "200", 10),
  message: { success: false, error: "Too many requests. Slow down!", code: "RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/v1/health" || req.path === "/api/v1/ready",
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: "Search rate limit exceeded (60/min)", code: "RATE_LIMIT" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, error: "Too many auth attempts. Try again in 15 minutes.", code: "AUTH_RATE_LIMIT" },
  skipSuccessfulRequests: true,
});

const scraperLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Scraper trigger rate limit (5/hour)", code: "RATE_LIMIT" },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: "Write rate limit exceeded", code: "RATE_LIMIT" },
});

app.use("/api/", globalLimiter);
app.use("/api/v1/events/search", searchLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/admin/scraper/trigger", scraperLimiter);
app.use("/api/v1/bookmarks", writeLimiter);

// ── API Routes with granular caching ──────────────────────────
// Events — heavily cached (most traffic hits these)
app.use("/api/v1/events",
  cacheMiddleware(TTL.EVENTS_LIST, (r) => buildKey("http", r.originalUrl)),
  eventRoutes
);

// Auth — no caching (sensitive), strict rate limit
app.use("/api/v1/auth", authRoutes);

// Bookmarks — auth-aware, no global cache
app.use("/api/v1/bookmarks", bookmarkRoutes);

// Admin — short TTL cache
app.use("/api/v1/admin",
  cacheMiddleware(TTL.ADMIN_STATS, (r) => buildKey("admin", r.originalUrl), { varyByAuth: false }),
  adminRoutes
);

// Analytics — no cache
app.use("/api/v1/analytics", analyticsRoutes);

// Newsletter
app.use("/api/v1/newsletter", newsletterRoutes);

// ── Utility & Health Endpoints ─────────────────────────────────

/**
 * Health Check — lightweight (Kubernetes liveness probe)
 * Returns 200 immediately, checks nothing async
 */
app.get("/api/v1/health", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const mongoose = require("mongoose");
  res.json({
    success: true,
    status: "healthy",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    workerId: process.env.pm_id || "0",
    environment: process.env.NODE_ENV || "development",
    services: {
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      redis: isRedisAvailable() ? "connected" : "disabled",
      api: "operational",
    },
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      externalMB: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
  });
});

/**
 * Readiness Probe — Kubernetes readiness (checks DB connection)
 * Returns 503 if not ready to serve traffic
 */
app.get("/api/v1/ready", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const mongoose = require("mongoose");
  const dbOk = mongoose.connection.readyState === 1;

  if (!dbOk) {
    return res.status(503).json({ success: false, status: "not_ready", reason: "database_unavailable" });
  }
  res.json({ success: true, status: "ready" });
});

/**
 * Metrics Endpoint — lightweight system metrics (not Prometheus, but compatible format)
 */
app.get("/api/v1/metrics", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const mongoose = require("mongoose");
  const mem = process.memoryUsage();
  const redisInfo = await getRedisInfo().catch(() => ({ available: false }));

  res.json({
    success: true,
    pid: process.pid,
    workerId: process.env.pm_id || "0",
    uptime: process.uptime(),
    memory: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      external: mem.external,
    },
    process: {
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    },
    database: {
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    },
    cache: redisInfo,
  });
});

// Static metadata — long cache (24h)
app.get("/api/v1/cities",
  cacheMiddleware(TTL.CATEGORIES, () => buildKey("meta", "cities")),
  (_req, res) => res.json({ success: true, data: ["Delhi", "Noida"] })
);

app.get("/api/v1/categories",
  cacheMiddleware(TTL.CATEGORIES, () => buildKey("meta", "categories")),
  (_req, res) => res.json({
    success: true,
    data: [
      { name: "Tech", icon: "💻", slug: "tech", description: "Technology conferences, workshops, developer events" },
      { name: "Startup", icon: "🚀", slug: "startup", description: "Startup pitches, founder meetups, VC networking" },
      { name: "Cultural", icon: "🎭", slug: "cultural", description: "Art, music, theatre, dance, and cultural showcases" },
      { name: "Business", icon: "💼", slug: "business", description: "Corporate events, leadership summits, B2B networking" },
      { name: "Sports", icon: "⚽", slug: "sports", description: "Sports tournaments, marathons, fitness events" },
      { name: "Education", icon: "📚", slug: "education", description: "Workshops, training, bootcamps, seminars" },
      { name: "Entertainment", icon: "🎵", slug: "entertainment", description: "Concerts, movies, gaming, fun events" },
      { name: "Hackathon", icon: "⚡", slug: "hackathon", description: "24-72 hour coding competitions with prizes" },
      { name: "Meetup", icon: "🤝", slug: "meetup", description: "Casual networking, community meetups" },
      { name: "Conference", icon: "🎤", slug: "conference", description: "Large-scale industry conferences and expos" },
    ],
  })
);

// Cache invalidation webhook (called after scraper runs or manual events)
app.post("/api/v1/cache/invalidate",
  (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers["x-api-key"] || req.body?.apiKey;
    if (key !== process.env.SCRAPER_API_KEY) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    next();
  },
  async (_req: Request, res: Response) => {
    await invalidateEventCaches();
    res.json({ success: true, message: "Event caches invalidated" });
  }
);

app.get("/robots.txt", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.type("text/plain");
  res.send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/v1/admin",
    "Disallow: /api/v1/auth",
    "Disallow: /api/v1/analytics",
    `Sitemap: ${process.env.FRONTEND_URL || "https://delhi-noida-events.vercel.app"}/sitemap.xml`,
  ].join("\n"));
});

// ── 404 & Error Handlers ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Server Startup ────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5005", 10);
const HOST = process.env.HOST || "0.0.0.0";

// Memory monitor — warn at 80% of 512MB limit
const MEM_LIMIT_MB = parseInt(process.env.MEM_LIMIT_MB || "512", 10);
setInterval(() => {
  const usedMB = process.memoryUsage().heapUsed / 1024 / 1024;
  if (usedMB > MEM_LIMIT_MB * 0.8) {
    logger.warn(`⚠️ High memory usage: ${usedMB.toFixed(0)}MB / ${MEM_LIMIT_MB}MB`);
  }
}, 60_000);

async function startServer() {
  // Start DB connection in background to allow immediate server startup in Safe Mode
  connectDB().catch(err => logger.error(`Initial DB connection failed: ${err.message}`));

  const server = app.listen(PORT, HOST, () => {
    logger.info("\n" + "━".repeat(55));
    logger.info(`🚀 Delhi-Noida Events API  —  v1.0.0`);
    logger.info(`🌍 http://${HOST}:${PORT}/api/v1`);
    logger.info(`🏥 Health:   http://localhost:${PORT}/api/v1/health`);
    logger.info(`✅ Ready:    http://localhost:${PORT}/api/v1/ready`);
    logger.info(`📊 Metrics:  http://localhost:${PORT}/api/v1/metrics`);
    logger.info(`🌆 ENV:      ${process.env.NODE_ENV || "development"}`);
    logger.info(`🔧 Worker:   ${process.env.pm_id || "standalone"}`);
    
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      logger.warn(`🛡️  MODE:     SAFE MODE (Database Disconnected)`);
    } else {
      logger.info(`🗄️  DB:       Connected`);
    }
    
    logger.info("━".repeat(55) + "\n");
  });

  // HTTP keep-alive tuning — reduces connection overhead at high load
  server.keepAliveTimeout = 65_000;      // slightly above load balancer's
  server.headersTimeout   = 66_000;      // must be > keepAliveTimeout

  // ── Graceful Shutdown ────────────────────────────────────────
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n📴 ${signal} received. Graceful shutdown...`);

    // Stop accepting new requests
    server.close(async () => {
      try {
        const { disconnectDB } = await import("./config/database");
        await disconnectDB();
        logger.info("✅ Server shut down gracefully.");
      } catch (err: any) {
        logger.error(`Shutdown error: ${err.message}`);
      }
      process.exit(0);
    });

    // Force kill after 15 seconds
    setTimeout(() => {
      logger.error("⚠️ Forced shutdown after 15s timeout");
      process.exit(1);
    }, 15_000).unref();
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

  // PM2 graceful reload
  process.on("message", (msg: any) => {
    if (msg === "shutdown") gracefulShutdown("PM2_SHUTDOWN");
  });

  process.on("unhandledRejection", (reason: any) => {
    logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
    // Don't crash — log and continue
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
    // If truly uncaught, graceful shutdown
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  });
}

startServer();
export default app;
