// MongoDB Init Script — runs once when the container starts for first time
// Creates: app user, required indexes, initial settings

db = db.getSiblingDB("delhi_noida_events");

// Create app user with least-privilege access
db.createUser({
  user: process.env.MONGO_APP_USER || "dne_app",
  pwd:  process.env.MONGO_APP_PASSWORD || "changeme",
  roles: [
    { role: "readWrite",         db: "delhi_noida_events" },
    { role: "dbAdmin",           db: "delhi_noida_events" },
  ],
});

// ── Events Collection ─────────────────────────────────────────
db.createCollection("events");

// Compound indexes for high-traffic query patterns
db.events.createIndex({ city: 1, date: 1, status: 1 });          // city filter
db.events.createIndex({ category: 1, date: 1, status: 1 });       // category filter
db.events.createIndex({ featured: 1, status: 1, date: 1 });       // featured listing
db.events.createIndex({ status: 1, date: 1 });                    // all upcoming
db.events.createIndex({ bookmarkCount: -1, status: 1 });           // popular sort
db.events.createIndex({ viewCount: -1, status: 1 });               // trending sort
db.events.createIndex({ "price.type": 1, status: 1, date: 1 });   // free events
db.events.createIndex({ source: 1, sourceUrl: 1 }, { unique: true }); // dedup
db.events.createIndex({ slug: 1 }, { unique: true });
db.events.createIndex({ date: -1 });
db.events.createIndex({ tags: 1 });
db.events.createIndex({ location: "2dsphere" });                   // geospatial
db.events.createIndex(
  { title: "text", description: "text", tags: "text", venue: "text" },
  { weights: { title: 10, tags: 5, venue: 3, description: 1 }, name: "event_text_index" }
);
// TTL index — auto-delete events 90 days after completion
db.events.createIndex(
  { endDate: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: "completed" } }
);

// ── Users ─────────────────────────────────────────────────────
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// ── Bookmarks ─────────────────────────────────────────────────
db.createCollection("bookmarks");
db.bookmarks.createIndex({ user: 1, event: 1 }, { unique: true });
db.bookmarks.createIndex({ user: 1, createdAt: -1 });
db.bookmarks.createIndex({ event: 1 });

// ── Analytics (TTL: 90 days) ──────────────────────────────────
db.createCollection("analytics");
db.analytics.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
db.analytics.createIndex({ event: 1 });
db.analytics.createIndex({ action: 1, createdAt: -1 });

// ── ScraperLogs (TTL: 30 days) ────────────────────────────────
db.createCollection("scraperlogs");
db.scraperlogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
db.scraperlogs.createIndex({ source: 1, createdAt: -1 });
db.scraperlogs.createIndex({ status: 1 });

// ── Newsletter Subscribers ────────────────────────────────────
db.createCollection("subscribers");
db.subscribers.createIndex({ email: 1 }, { unique: true });
db.subscribers.createIndex({ subscribedAt: -1 });
db.subscribers.createIndex({ status: 1 });

print("✅ Delhi-Noida Events DB initialized with all indexes.");
