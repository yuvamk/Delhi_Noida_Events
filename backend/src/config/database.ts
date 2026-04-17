/**
 * MongoDB Connection — High-Traffic Configuration
 * ─────────────────────────────────────────────────────────────
 * Tuned for 10,000+ concurrent users:
 *  • maxPoolSize: 100 connections per worker
 *  • Auto-reconnect with exponential backoff
 *  • Read preference: nearest (fastest replica)
 *  • Write concern: majority (data safety)
 *  • Compression: zstd
 *  • Server selection timeout: 10s
 *  • Slow query tracking: >100ms
 */

import mongoose from "mongoose";
import { logger } from "../utils/logger";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/delhi_noida_events";

// Per PM2 worker, we get one connection pool.
// maxPoolSize * workers = total connections to MongoDB.
// E.g. 4 workers × 25 = 100 connections total.
const WORKERS = parseInt(process.env.WEB_CONCURRENCY || process.env.pm_id || "1", 10);
const PER_WORKER_POOL = Math.max(10, Math.floor(100 / WORKERS));

const options: mongoose.ConnectOptions = {
  // Connection pool
  maxPoolSize: PER_WORKER_POOL,   // connections per worker
  minPoolSize: 5,                 // always keep 5 warm

  // Timeouts
  serverSelectionTimeoutMS: 10_000,  // time to find a server
  socketTimeoutMS: 45_000,           // max idle socket time
  heartbeatFrequencyMS: 10_000,      // check replica health every 10s
  connectTimeoutMS: 10_000,          // initial socket connection

  // Write safety
  w: "majority",                  // wait for majority replicas
  wtimeoutMS: 5_000,              // write timeout
  journal: true,                  // wait for journal write

  // Read performance
  readPreference: "nearest",      // read from nearest replica

  // Compression (reduces bandwidth)
  compressors: ["zstd", "snappy", "zlib"],

  // Auto-index in dev only (creates indexes automatically)
  autoIndex: process.env.NODE_ENV !== "production",
};

export async function connectDB(): Promise<void> {
  let retries = 0;
  const MAX_RETRIES = 5;

  while (retries < MAX_RETRIES) {
    try {
      mongoose.set("strictQuery", false);
      mongoose.set("debug", process.env.MONGO_DEBUG === "true"); // log queries in dev

      // Connection events
      mongoose.connection.on("connected", () =>
        logger.info(`✅ MongoDB connected — ${mongoose.connection.name} (pool: ${PER_WORKER_POOL})`));
      mongoose.connection.on("error",       (err) => logger.error(`❌ MongoDB error: ${err.message}`));
      mongoose.connection.on("disconnected", ()   => logger.warn("⚠️ MongoDB disconnected"));
      mongoose.connection.on("reconnected",  ()   => logger.info("♻️ MongoDB reconnected"));

      // Slow query monitoring (>100ms)
      if (process.env.NODE_ENV === "production") {
        mongoose.set("debug", false);
        mongoose.connection.on("connected", () => {
          mongoose.connection.db?.command({ profile: 1, slowms: 100 }).catch(() => {});
        });
      }

      await mongoose.connect(MONGODB_URI, options);
      return; // Success

    } catch (error: any) {
      retries++;
      const wait = Math.min(1000 * 2 ** retries, 30_000); // exp backoff, max 30s
      logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
      if (retries >= MAX_RETRIES) {
        logger.error("MongoDB: max retries exceeded. Proceeding without database (Some features will be disabled).");
        return; // Don't exit, just return
      }
      logger.info(`Retrying MongoDB in ${wait / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close(true); // force close
    logger.info("✅ MongoDB connection closed.");
  } catch (err: any) {
    logger.error(`Error closing MongoDB: ${err.message}`);
  }
}

/** Check if DB is connected and responsive */
export async function isDBHealthy(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) return false;
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
}

export default connectDB;
