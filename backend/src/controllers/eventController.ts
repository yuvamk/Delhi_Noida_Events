import { Request, Response } from "express";
import mongoose, { FilterQuery, Types } from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Event, { IEvent } from "../models/Event";
import Analytic from "../models/Analytic";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { MOCK_EVENTS } from "../utils/mockData";
import { AuthRequest } from "../middleware/auth";

const CITIES = ["Delhi", "Noida"];
const CATEGORIES = ["Tech", "Startup", "Cultural", "Business", "Sports", "Education", "Entertainment", "Hackathon", "Meetup", "Conference"];

// ─── GET /api/v1/events ──────────────────────────────────────
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    logger.warn("Safe Mode: Database disconnected. Serving MOCK_EVENTS for Listing.");
    return res.json({
      success: true,
      data: MOCK_EVENTS,
      total: MOCK_EVENTS.length,
      page: 1,
      pages: 1,
      db_fallback: true
    });
  }

  const {
    page = "1",
    limit = "12",
    city,
    category,
    sort = "date",
    price_type,
    from,
    to,
    online,
    featured,
    search,
    q,           // alias for search (frontend sends q=)
  } = req.query;

  const query: FilterQuery<IEvent> = { status: "upcoming" };

  if (city && city !== "All") query.city = city;
  if (category && category !== "All") query.category = category;
  if (price_type && price_type !== "All") query["price.type"] = price_type;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from as string);
    if (to) query.date.$lte = new Date(to as string);
  }
  if (online === "true") query.onlineEvent = true;
  if (featured === "true") query.featured = true;

  // Text search — supports both search= and q= params
  const searchTerm = (q || search) as string | undefined;
  if (searchTerm && searchTerm.trim()) {
    query.$text = { $search: searchTerm };
  }

  // Sort
  let sortOption: Record<string, any> = { date: 1 };
  if (sort === "popular") sortOption = { bookmarkCount: -1 as const, viewCount: -1 as const };
  else if (sort === "views") sortOption = { viewCount: -1 as const };
  else if (sort === "rating") sortOption = { rating: -1 as const, ratingCount: -1 as const };
  else if (sort === "newest") sortOption = { createdAt: -1 as const };

  const pageNum = parseInt(page as string);
  const limitNum = Math.min(parseInt(limit as string), 50);
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort(sortOption as any)
      .skip(skip)
      .limit(limitNum)
      .lean()                          // plain JS objects — much faster than Mongoose docs
      .select("-agenda -sponsors"),    // exclude heavy fields from listing
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    hasNext: pageNum < Math.ceil(total / limitNum),
    hasPrev: pageNum > 1,
  });
});

// ─── GET /api/v1/events/featured ─────────────────────────────
export const getFeaturedEvents = asyncHandler(async (_req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: MOCK_EVENTS.slice(0, 3), total: 3, db_fallback: true });
  }

  const events = await Event.find({ featured: true, status: "upcoming" })
    .sort({ date: 1 })
    .limit(6)
    .lean();
  res.json({ success: true, data: events, total: events.length });
});

// ─── GET /api/v1/events/trending ──────────────────────────────
export const getTrendingEvents = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: MOCK_EVENTS.slice(0, 4), db_fallback: true });
  }

  const { city, limit = "8" } = req.query;
  const query: FilterQuery<IEvent> = { status: "upcoming" };
  if (city && city !== "All") query.city = city;

  const events = await Event.find(query)
    .sort({ bookmarkCount: -1, viewCount: -1 })
    .limit(parseInt(limit as string))
    .lean();
  res.json({ success: true, data: events });
});

// ─── GET /api/v1/events/search ────────────────────────────────
export const searchEvents = asyncHandler(async (req: Request, res: Response) => {
  const { q, city, category, price_type, page = "1", limit = "12" } = req.query;

  if (!q || !(q as string).trim()) {
    return res.status(400).json({ success: false, error: "Search query required", code: "MISSING_QUERY" });
  }

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    logger.warn("Safe Mode: Serving MOCK_EVENTS for Search.");
    return res.json({
      success: true,
      data: MOCK_EVENTS.filter(e => e.title.toLowerCase().includes((q as string).toLowerCase())),
      total: 0,
      page: 1,
      pages: 1,
      query: q,
      db_fallback: true
    });
  }

  const query: FilterQuery<IEvent> = {
    $text: { $search: q as string },
    status: "upcoming",
  };
  if (city && city !== "All") query.city = city;
  if (category && category !== "All") query.category = category;
  if (price_type && price_type !== "All") query["price.type"] = price_type;

  const pageNum = parseInt(page as string);
  const limitNum = Math.min(parseInt(limit as string), 50);

  const [events, total] = await Promise.all([
    Event.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    query: q,
  });
});

