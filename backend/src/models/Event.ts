import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  city: string;
  venue: string;
  address: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  date: Date;
  endDate?: Date;
  time: string;
  endTime?: string;
  timezone: string;
  price: {
    amount: number;
    currency: string;
    type: "Free" | "Paid" | "RSVP";
    earlyBirdAmount?: number;
    earlyBirdDeadline?: Date;
  };
  registrationUrl: string;
  images: string[];
  thumbnail?: string;
  tags: string[];
  organizer: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    logo?: string;
    verified: boolean;
  };
  capacity?: number;
  attendees: number;
  source: string;
  sourceUrl: string;
  sourceId?: string;
  featured: boolean;
  verified: boolean;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  viewCount: number;
  bookmarkCount: number;
  rating?: number;
  ratingCount?: number;
  onlineEvent: boolean;
  onlineUrl?: string;
  agenda?: Array<{ time: string; title: string; speaker?: string }>;
  speakers?: Array<{ name: string; bio?: string; photo?: string; designation?: string }>;
  sponsors?: Array<{ name: string; logo?: string; tier?: string }>;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 5000 },
    shortDescription: { type: String, maxlength: 300 },
    category: {
      type: String,
      required: true,
      default: "Other"
    },
    subcategory: { type: String },
    city: { type: String, required: true, default: "NCR" },
    venue: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [77.2090, 28.6139] }, // Delhi default
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, required: true, default: "TBD" },
    endTime: { type: String },
    timezone: { type: String, default: "Asia/Kolkata" },
    price: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "INR" },
      type: { type: String, enum: ["Free", "Paid", "RSVP"], default: "Free" },
      earlyBirdAmount: { type: Number },
      earlyBirdDeadline: { type: Date },
    },
    registrationUrl: { type: String, required: true },
    images: [{ type: String }],
    thumbnail: { type: String },
    tags: [{ type: String, lowercase: true }],
    organizer: {
      name: { type: String, default: "Community Organizer" },
      email: { type: String },
      phone: { type: String },
      website: { type: String },
      logo: { type: String },
      verified: { type: Boolean, default: false },
    },
    capacity: { type: Number, min: 0 },
    attendees: { type: Number, default: 0, min: 0 },
    source: { type: String, required: true }, // eventbrite | meetup | unstop | meraevents | linkedin | iit_delhi | corporate | manual
    sourceUrl: { type: String, required: true },
    sourceId: { type: String },
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["upcoming", "ongoing", "completed", "cancelled"], default: "upcoming" },
    viewCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    onlineEvent: { type: Boolean, default: false },
    onlineUrl: { type: String },
    agenda: [{ time: String, title: String, speaker: String }],
    speakers: [{ name: String, bio: String, photo: String, designation: String }],
    sponsors: [{ name: String, logo: String, tier: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Removed redundant slug and city/date/category indexes to fix Mongoose duplication warnings
EventSchema.index({ date: 1 });
EventSchema.index({ featured: 1, date: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ location: "2dsphere" });
EventSchema.index(
  { title: "text", description: "text", tags: "text", venue: "text", organizer_name: "text" },
  { weights: { title: 10, tags: 5, venue: 3, description: 1 }, name: "event_text_index" }
);

// Virtual: isFull
EventSchema.virtual("isFull").get(function (this: IEvent) {
  if (!this.capacity) return false;
  return this.attendees >= this.capacity;
});

// Virtual: spotsLeft
EventSchema.virtual("spotsLeft").get(function (this: IEvent) {
  if (!this.capacity) return null;
  return Math.max(0, this.capacity - this.attendees);
});

// Pre-save: auto-generate slug
EventSchema.pre("save", function (this: IEvent, next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) + `-${Date.now()}`;
  }
  // Auto-generate short description
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.slice(0, 280).trim() + (this.description.length > 280 ? "..." : "");
  }
  next();
});

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default Event;
