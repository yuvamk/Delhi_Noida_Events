import { Router } from "express";
import {
  getEvents, getFeaturedEvents, getTrendingEvents, searchEvents,
  getEventsByCity, getEventsByCategory, getEventById,
  createEvent, updateEvent, deleteEvent, getEventStats,
  searchEventsAI
} from "../controllers/eventController";
import { protect, optionalAuth, adminOnly } from "../middleware/auth";
import { validate, createEventSchema, updateEventSchema } from "../middleware/validation";

const router = Router();

// Public routes
router.get("/",                   getEvents);
router.get("/featured",           getFeaturedEvents);
router.get("/trending",           getTrendingEvents);
router.get("/search",             searchEvents);
router.get("/ai-search",          searchEventsAI);
router.get("/stats",              getEventStats);
router.get("/city/:city",         getEventsByCity);
router.get("/category/:category", getEventsByCategory);
router.get("/:identifier",        optionalAuth, getEventById);  // by ID or slug

// Admin routes (protected)
router.post("/",    protect, adminOnly, validate(createEventSchema), createEvent);
router.put("/:id",  protect, adminOnly, validate(updateEventSchema), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

export default router;
