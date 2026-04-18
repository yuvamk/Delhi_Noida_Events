import { Request, Response } from "express";
import Event from "../models/Event";
import { asyncHandler } from "../middleware/errorHandler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── GET /api/v1/events ───────────────────────────────────────
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await Event.find({ isActive: true }).sort({ date: 1 });
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/featured ──────────────────────────────
export const getFeaturedEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await Event.find({ isActive: true, isFeatured: true }).limit(10);
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/trending ──────────────────────────────
export const getTrendingEvents = asyncHandler(async (req: Request, res: Response) => {
  // Simple trending logic: featured + recent
  const events = await Event.find({ isActive: true }).sort({ createdAt: -1 }).limit(6);
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/search ────────────────────────────────
export const searchEvents = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const events = await Event.find({
    isActive: true,
    $or: [
      { title: { $regex: q as string, $options: "i" } },
      { description: { $regex: q as string, $options: "i" } },
      { tags: { $in: [new RegExp(q as string, "i")] } }
    ]
  });
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/ai-search ─────────────────────────────
export const searchEventsAI = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, error: "Query is required" });

  try {
    const allEvents = await Event.find({ isActive: true }).limit(50).select("title description category venue city date tags");
    const context = allEvents.map(e => ({
      id: e._id,
      title: e.title,
      desc: e.description?.substring(0, 100),
      cat: e.category,
      loc: `${e.venue}, ${e.city}`,
      tags: e.tags
    }));

    const prompt = `
      You are an AI Event Concierge for "Delhi Noida Events". 
      User Query: "${query}"
      Available Events JSON: ${JSON.stringify(context)}
      Return ONLY a JSON array of event IDs that match the query, ordered by relevance.
      If no matches, return [].
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const matchedIds = JSON.parse(text.replace(/```json|```/g, "").trim());

    const matchedEvents = await Event.find({ _id: { $in: matchedIds } });
    const sortedEvents = matchedIds.map((id: string) => matchedEvents.find(e => e._id.toString() === id)).filter(Boolean);

    res.json({ success: true, count: sortedEvents.length, data: sortedEvents, aiInfo: "Curated via Gemini AI" });
  } catch (error) {
    logger.error("AI Search Error: " + error);
    res.status(500).json({ success: false, error: "AI reasoning failed" });
  }
});

// ─── GET /api/v1/events/city/:city ────────────────────────────
export const getEventsByCity = asyncHandler(async (req: Request, res: Response) => {
  const { city } = req.params;
  let cityQuery: any = new RegExp(city, "i");
  if (city.toLowerCase() === "delhi") {
    cityQuery = { $in: [new RegExp("delhi", "i"), new RegExp("gurgaon", "i")] };
  } else if (city.toLowerCase() === "noida") {
    cityQuery = { $in: [new RegExp("noida", "i"), new RegExp("greater noida", "i")] };
  }
  
  const events = await Event.find({ isActive: true, city: cityQuery });
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/category/:category ────────────────────
export const getEventsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const events = await Event.find({ isActive: true, category: new RegExp(category, "i") });
  res.json({ success: true, count: events.length, data: events });
});

// ─── GET /api/v1/events/:identifier ───────────────────────────
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const event = await Event.findOne({
    $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { slug: identifier }]
  });
  if (!event) return res.status(404).json({ success: false, error: "Event not found" });
  res.json({ success: true, data: event });
});

// ─── POST /api/v1/events ──────────────────────────────────────
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, data: event });
});

// ─── PUT /api/v1/events/:id ───────────────────────────────────
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: event });
});

// ─── DELETE /api/v1/events/:id ────────────────────────────────
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Event deleted" });
});

// ─── GET /api/v1/events/stats ─────────────────────────────────
export const getEventStats = asyncHandler(async (req: Request, res: Response) => {
  const total = await Event.countDocuments();
  const byCity = await Event.aggregate([{ $group: { _id: "$city", count: { $sum: 1 } } }]);
  res.json({ success: true, data: { total, byCity } });
});
