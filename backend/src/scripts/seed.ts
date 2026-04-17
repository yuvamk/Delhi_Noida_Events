/**
 * Seed Script — creates admin user (admin@gmail.com / admin@123)
 * and inserts sample events for testing.
 * Run: npx ts-node src/scripts/seed.ts
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User";
import Event from "../models/Event";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/delhi_noida_events";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // ── Create Admin User ────────────────────────────────────────
  const adminEmail = "admin@gmail.com";
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    // Ensure role is admin
    if (existing.role !== "admin") {
      await User.findByIdAndUpdate(existing._id, { role: "admin" });
      console.log("✅ Existing user promoted to admin:", adminEmail);
    } else {
      console.log("✅ Admin user already exists:", adminEmail);
    }
  } else {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: "admin@123",
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      cityPreference: "Both",
      categoryPreferences: ["Tech", "Startup", "Hackathon"],
    });
    console.log("✅ Admin user created:", adminEmail, "/ admin@123");
  }

  // ── Insert Sample Events ──────────────────────────────────────
  const sampleEvents = [
    {
      title: "Delhi Tech Summit 2025",
      description: "The biggest tech conference in Delhi NCR. Join 5000+ developers, founders, and tech leaders for 3 days of keynotes, workshops, and networking.",
      category: "Tech",
      city: "Delhi",
      date: new Date("2025-07-15T09:00:00"),
      endDate: new Date("2025-07-17T18:00:00"),
      time: "09:00 AM",
      venue: "Pragati Maidan",
      address: "Pragati Maidan, New Delhi, 110001",
      price: { amount: 999, currency: "INR", type: "Paid" },
      registrationUrl: "https://delhitechsummit.example.com",
      images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop"],
      tags: ["tech", "ai", "cloud", "delhi", "conference"],
      organizer: { name: "TechIndia Foundation", email: "info@techinfoundation.org" },
      capacity: 5000,
      attendees: 3200,
      source: "manual",
      sourceUrl: "https://delhitechsummit.example.com",
      featured: true,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Startup Pitch Night — Noida",
      description: "10 early-stage startups pitch to 20+ Delhi NCR investors. Network, learn, and connect with India's next generation of founders.",
      category: "Startup",
      city: "Noida",
      date: new Date("2025-07-22T06:30:00"),
      time: "06:30 PM",
      venue: "91springboard, Sector 62",
      address: "A-10, Sector 62, Noida, 201301",
      price: { amount: 0, currency: "INR", type: "Free" },
      registrationUrl: "https://startuppitch.example.com",
      images: ["https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop"],
      tags: ["startup", "funding", "pitch", "noida", "networking"],
      organizer: { name: "91springboard" },
      capacity: 100,
      source: "manual",
      sourceUrl: "https://startuppitch.example.com",
      featured: true,
      verified: true,
      status: "upcoming",
    },
    {
      title: "HackDelhi 2025 — 48-Hour Hackathon",
      description: "48-hour hackathon for college students and professionals. Build innovative solutions for smart cities, healthcare, and fintech. ₹5L+ in prizes.",
      category: "Hackathon",
      city: "Delhi",
      date: new Date("2025-08-02T08:00:00"),
      endDate: new Date("2025-08-04T08:00:00"),
      time: "08:00 AM",
      venue: "IIT Delhi",
      address: "IIT Delhi, Hauz Khas, New Delhi, 110016",
      price: { amount: 0, currency: "INR", type: "Free" },
      registrationUrl: "https://hackdelhi.example.com",
      images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop"],
      tags: ["hackathon", "coding", "iit", "delhi", "smartcity"],
      organizer: { name: "IIT Delhi CS Dept" },
      capacity: 500,
      source: "manual",
      sourceUrl: "https://hackdelhi.example.com",
      featured: true,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Delhi Cultural Festival — Rang Utsav",
      description: "A 3-day extravaganza celebrating India's rich cultural heritage with dance performances, music, art exhibitions, and food from 28 states.",
      category: "Cultural",
      city: "Delhi",
      date: new Date("2025-08-10T11:00:00"),
      time: "11:00 AM",
      venue: "India Gate Lawns",
      address: "India Gate, Rajpath, New Delhi",
      price: { amount: 0, currency: "INR", type: "Free" },
      registrationUrl: "https://rangutsav.example.com",
      images: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop"],
      tags: ["cultural", "festival", "dance", "music", "delhi"],
      organizer: { name: "Delhi Tourism" },
      capacity: 10000,
      source: "manual",
      sourceUrl: "https://rangutsav.example.com",
      featured: false,
      verified: true,
      status: "upcoming",
    },
    {
      title: "AWS Cloud Day — Delhi",
      description: "Amazon Web Services's flagship cloud computing event. Technical sessions on AWS services, serverless architecture, AI/ML on AWS, and cost optimization.",
      category: "Tech",
      city: "Delhi",
      date: new Date("2025-08-20T09:00:00"),
      time: "09:00 AM",
      venue: "The Leela Ambience, Gurugram",
      address: "The Leela Ambience Convention Hotel, Gurugram",
      price: { amount: 0, currency: "INR", type: "Free" },
      registrationUrl: "https://aws.amazon.com/events/",
      images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop"],
      tags: ["aws", "cloud", "serverless", "delhi", "amazon"],
      organizer: { name: "Amazon Web Services" },
      capacity: 1000,
      source: "corporate",
      sourceUrl: "https://aws.amazon.com/events/",
      featured: true,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Noida Half Marathon 2025",
      description: "Run through the scenic streets of Noida in this annual half marathon. Open to all fitness levels. Post-race brunch and medal ceremony.",
      category: "Sports",
      city: "Noida",
      date: new Date("2025-09-07T05:30:00"),
      time: "05:30 AM",
      venue: "Sector 18 Metro Park",
      address: "Sector 18, Noida, Uttar Pradesh",
      price: { amount: 799, currency: "INR", type: "Paid" },
      registrationUrl: "https://noidamarathon.example.com",
      images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop"],
      tags: ["marathon", "running", "sports", "noida", "fitness"],
      organizer: { name: "Noida Sports Authority" },
      capacity: 2000,
      source: "manual",
      sourceUrl: "https://noidamarathon.example.com",
      featured: false,
      verified: true,
      status: "upcoming",
    },
    {
      title: "AI & ML Workshop — Beginners",
      description: "Hands-on workshop on machine learning fundamentals. Learn Python, scikit-learn, TensorFlow basics, and build your first ML model in one day.",
      category: "Education",
      city: "Noida",
      date: new Date("2025-09-14T10:00:00"),
      time: "10:00 AM",
      venue: "Amity University",
      address: "Amity University Campus, Sector 125, Noida",
      price: { amount: 499, currency: "INR", type: "Paid" },
      registrationUrl: "https://aiworkshop.example.com",
      images: ["https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop"],
      tags: ["ai", "ml", "workshop", "noida", "python", "beginner"],
      organizer: { name: "Amity Innovation Lab" },
      capacity: 50,
      source: "iit_delhi",
      sourceUrl: "https://aiworkshop.example.com",
      featured: false,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Delhi Comedy Fest 2025",
      description: "A weekend of stand-up comedy featuring India's top comedians. 2 shows daily — evening and late night.",
      category: "Entertainment",
      city: "Delhi",
      date: new Date("2025-09-20T07:00:00"),
      time: "07:00 PM",
      venue: "Kingdom of Dreams, Gurugram",
      address: "Kingdom of Dreams, City Centre, Gurugram",
      price: { amount: 1499, currency: "INR", type: "Paid" },
      registrationUrl: "https://delhicomedy.example.com",
      images: ["https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop"],
      tags: ["comedy", "entertainment", "standup", "delhi", "show"],
      organizer: { name: "Kingdom Events" },
      capacity: 800,
      source: "manual",
      sourceUrl: "https://delhicomedy.example.com",
      featured: false,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Product Managers Meetup — Delhi NCR",
      description: "Monthly PM meetup. This month: how to prioritize roadmaps without burning out your team. Open to all product managers, POs, and aspiring PMs.",
      category: "Meetup",
      city: "Delhi",
      date: new Date("2025-08-28T06:30:00"),
      time: "06:30 PM",
      venue: "WeWork Vasant Square",
      address: "WeWork Vasant Square Mall, Vasant Kunj, New Delhi",
      price: { amount: 0, currency: "INR", type: "RSVP" },
      registrationUrl: "https://meetup.com/delhi-pm",
      images: ["https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop"],
      tags: ["product", "meetup", "pm", "delhi", "networking"],
      organizer: { name: "Delhi PM Community" },
      capacity: 60,
      source: "meetup",
      sourceUrl: "https://meetup.com/delhi-pm",
      featured: false,
      verified: true,
      status: "upcoming",
    },
    {
      title: "Business Excellence Summit 2025",
      description: "India's premier B2B conference bringing together 3000+ business leaders, CEOs, and entrepreneurs for 2 days of insights, networking, and growth strategies.",
      category: "Business",
      city: "Delhi",
      date: new Date("2025-10-10T09:00:00"),
      time: "09:00 AM",
      venue: "Hotel Taj Palace",
      address: "No. 2, Sardar Patel Marg, New Delhi",
      price: { amount: 5000, currency: "INR", type: "Paid" },
      registrationUrl: "https://bizexcellence.example.com",
      images: ["https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop"],
      tags: ["business", "summit", "leadership", "delhi", "b2b"],
      organizer: { name: "CII India" },
      capacity: 3000,
      source: "corporate",
      sourceUrl: "https://bizexcellence.example.com",
      featured: true,
      verified: true,
      status: "upcoming",
    },
  ];

  let inserted = 0;
  for (const eventData of sampleEvents) {
    try {
      await Event.findOneAndUpdate(
        { title: eventData.title, city: eventData.city },
        { $set: eventData, $setOnInsert: { viewCount: Math.floor(Math.random() * 500), bookmarkCount: Math.floor(Math.random() * 50) } },
        { upsert: true, new: true }
      );
      inserted++;
    } catch (e: any) {
      console.error(`Failed to insert "${eventData.title}":`, e.message);
    }
  }

  console.log(`✅ ${inserted}/${sampleEvents.length} sample events upserted`);
  await mongoose.disconnect();
  console.log("✅ Seed complete!");
}

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });
