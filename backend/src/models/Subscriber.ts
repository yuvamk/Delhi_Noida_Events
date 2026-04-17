import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  subscribedAt: Date;
  status: "subscribed" | "unsubscribed";
  preferences?: string[];
}

const SubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["subscribed", "unsubscribed"], default: "subscribed" },
  preferences: [{ type: String }],
});

export default mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
