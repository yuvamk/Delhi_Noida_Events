import { Response } from "express";
import Bookmark from "../models/Bookmark";
import Event from "../models/Event";
import Analytic from "../models/Analytic";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { syncBookmarkToSupabase } from "../services/supabaseSync";

// ─── GET /api/v1/bookmarks ────────────────────────────────────
export const getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = "1", limit = "12" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [bookmarks, total] = await Promise.all([
    Bookmark.find({ user: req.userId })
      .populate("event", "_id title date time city venue category price images verified featured slug tags organizer registrationUrl attendees capacity bookmarkCount viewCount")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Bookmark.countDocuments({ user: req.userId }),
  ]);

  res.json({
    success: true,
    data: bookmarks,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ─── POST /api/v1/bookmarks/:eventId ─────────────────────────
export const addBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const { note, notifyBefore } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, error: "Event not found", code: "NOT_FOUND" });

  const existing = await Bookmark.findOne({ user: req.userId, event: eventId });
  if (existing) {
    return res.status(409).json({ success: false, error: "Event already bookmarked", code: "ALREADY_BOOKMARKED" });
  }

  const bookmark = await Bookmark.create({
    user: req.userId,
    event: eventId,
    note: note || "",
    notifyBefore: notifyBefore || 24,
  });

  // Increment bookmark count (non-blocking)
  Event.findByIdAndUpdate(eventId, { $inc: { bookmarkCount: 1 } }).exec().catch(() => {});

  // Log analytics
  Analytic.create({ eventId, userId: req.userId, action: "bookmark" }).catch(() => {});

  // Sync to Supabase
  syncBookmarkToSupabase(req.userId as string, eventId, "add").catch(() => {});

  res.status(201).json({
    success: true,
    data: bookmark,
    message: "Event bookmarked!",
  });
});

// ─── DELETE /api/v1/bookmarks/:eventId ───────────────────────
export const removeBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;

  const bookmark = await Bookmark.findOneAndDelete({ user: req.userId, event: eventId });
  if (!bookmark) {
    return res.status(404).json({ success: false, error: "Bookmark not found", code: "NOT_FOUND" });
  }

  Event.findByIdAndUpdate(eventId, { $inc: { bookmarkCount: -1 } }).exec().catch(() => {});
  Analytic.create({ eventId, userId: req.userId, action: "unbookmark" }).catch(() => {});

  // Sync to Supabase
  syncBookmarkToSupabase(req.userId as string, eventId, "remove").catch(() => {});

  res.json({ success: true, message: "Bookmark removed" });
});

// ─── GET /api/v1/bookmarks/check/:eventId ────────────────────
export const checkBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const bookmark = await Bookmark.findOne({ user: req.userId, event: eventId }).lean();
  res.json({ success: true, isBookmarked: !!bookmark, bookmark: bookmark || null });
});

// ─── PUT /api/v1/bookmarks/:eventId/note ─────────────────────
export const updateBookmarkNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const { note } = req.body;

  const bookmark = await Bookmark.findOneAndUpdate(
    { user: req.userId, event: eventId },
    { note },
    { new: true }
  );
  if (!bookmark) return res.status(404).json({ success: false, error: "Bookmark not found" });
  res.json({ success: true, data: bookmark });
});
