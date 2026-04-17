import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  note?: string;
  notifyBefore?: number; // hours before event
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    note: { type: String, maxlength: 500 },
    notifyBefore: { type: Number, default: 24 },
  },
  { timestamps: true }
);

BookmarkSchema.index({ user: 1, event: 1 }, { unique: true });
BookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark: Model<IBookmark> = mongoose.models.Bookmark || mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
export default Bookmark;
