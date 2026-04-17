import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAnalytic extends Document {
  eventId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  action: "view" | "bookmark" | "unbookmark" | "register_click" | "share" | "search";
  source?: string; // where the action came from (home, search, category, etc.)
  query?: string; // for search events
  city?: string;
  category?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  timestamp: Date;
}

const AnalyticSchema = new Schema<IAnalytic>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    action: {
      type: String,
      required: true,
      enum: ["view", "bookmark", "unbookmark", "register_click", "share", "search"],
    },
    source: { type: String },
    query: { type: String },
    city: { type: String },
    category: { type: String },
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    country: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AnalyticSchema.index({ timestamp: -1 });
AnalyticSchema.index({ eventId: 1, action: 1 });
AnalyticSchema.index({ action: 1, timestamp: -1 });
// TTL: auto-delete analytics older than 90 days
AnalyticSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Analytic: Model<IAnalytic> =
  mongoose.models.Analytic || mongoose.model<IAnalytic>("Analytic", AnalyticSchema);
export default Analytic;
