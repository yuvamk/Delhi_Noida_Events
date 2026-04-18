import { Router } from "express";
import {
  getAdminStats, getUsers, toggleFeatured, toggleVerified,
  getScraperLogs, getScraperStatus, triggerScraper,
  postScraperResult, batchUpsertEvents, cleanupOldEvents,
  startScraper, stopScraper,
} from "../controllers/adminController";
import { protect, adminOnly, superAdminOnly, scraperOnly } from "../middleware/auth";
import { validate, scraperTriggerSchema } from "../middleware/validation";

const router = Router();

// Python scraper callback endpoints (secured by API key in production)
// Note: These must be BEFORE the protect/adminOnly block
router.post("/scraper/callback/result",       scraperOnly, postScraperResult);
router.post("/scraper/callback/events",       scraperOnly, batchUpsertEvents);

// All other admin routes require auth + adminOnly
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.patch("/events/:id/feature", toggleFeatured);
router.patch("/events/:id/verify", toggleVerified);
router.get("/scraper/logs", getScraperLogs);
router.get("/scraper/status", getScraperStatus);
router.post("/scraper/start", startScraper);
router.post("/scraper/stop", stopScraper);
router.delete("/events/cleanup", cleanupOldEvents);

export default router;

