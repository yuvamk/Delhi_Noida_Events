import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// ─── Generic validation middleware factory ────────────────────
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: messages,
      });
    }
    next();
  };
}

// ─── Schemas ──────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(72).required(),
  cityPreference: Joi.string().valid("Delhi", "Noida", "Both").default("Both"),
  categoryPreferences: Joi.array().items(Joi.string()).default([]),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const createEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  category: Joi.string()
    .valid("Tech", "Startup", "Cultural", "Business", "Sports", "Education", "Entertainment", "Hackathon", "Meetup", "Conference")
    .required(),
  city: Joi.string().valid("Delhi", "Noida").required(),
  venue: Joi.string().required(),
  address: Joi.string().required(),
  date: Joi.date().iso().min("now").required(),
  endDate: Joi.date().iso().min(Joi.ref("date")),
  time: Joi.string().required(),
  endTime: Joi.string(),
  price: Joi.object({
    amount: Joi.number().min(0).required(),
    currency: Joi.string().default("INR"),
    type: Joi.string().valid("Free", "Paid", "RSVP").required(),
  }).required(),
  registrationUrl: Joi.string().uri().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  tags: Joi.array().items(Joi.string().lowercase()).default([]),
  organizer: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string(),
    website: Joi.string().uri(),
  }).required(),
  capacity: Joi.number().integer().min(1),
  onlineEvent: Joi.boolean().default(false),
  onlineUrl: Joi.string().uri(),
});

export const updateEventSchema = createEventSchema.fork(
  ["title", "description", "category", "city", "venue", "address", "date", "time", "price", "registrationUrl", "organizer"],
  (schema) => schema.optional()
);

export const searchQuerySchema = Joi.object({
  q: Joi.string().max(200).allow(""),
  city: Joi.string().valid("Delhi", "Noida", "All").default("All"),
  category: Joi.string().default("All"),
  price_type: Joi.string().valid("Free", "Paid", "RSVP", "All").default("All"),
  sort: Joi.string().valid("date", "popular", "views", "rating").default("date"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  online: Joi.boolean(),
  featured: Joi.boolean(),
}).options({ allowUnknown: true });

export const bookmarkSchema = Joi.object({
  note: Joi.string().max(500).allow(""),
  notifyBefore: Joi.number().integer().min(0).max(168).default(24),
});

export const scraperTriggerSchema = Joi.object({
  sources: Joi.array()
    .items(Joi.string().valid("eventbrite", "meraevents", "meetup", "unstop", "linkedin", "iit_delhi", "corporate", "all"))
    .default(["all"]),
  city: Joi.string().valid("Delhi", "Noida", "both").default("both"),
  maxPages: Joi.number().integer().min(1).max(20).default(5),
});
