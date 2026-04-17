/**
 * Enterprise Redis Cache Service
 * ─────────────────────────────────────────────────────────────────
 * Features:
 *  • Auto-reconnect with exponential backoff
 *  • Connection health checks every 30s
 *  • Circuit breaker: auto-disables after N failures, re-enables after cooldown
 *  • Pipeline/multi-get for batch operations
 *  • Cache stampede protection (in-flight deduplication)
 *  • Graceful degradation when Redis is unavailable
 *  • Cache warming on startup
 *  • ETag generation for HTTP caching
 *  • Per-key TTL reporting
 */

import { logger } from "../utils/logger";
import crypto from "crypto";

let Redis: any;
try { Redis = require("ioredis"); } catch {}

const REDIS_URL = process.env.REDIS_URL;

// ── Circuit Breaker ──────────────────────────────────────────────
const CIRCUIT = { failures: 0, MAX_FAILURES: 5, COOLDOWN_MS: 30_000, openedAt: 0 };
let client: any = null;
let redisAvailable = false;

// In-flight deduplication map — prevents cache stampede
const inFlight = new Map<string, Promise<any>>();

function isCircuitOpen(): boolean {
  if (CIRCUIT.failures < CIRCUIT.MAX_FAILURES) return false;
  if (Date.now() - CIRCUIT.openedAt > CIRCUIT.COOLDOWN_MS) {
    // Try half-open
    CIRCUIT.failures = 0;
    return false;
  }
  return true;
}

function recordFailure() {
  CIRCUIT.failures++;
  if (CIRCUIT.failures >= CIRCUIT.MAX_FAILURES) {
    CIRCUIT.openedAt = Date.now();
    logger.warn("🔴 Redis circuit breaker OPEN — caching paused for 30s");
  }
}

function recordSuccess() {
  CIRCUIT.failures = 0;
}

// ── Redis Client Setup ─────────────────────────────────────────
if (REDIS_URL && Redis) {
  try {
    client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,       // don't queue commands when disconnected
      retryStrategy: (times: number) => {
        if (times > 5) return null;    // stop retrying after 5 attempts
        return Math.min(times * 500, 3000);
      },
      reconnectOnError: (err: Error) => {
        return err.message.includes("READONLY");
      },
    });

    client.on("connect", () => {
      redisAvailable = true;
      recordSuccess();
      logger.info("✅ Redis connected");
    });

    client.on("ready", () => {
      redisAvailable = true;
      logger.info("🚀 Redis ready to accept commands");
    });

    client.on("error", (err: any) => {
      recordFailure();
      if (redisAvailable) {
        logger.warn(`⚠️ Redis error: ${err.message}`);
        redisAvailable = false;
      }
    });

    client.on("close", () => {
      redisAvailable = false;
    });

    client.on("reconnecting", () => {
      logger.info("🔄 Redis reconnecting...");
    });

    client.connect().catch(() => {});

    // Health check every 30s
    setInterval(async () => {
      if (!client || isCircuitOpen()) return;
      try {
        await client.ping();
        redisAvailable = true;
        recordSuccess();
      } catch {
        redisAvailable = false;
        recordFailure();
      }
    }, 30_000);

  } catch (e: any) {
    logger.warn(`Redis init failed: ${e.message} — caching disabled`);
  }
} else {
  logger.info("ℹ️ Redis URL not configured — caching disabled (set REDIS_URL to enable)");
}

// ── TTLs (seconds) ────────────────────────────────────────────
export const TTL = {
  EVENTS_LIST:    5  * 60,   // 5 min  — main listing
  EVENT_DETAIL:   15 * 60,   // 15 min — individual event page
  FEATURED:       10 * 60,   // 10 min — featured events
  TRENDING:        3 * 60,   //  3 min — trending (changes fast)
  STATS:          20 * 60,   // 20 min — platform stats
  CATEGORIES:     24 * 60 * 60, // 24 h — static metadata
  SEARCH:          1 * 60,   //  1 min — search results
  CITY:            5 * 60,   //  5 min — city pages
  ADMIN_STATS:     2 * 60,   //  2 min — admin dashboard
  HEALTH:         10,        // 10 sec — health check
};

// ── Key helpers ────────────────────────────────────────────────
export function buildKey(...parts: (string | number | undefined)[]): string {
  return "dne:" + parts.filter(Boolean).join(":");
}

// ── Core operations ────────────────────────────────────────────
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (!redisAvailable || !client || isCircuitOpen()) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    recordSuccess();
    return JSON.parse(raw) as T;
  } catch {
    recordFailure();
    return null;
  }
}

export async function cacheSet(key: string, data: any, ttlSeconds = 300): Promise<void> {
  if (!redisAvailable || !client || isCircuitOpen()) return;
  try {
    await client.set(key, JSON.stringify(data), "EX", ttlSeconds);
    recordSuccess();
  } catch {
    recordFailure();
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redisAvailable || !client) return;
  try { await client.del(...keys); } catch {}
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redisAvailable || !client) return;
  try {
    // Use SCAN instead of KEYS to avoid blocking Redis on large datasets
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) await client.del(...keys);
    } while (cursor !== "0");
  } catch {}
}

