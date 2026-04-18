import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";
import ScraperLog from "../models/ScraperLog";
import Analytic from "../models/Analytic";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { scraperManager } from "../services/ScraperManager";

// ─── GET /api/v1/admin/stats ──────────────────────────────────
export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalEvents,
    upcomingEvents,
    totalUsers,
    recentUsers,
    freeEvents,
    paidEvents,
    featuredEvents,
    verifiedEvents,
    byCity,
    byCategory,
    bySource,
    recentScraperLogs,
    topEvents,
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: "upcoming" }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    Event.countDocuments({ "price.type": "Free" }),
    Event.countDocuments({ "price.type": "Paid" }),
    Event.countDocuments({ featured: true }),
    Event.countDocuments({ verified: true }),
    Event.aggregate([{ $group: { _id: "$city", count: { $sum: 1 } } }]),
    Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Event.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ScraperLog.find().sort({ startedAt: -1 }).limit(5).lean(),
    Event.find({ status: "upcoming" })
      .sort({ viewCount: -1 })
      .limit(10)
      .select("title city category viewCount bookmarkCount date featured verified")
      .lean(),
  ]);

  const totalViews = await Event.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]);
  const totalBookmarks = await Event.aggregate([{ $group: { _id: null, total: { $sum: "$bookmarkCount" } } }]);

  // Analytics last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const analyticsThisWeek = await Analytic.aggregate([
    { $match: { timestamp: { $gte: weekAgo } } },
    { $group: { _id: "$action", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      events: { total: totalEvents, upcoming: upcomingEvents, free: freeEvents, paid: paidEvents, featured: featuredEvents, verified: verifiedEvents },
      users: { total: totalUsers, newThisWeek: recentUsers },
      engagement: {
        totalViews: totalViews[0]?.total || 0,
        totalBookmarks: totalBookmarks[0]?.total || 0,
        weeklyActions: analyticsThisWeek,
      },
      byCity,
      byCategory,
      bySource,
      recentScraperLogs,
      topEvents,
    },
  });
});

// ─── GET /api/v1/admin/users ──────────────────────────────────
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "20", search, role } = req.query;
  const query: any = {};
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  if (role) query.role = role;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [users, total] = await Promise.all([
    User.find(query).select("-password -emailVerificationToken -passwordResetToken")
      .sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── PATCH /api/v1/admin/events/:id/feature ──────────────────
export const toggleFeatured = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: "Event not found" });

  event.featured = !event.featured;
  await event.save();

  logger.info(`Event ${event._id} featured toggled to ${event.featured} by ${req.userId}`);
  res.json({ success: true, data: event, message: `Event ${event.featured ? "featured" : "unfeatured"}` });
});

// ─── PATCH /api/v1/admin/events/:id/verify ───────────────────
export const toggleVerified = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: "Event not found" });

  event.verified = !event.verified;
  await event.save();
  res.json({ success: true, data: event, message: `Event ${event.verified ? "verified" : "unverified"}` });
});

