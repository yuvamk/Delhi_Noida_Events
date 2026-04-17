import mongoose, { Document, Schema, Model } from "mongoose";

export interface IScraperLog extends Document {
  jobId: string;
  source: string;
  status: "running" | "success" | "failed" | "partial";
  eventsFound: number;
  eventsInserted: number;
  eventsUpdated: number;
  duplicatesRemoved: number;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  errorMessage?: string;
  errorStack?: string;
  triggeredBy: "scheduler" | "manual" | "api";
  triggeredByUser?: mongoose.Types.ObjectId;
  pagesScraped?: number;
  requestsMade?: number;
  meta?: Record<string, unknown>;
}

const ScraperLogSchema = new Schema<IScraperLog>(
  {
    jobId: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    status: { type: String, enum: ["running", "success", "failed", "partial"], default: "running" },
    eventsFound: { type: Number, default: 0 },
    eventsInserted: { type: Number, default: 0 },
    eventsUpdated: { type: Number, default: 0 },
    duplicatesRemoved: { type: Number, default: 0 },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    durationMs: { type: Number },
    errorMessage: { type: String },
    errorStack: { type: String, select: false },
    triggeredBy: { type: String, enum: ["scheduler", "manual", "api"], default: "scheduler" },
    triggeredByUser: { type: Schema.Types.ObjectId, ref: "User" },
    pagesScraped: { type: Number, default: 0 },
    requestsMade: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: false }
);

ScraperLogSchema.index({ source: 1, startedAt: -1 });
ScraperLogSchema.index({ status: 1 });
ScraperLogSchema.index({ startedAt: -1 });

const ScraperLog: Model<IScraperLog> =
  mongoose.models.ScraperLog || mongoose.model<IScraperLog>("ScraperLog", ScraperLogSchema);
export default ScraperLog;