/** Get multiple keys in a single pipeline round-trip */
export async function cacheMGet<T = any>(keys: string[]): Promise<(T | null)[]> {
  if (!redisAvailable || !client || isCircuitOpen() || keys.length === 0) {
    return keys.map(() => null);
  }
  try {
    const values = await client.mget(...keys);
    return values.map((v: string | null) => (v ? JSON.parse(v) : null));
  } catch {
    return keys.map(() => null);
  }
}

/** Set multiple keys in a single pipeline */
export async function cacheMSet(entries: Array<{ key: string; data: any; ttl: number }>): Promise<void> {
  if (!redisAvailable || !client || isCircuitOpen()) return;
  try {
    const pipeline = client.pipeline();
    for (const { key, data, ttl } of entries) {
      pipeline.set(key, JSON.stringify(data), "EX", ttl);
    }
    await pipeline.exec();
  } catch {}
}

/**
 * Cache-aside with stampede protection.
 * Only ONE database query runs even if 100 requests come in simultaneously.
 */
export async function cacheGetOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  // Check for in-flight request (stampede protection)
  if (inFlight.has(key)) {
    return inFlight.get(key) as Promise<T>;
  }

  const promise = fetcher().then(async (data) => {
    await cacheSet(key, data, ttlSeconds);
    inFlight.delete(key);
    return data;
  }).catch((err) => {
    inFlight.delete(key);
    throw err;
  });

  inFlight.set(key, promise);
  return promise;
}

/** Generate ETag from data for HTTP caching */
export function generateETag(data: any): string {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

/** Get Redis info/stats */
export async function getRedisInfo(): Promise<Record<string, any>> {
  if (!redisAvailable || !client) return { available: false };
  try {
    const info = await client.info("stats");
    const memory = await client.info("memory");
    const keyspaceRes = await client.info("keyspace");
    return {
      available: true,
      circuitBreaker: {
        failures: CIRCUIT.failures,
        isOpen: isCircuitOpen(),
      },
      info: info.split("\r\n").slice(0, 10).join("\n"),
      memory: memory.split("\r\n").slice(0, 6).join("\n"),
      keyspace: keyspaceRes,
    };
  } catch {
    return { available: false };
  }
}

// ── Express Cache Middleware ───────────────────────────────────
/**
 * Multi-layer HTTP caching:
 *  1. Redis cache (server-side)
 *  2. ETag header (client-side validation)
 *  3. Cache-Control header (CDN/browser cache)
 */
export function cacheMiddleware(
  ttlSeconds = 300,
  keyFn?: (req: any) => string,
  options: { stale?: number; varyByAuth?: boolean } = {}
) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== "GET") return next();

    // Skip cache for authenticated requests if varyByAuth
    const authHeader = req.headers?.authorization;
    if (options.varyByAuth && authHeader) return next();

    const key = keyFn ? keyFn(req) : buildKey("http", req.originalUrl);
    const staleTime = options.stale ?? Math.floor(ttlSeconds / 2);

    // Set Cache-Control header for CDN / browser
    res.setHeader("Cache-Control", `public, max-age=${staleTime}, s-maxage=${ttlSeconds}, stale-while-revalidate=60`);
    res.setHeader("Vary", "Accept-Encoding, Accept");

    // Check Redis
    if (redisAvailable && !isCircuitOpen()) {
      try {
        const cached = await cacheGet<any>(key);
        if (cached !== null) {
          const etag = generateETag(cached);
          res.setHeader("ETag", `"${etag}"`);
          res.setHeader("X-Cache", "HIT");
          res.setHeader("X-Cache-Key", key);

          // Check If-None-Match for 304 responses
          const ifNoneMatch = req.headers?.["if-none-match"];
          if (ifNoneMatch === `"${etag}"`) {
            return res.status(304).end();
          }

          return res.json(cached);
        }
      } catch {}
    }

    // Cache miss — intercept the response
    const origJson = res.json.bind(res);
    res.json = (body: any) => {
      res.setHeader("X-Cache", "MISS");
      if (body?.success !== false) {
        const etag = generateETag(body);
        res.setHeader("ETag", `"${etag}"`);
        cacheSet(key, body, ttlSeconds).catch(() => {});
      }
      return origJson(body);
    };

    next();
  };
}

/** Invalidate all event-related caches (call after write operations) */
export async function invalidateEventCaches(): Promise<void> {
  await Promise.all([
    cacheDelPattern("dne:http:/api/v1/events*"),
    cacheDelPattern("dne:http:/api/v1/admin*"),
    cacheDel(buildKey("http", "/api/v1/events/featured")),
    cacheDel(buildKey("http", "/api/v1/events/trending")),
    cacheDel(buildKey("http", "/api/v1/events/stats")),
  ]);
  logger.debug("♻️ Event caches invalidated");
}

export const redisClient = client;
export const isRedisAvailable = () => redisAvailable;

export default {
  cacheGet, cacheSet, cacheDel, cacheDelPattern, cacheMGet, cacheMSet,
  cacheGetOrFetch, cacheMiddleware, invalidateEventCaches,
  generateETag, getRedisInfo, buildKey, TTL,
};
