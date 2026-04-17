/**
 * Newsletter controller — subscribe endpoint
 */
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import Subscriber from "../models/Subscriber";
import supabase from "../config/supabase";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Valid email required" });
  }

  const existing = await Subscriber.findOne({ email });
  if (existing && existing.status === "subscribed") {
    return res.json({ success: true, message: "You're already subscribed!", alreadySubscribed: true });
  }

  if (existing) {
    existing.status = "subscribed";
    await existing.save();
  } else {
    await Subscriber.create({ email });
  }

  // Sync to Supabase
  if (supabase) {
    supabase.from("subscribers").upsert({ email, subscribed_at: new Date() }).catch(() => {});
  }

  logger.info(`New newsletter subscription: ${email}`);
  
  res.json({ 
    success: true, 
    message: "Welcome to Delhi-NCR's best events digest! 🎉 Check your inbox soon." 
  });
});