// ─── GET /api/v1/admin/scraper/logs ──────────────────────────
export const getScraperLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "20", source, status } = req.query;
  const query: any = {};
  if (source) query.source = source;
  if (status) query.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [logs, total] = await Promise.all([
    ScraperLog.find(query).sort({ startedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    ScraperLog.countDocuments(query),
  ]);

  res.json({ success: true, data: logs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── GET /api/v1/admin/scraper/status ────────────────────────
export const getScraperStatus = asyncHandler(async (_req: Request, res: Response) => {
  const sources = ["eventbrite", "meraevents", "meetup", "unstop", "linkedin", "iit_delhi", "corporate", "facebook"];

  const statuses = await Promise.all(
    sources.map(async (source) => {
      const lastLog = await ScraperLog.findOne({ source }).sort({ startedAt: -1 }).lean();
      const eventsFromSource = await Event.countDocuments({ source });
      return {
        source,
        status: lastLog?.status || "never_run",
        lastRun: lastLog?.startedAt || null,
        lastRunStatus: lastLog?.status || "N/A",
        eventsFound: lastLog?.eventsFound || 0,
        eventsInserted: lastLog?.eventsInserted || 0,
        totalEventsInDB: eventsFromSource,
        duration: lastLog?.durationMs ? `${(lastLog.durationMs / 1000).toFixed(1)}s` : "N/A",
      };
    })
  );

  const runningJob = await ScraperLog.findOne({ status: "running" }).lean();
  const liveStatus = scraperManager.getStatus();

  res.json({
    success: true,
    data: {
      sources: statuses,
      currentlyRunning: !!runningJob || liveStatus.running,
      liveStatus,
      runningJob: runningJob || null,
      nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  });
});

// ─── POST /api/v1/admin/scraper/start ───────────────────────
export const startScraper = asyncHandler(async (req: AuthRequest, res: Response) => {
  const success = await scraperManager.start();
  
  if (success) {
    logger.info(`Scraper process started by admin ${req.userId}`);
    res.json({ success: true, message: "Scraper process started successfully" });
  } else {
    res.status(500).json({ success: false, error: "Failed to start scraper process" });
  }
});

// ─── POST /api/v1/admin/scraper/stop ────────────────────────
export const stopScraper = asyncHandler(async (req: AuthRequest, res: Response) => {
  const success = scraperManager.stop();
  
  if (success) {
    logger.info(`Scraper process stop requested by admin ${req.userId}`);
    res.json({ success: true, message: "Scraper stop signal sent" });
  } else {
    res.status(400).json({ success: false, error: "No scraper process running" });
  }
});

// Alias for backwards compatibility or manual triggers
export const triggerScraper = startScraper;

// ─── POST /api/v1/admin/scraper/logs (from Python) ───────────
export const postScraperResult = asyncHandler(async (req: Request, res: Response) => {
  const { jobId, source, status, eventsFound, eventsInserted, eventsUpdated, duplicatesRemoved,
    durationMs, errorMessage, pagesScraped, requestsMade, meta } = req.body;

  const log = await ScraperLog.findOneAndUpdate(
    { jobId },
    {
      status,
      eventsFound: eventsFound || 0,
      eventsInserted: eventsInserted || 0,
      eventsUpdated: eventsUpdated || 0,
      duplicatesRemoved: duplicatesRemoved || 0,
      durationMs,
      errorMessage,
      pagesScraped,
      requestsMade,
      meta,
      completedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  logger.info(`Scraper result received: ${source} → ${status} (${eventsInserted} inserted)`);
  res.json({ success: true, data: log });
});

// ─── POST /api/v1/admin/scraper/events (batch from Python) ───
export const batchUpsertEvents = asyncHandler(async (req: Request, res: Response) => {
  const { events, jobId } = req.body;
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ success: false, error: "Events array required" });
  }

  const results = { inserted: 0, updated: 0, failed: 0 };

  for (let eventData of events) {
    try {
      // ─── Data Normalization ───────────────────────────────────
      // 1. Normalize City
      if (eventData.city) {
        if (eventData.city.toLowerCase().includes("gurugram")) eventData.city = "Gurgaon";
        if (eventData.city.toLowerCase().includes("new delhi")) eventData.city = "Delhi";
      }

      // 2. Ensure Organizer Name
      if (!eventData.organizer?.name) {
        eventData.organizer = { 
          ...(eventData.organizer || {}), 
          name: eventData.source || "Event Organizer" 
        };
      }

      // 3. Trim and Clean Strings
      if (eventData.title) eventData.title = eventData.title.trim();
      if (eventData.category) {
        // Simple capitalization check
        eventData.category = eventData.category.charAt(0).toUpperCase() + eventData.category.slice(1).toLowerCase();
      }
      if (eventData.city) {
        eventData.city = eventData.city.charAt(0).toUpperCase() + eventData.city.slice(1);
      }
      
      // 4. Force active by default for frontend visibility
      eventData.isActive = true;
      // ──────────────────────────────────────────────────────────

      // Find existing event by source and sourceUrl
      let event = await Event.findOne({ 
        source: eventData.source, 
        sourceUrl: eventData.sourceUrl 
      });

      if (event) {
        // Update existing
        event.set(eventData);
        await event.save();
        results.updated++;
      } else {
        // Create new
        event = new Event(eventData);
        await event.save();
        results.inserted++;
      }
    } catch (error: any) {
      results.failed++;
      logger.error(`Failed to upsert event "${eventData.title}": ${error.message}`);
    }
  }

  logger.info(`Batch upsert: ${results.inserted} inserted, ${results.updated} updated, ${results.failed} failed (job: ${jobId})`);
  res.json({ success: true, results, total: events.length });
});

// ─── DELETE /api/v1/admin/events/cleanup ─────────────────────
export const cleanupOldEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { days = 30 } = req.query;
  const cutoff = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
  const result = await Event.deleteMany({ date: { $lt: cutoff }, status: "completed" });
  logger.info(`Cleanup: removed ${result.deletedCount} events older than ${days} days`);
  res.json({ success: true, deletedCount: result.deletedCount, message: `Removed ${result.deletedCount} stale events` });
});