// ─── GET /api/v1/events/ai-search ─────────────────────────────
export const searchEventsAI = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || !(q as string).trim()) {
    return res.status(400).json({ success: false, error: "Search query required", code: "MISSING_QUERY" });
  }

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    logger.warn("Safe Mode: Database disconnected. Serving MOCK_EVENTS for AI Search.");
    return res.json({
      success: true,
      data: MOCK_EVENTS.slice(0, 5),
      total: 5,
      query: q,
      ai_powered: false,
      db_fallback: true,
      notice: "Safe Mode active. Search results are curated from mock catalog."
    });
  }

  // 1. Fetch available upcoming events (compressed payload for LLM)
  const availableEvents = await Event.find({ status: "upcoming" })
    .select("_id title category city tags ticketPrice date")
    .lean();

  if (availableEvents.length === 0) {
    return res.json({ success: true, data: [], total: 0, query: q });
  }

  // 2. Format catalog for AI parsing
  const catalogText = availableEvents.map(e => 
    `ID:${e._id}|Title:${e.title}|City:${e.city}|Category:${e.category}|Tags:${e.tags?.join(",")}|Price:${e.price?.amount || "0"}`
  ).join("\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY missing. Falling back to text search.");
    // Fallback gracefully to basic text search if AI isn't configured
    const query: FilterQuery<IEvent> = { $text: { $search: q as string }, status: "upcoming" };
    const events = await Event.find(query).limit(10).lean();
    return res.json({ success: true, data: events, total: events.length, notice: "AI offline, showing keyword matches." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an event discovery AI logic engine for a platform operating in Delhi and Noida.
User Request: "${q}"

Here is the catalog of currently available upcoming events:
${catalogText}

Task: Find ALL the event IDs from the catalog that best match the User Request. 
Consider partial city matches, pricing context (e.g., "cheap", "free", "expensive"), and categories/tags context to figure out the intent.

Return ONLY a valid JSON array of Object ID strings. Nothing else. No markdown formatting.
If no events match, return an empty array [].
Output format example: ["65cf85a...","65ee..."]`;

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text().trim();
    
    // Clean markdown blocks if Gemini stubbornly includes them
    if (aiResponse.startsWith("\`\`\`json")) {
      aiResponse = aiResponse.replace(/^\`\`\`json\n|\n\`\`\`$/g, "");
    }
    if (aiResponse.startsWith("\`\`\`")) {
      aiResponse = aiResponse.replace(/^\`\`\`\n|\n\`\`\`$/g, "");
    }

    const matchedIds: string[] = JSON.parse(aiResponse);

    if (!Array.isArray(matchedIds) || matchedIds.length === 0) {
      return res.json({ success: true, data: [], total: 0, query: q });
    }

    // 3. Fetch full populated events for those matched IDs
    const matchedEvents = await Event.find({ _id: { $in: matchedIds } }).lean();

    return res.json({
      success: true,
      data: matchedEvents,
      total: matchedEvents.length,
      query: q,
      ai_powered: true
    });

  } catch (error) {
    logger.error("AI Search Error: " + (error instanceof Error ? error.message : "Unknown"));
    return res.status(500).json({ success: false, error: "AI Processing Error", code: "AI_DOWN" });
  }
});

// ─── GET /api/v1/events/city/:city ───────────────────────────
export const getEventsByCity = asyncHandler(async (req: Request, res: Response) => {
  const { city } = req.params;
  if (!CITIES.includes(city)) {
    return res.status(400).json({ success: false, error: "Invalid city. Use Delhi or Noida", code: "INVALID_CITY" });
  }

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    const data = MOCK_EVENTS.filter(e => e.city === city);
    return res.json({ success: true, data, total: data.length, city, page: 1, pages: 1, db_fallback: true });
  }

  const { sort = "date", category, page = "1", limit = "12" } = req.query;
  const query: FilterQuery<IEvent> = { city, status: "upcoming" };
  if (category && category !== "All") query.category = category;

  const sortOption: any = sort === "popular" ? { bookmarkCount: -1 } : { date: 1 };
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [events, total] = await Promise.all([
    Event.find(query).sort(sortOption).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Event.countDocuments(query),
  ]);

  res.json({ success: true, data: events, total, city, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── GET /api/v1/events/category/:category ───────────────────
export const getEventsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { city, page = "1", limit = "12" } = req.query;
  const query: FilterQuery<IEvent> = { category, status: "upcoming" };
  if (city && city !== "All") query.city = city;

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    const data = MOCK_EVENTS.filter(e => e.category === category && (!city || city === "All" || e.city === city));
    return res.json({ success: true, data, total: data.length, category, page: 1, pages: 1, db_fallback: true });
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [events, total] = await Promise.all([
    Event.find(query).sort({ date: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Event.countDocuments(query),
  ]);

  res.json({ success: true, data: events, total, category, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── GET /api/v1/events/:identifier ─────────────────────────
export const getEventById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { identifier } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    const event = MOCK_EVENTS.find(e => e._id === identifier || e.slug === identifier);
    if (!event) return res.status(404).json({ success: false, error: "Event not found", code: "NOT_FOUND" });
    return res.json({ success: true, data: event, relatedEvents: MOCK_EVENTS.filter(e => e._id !== event._id).slice(0, 3), db_fallback: true });
  }

  const event = isObjectId
    ? await Event.findById(identifier)
    : await Event.findOne({ slug: identifier });

  if (!event) {
    return res.status(404).json({ success: false, error: "Event not found", code: "NOT_FOUND" });
  }

  // Increment view count (non-blocking)
  Event.findByIdAndUpdate(event._id, { $inc: { viewCount: 1 } }).exec().catch(() => {});

  // Log analytics (non-blocking)
  Analytic.create({
    eventId: event._id,
    userId: req.userId,
    action: "view",
    sessionId: req.headers["x-session-id"] as string,
    referrer: req.headers.referer,
    userAgent: req.headers["user-agent"],
  }).catch(() => {});

  // Related events (same category or city, upcoming, excluding current)
  const related = await Event.find({
    _id: { $ne: event._id },
    status: "upcoming",
    $or: [{ category: event.category }, { city: event.city }],
  })
    .sort({ date: 1 })
    .limit(3)
    .lean();

  res.json({ success: true, data: event, relatedEvents: related });
});

// ─── POST /api/v1/events (admin) ─────────────────────────────
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.create({ ...req.body, verified: true, source: "manual" });
  logger.info(`Event created manually: ${event.title} by ${req.userId}`);
  res.status(201).json({ success: true, data: event, message: "Event created successfully" });
});

// ─── PUT /api/v1/events/:id (admin) ──────────────────────────
export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return res.status(404).json({ success: false, error: "Event not found", code: "NOT_FOUND" });
  logger.info(`Event updated: ${event.title} by ${req.userId}`);
  res.json({ success: true, data: event, message: "Event updated" });
});

// ─── DELETE /api/v1/events/:id (admin) ───────────────────────
export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: "Event not found", code: "NOT_FOUND" });
  logger.info(`Event deleted: ${event.title} by ${req.userId}`);
  res.json({ success: true, message: "Event deleted successfully" });
});

// ─── GET /api/v1/events/stats ─────────────────────────────────
export const getEventStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalEvents,
    upcomingEvents,
    freeEvents,
    featuredCount,
    byCity,
    byCategory,
    topEvents,
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: "upcoming" }),
    Event.countDocuments({ "price.type": "Free", status: "upcoming" }),
    Event.countDocuments({ featured: true }),
    Event.aggregate([
      { $match: { status: "upcoming" } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]),
    Event.aggregate([
      { $match: { status: "upcoming" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Event.find({ status: "upcoming" })
      .sort({ bookmarkCount: -1 })
      .limit(5)
      .select("title city bookmarkCount viewCount")
      .lean(),
  ]);

  const totalViews = await Event.aggregate([
    { $group: { _id: null, total: { $sum: "$viewCount" } } },
  ]);
  const totalBookmarks = await Event.aggregate([
    { $group: { _id: null, total: { $sum: "$bookmarkCount" } } },
  ]);

  res.json({
    success: true,
    data: {
      totalEvents,
      upcomingEvents,
      freeEvents,
      featuredCount,
      totalViews: totalViews[0]?.total || 0,
      totalBookmarks: totalBookmarks[0]?.total || 0,
      byCity: byCity.reduce((acc: any, c) => { acc[c._id] = c.count; return acc; }, {}),
      byCategory,
      topEvents,
    },
  });
});
