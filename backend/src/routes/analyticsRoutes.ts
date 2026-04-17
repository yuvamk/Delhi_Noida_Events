import { Router } from "express";
import { trackEvent, getAnalyticsSummary, getEventAnalytics } from "../controllers/analyticsController";
import { optionalAuth, protect, adminOnly } from "../middleware/auth";

const router = Router();

router.post("/track",           optionalAuth,            trackEvent);
router.get("/summary",          protect, adminOnly,      getAnalyticsSummary);
router.get("/events/:id",       protect, adminOnly,      getEventAnalytics);

export default router;
