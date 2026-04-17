import { Request, Response } from "express";
import Analytic from "../models/Analytic";
import Event from "../models/Event";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// ─── POST /api/v1/analytics/track ────────────────────────────
export const trackEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, action, source, query, city, category, sessionId } = req.body;
  const authReq = req as AuthRequest;

  if (!action) return res.status(400).json({ success: false, error: "Action required" });

  await Analytic.create({
    eventId: eventId || undefined,
    userId: authReq.userId || undefined,
    sessionId,
    action,
    source,
    query,
    city,
    category,
    referrer: req.headers.referer,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    timestamp: new Date(),
  });

  // If it's a view, increment viewCount
  if (action === "view" && eventId) {
    Event.findByIdAndUpdate(eventId, { $inc: { viewCount: 1 } }).exec().catch(() => {});
  }

  res.json({ success: true });
});

// ─── GET /api/v1/analytics/summary ───────────────────────────
export const getAnalyticsSummary = asyncHandler(async (req: Request, res: Response) => {
  const { from = "7d" } = req.query;
  const daysMap: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[from as string] || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [actionBreakdown, topViewedEvents, searchQueries, cityBreakdown, dailyViews] = await Promise.all([
    Analytic.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]),
    Analytic.aggregate([
      { $match: { action: "view", timestamp: { $gte: since }, eventId: { $exists: true } } },
      { $group: { _id: "$eventId", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $lookup: { from: "events", localField: "_id", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $project: { views: 1, "event.title": 1, "event.city": 1, "event.category": 1 } },
    ]),
    Analytic.aggregate([
      { $match: { action: "search", timestamp: { $gte: since }, query: { $exists: true } } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Analytic.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]),
    Analytic.aggregate([
      { $match: { action: "view", timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    period: `${days} days`,
    data: {
      actionBreakdown,
      topViewedEvents,
      topSearchQueries: searchQueries,
      cityBreakdown,
      dailyViews,
    },
  });
});

// ─── GET /api/v1/analytics/events/:id ────────────────────────
export const getEventAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { from = "30d" } = req.query;
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[from as string] || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [dailyViews, actionCounts, event] = await Promise.all([
    Analytic.aggregate([
      { $match: { eventId: id, timestamp: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Analytic.aggregate([
      { $match: { eventId: id, timestamp: { $gte: since } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]),
    Event.findById(id).select("viewCount bookmarkCount rating").lean(),
  ]);

  res.json({ success: true, data: { dailyViews, actionCounts, event } });
});
