import { Router } from "express";
import {
  getAdminStats, getUsers, toggleFeatured, toggleVerified,
  getScraperLogs, getScraperStatus, triggerScraper,
  postScraperResult, batchUpsertEvents, cleanupOldEvents,
} from "../controllers/adminController";
import { protect, adminOnly, superAdminOnly } from "../middleware/auth";
import { validate, scraperTriggerSchema } from "../middleware/validation";

const router = Router();

// All admin routes require auth + adminOnly
router.use(protect, adminOnly);

// Dashboard
router.get("/stats",                          getAdminStats);
router.get("/users",                          getUsers);

// Event management
router.patch("/events/:id/feature",           toggleFeatured);
router.patch("/events/:id/verify",            toggleVerified);
router.delete("/events/cleanup",              superAdminOnly, cleanupOldEvents);

// Scraper
router.get("/scraper/status",                 getScraperStatus);
router.get("/scraper/logs",                   getScraperLogs);
router.post("/scraper/trigger",               validate(scraperTriggerSchema), triggerScraper);

// Python scraper callback endpoints (secured by API key in production)
router.post("/scraper/callback/result",       postScraperResult);
router.post("/scraper/callback/events",       batchUpsertEvents);

export default router;

