# Delhi & Noida Events Platform 🏙️

> **The most comprehensive events discovery platform for Delhi and Noida.** Real-time aggregation from 10+ sources, AI-powered deduplication, and a stunning Next.js frontend.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=express)](https://expressjs.com)
[![Scraper](https://img.shields.io/badge/Scraper-Python%203.11-blue?logo=python)](https://python.org)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen?logo=mongodb)](https://mongodb.com)
[![Auth](https://img.shields.io/badge/Auth-Supabase-purple?logo=supabase)](https://supabase.com)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB)
- Supabase project

### 1. Clone and Install

```bash
git clone https://github.com/your-org/delhi-noida-events.git
cd delhi-noida-events

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# Python Scraper
cd ../scraper && pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in: MONGODB_URI, SUPABASE_URL, SUPABASE_ANON_KEY
```

### 3. Start Development Servers

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev
# → http://localhost:3000

# Terminal 2 — Backend API
cd backend && npm run dev
# → http://localhost:5000

# Terminal 3 — Python Scraper (optional)
cd scraper && python main.py --once
```

### 4. Or Use Docker

```bash
cp .env.example .env
docker-compose up --build
```

---

## 🏗️ Architecture

```
delhi-noida-events/
├── frontend/          ← Next.js 14 + TypeScript + Tailwind CSS
├── backend/           ← Node.js + Express + TypeScript  
├── scraper/           ← Python + Scrapy + Playwright
├── docker-compose.yml ← Orchestration
└── .github/workflows/ ← CI/CD
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand |
| Backend | Node.js, Express, TypeScript, Mongoose, JWT |
| Scraper | Python 3.11, Scrapy, Playwright, BeautifulSoup, APScheduler |
| Primary DB | MongoDB Atlas (Events, Scraper Logs) |
| Auth DB | Supabase PostgreSQL (Users, Bookmarks, Analytics) |
| Deployment | Vercel (Frontend), Render (Backend), Background Worker (Scraper) |

---

## 📄 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, featured events, categories, stats |
| `/events` | All events with filters and sort |
| `/events/[id]` | Event detail with gallery, map, share |
| `/delhi-events` | SEO city page — Delhi |
| `/noida-events` | SEO city page — Noida |
| `/category/[slug]` | Category-filtered events |
| `/search` | Full-text search with filters |
| `/bookmarks` | Saved events (auth optional) |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/admin` | Admin dashboard with scraper control |

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

```
GET  /api/v1/health                     Health check
GET  /api/v1/events                     All events (filterable, paginated)
GET  /api/v1/events/featured            Featured events
GET  /api/v1/events/trending            Trending by bookmarks
GET  /api/v1/events/:id                 Event detail + related
GET  /api/v1/events/city/:city          City-specific events
GET  /api/v1/events/category/:category  Category events
GET  /api/v1/events/search?q=...        Full-text search
GET  /api/v1/cities                     Available cities
GET  /api/v1/categories                 Available categories
GET  /api/v1/analytics/stats            Platform statistics
POST /api/v1/auth/login                 User login
POST /api/v1/auth/register              User registration
GET  /api/v1/bookmarks                  User bookmarks
POST /api/v1/bookmarks/:eventId         Add bookmark
DELETE /api/v1/bookmarks/:eventId       Remove bookmark
GET  /api/v1/admin/scraper/status       Scraper health
POST /api/v1/admin/scraper/trigger      Trigger manual scrape
GET  /api/v1/admin/scraper/logs         Scraper execution logs
```

---

## 🕷️ Scraper Sources

| Source | Type | Status |
|--------|------|--------|
| Eventbrite | API + HTML | ✅ Active |
| MeraEvents | HTML | ✅ Active |
| Meetup.com | HTML + API | ✅ Active |
| Unstop | HTML | ✅ Active |
| LinkedIn Events | Playwright | ⚠️ Login required |
| IIT Delhi | HTML | ✅ Active |
| Corporate Events | HTML | ✅ Active |
| Generic | Configurable | ✅ Active |

### Scraper Schedule
- **Every 6 hours**: Full scrape from all sources
- **Daily 2AM**: Data cleanup (remove events older than 60 days)
- **On-demand**: Admin can trigger via API or Dashboard

---

## 🎨 UI Features

- 🌙 Dark mode by default with deep navy + indigo gradient
- ✨ Glassmorphism cards with hover animations
- 📱 Mobile-first responsive design
- ⚡ Animated counters, floating orbs, micro-animations
- 🔖 Bookmark events with toast notifications
- 🔍 Real-time search with popular query suggestions
- 📊 Admin dashboard with live scraper progress
- 🗂️ Category + city filters with active chip display

---

## 🔐 SEO

- Next.js 14 Metadata API
- JSON-LD structured data (Event, Organization, LocalBusiness)
- Dynamic OG images
- `robots.txt` + XML sitemap
- Canonical URLs, Twitter Cards
- Keyword targeting: "events in delhi", "events in noida", "tech events delhi"

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Render/Railway
```bash
# Push to GitHub → auto-deploy via GitHub Actions
```

### Scraper → Background Worker
```bash
# Deploy as background worker on Render/Railway
# Set start command: python main.py
```

### Database
- **MongoDB Atlas**: Create free cluster at cloud.mongodb.com
- **Supabase**: Create project at supabase.com and run the SQL from `backend/README.md`

---

## 🧪 Testing

```bash
# Frontend
cd frontend && npm run build  # Build test

# Backend
cd backend && npm run build && node dist/server.js

# Scraper
cd scraper && python main.py --once
```

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Mobile | 90+ |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| API Response time | < 500ms p95 |
| DB Query time | < 200ms p95 |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for Delhi-NCR's vibrant events ecosystem. 🇮🇳
# DE_NE_Events
# DE_NE_Events
