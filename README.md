<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Delhi%20%26%20Noida%20Events&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=🏙️%20The%20Ultimate%20Event%20Discovery%20Platform%20for%20Delhi-NCR&descAlignY=55&descSize=18" width="100%"/>

<!-- Badges Row 1 -->
<p>
  <img src="https://img.shields.io/badge/Next.js-16.2.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
</p>

<!-- Badges Row 2 -->
<p>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

<!-- Badges Row 3 -->
<p>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

<!-- Status Badges -->
<p>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/Maintained-Yes-green?style=for-the-badge" alt="Maintained"/>
  <img src="https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge" alt="Open Source"/>
</p>

<br/>

> ### 🌟 *"One platform to discover every event across Delhi & Noida — real-time, AI-powered, beautifully designed."*

<br/>

[![Star this repo](https://img.shields.io/github/stars/yuvamk/Delhi_Noida_Events?style=social)](https://github.com/yuvamk/Delhi_Noida_Events/stargazers)
[![Fork this repo](https://img.shields.io/github/forks/yuvamk/Delhi_Noida_Events?style=social)](https://github.com/yuvamk/Delhi_Noida_Events/fork)

</div>

---

## 📖 Table of Contents

<details open>
<summary><b>Click to expand / collapse</b></summary>

- [🎯 The Problem We Solve](#-the-problem-we-solve)
- [🏗️ Architecture Overview](#️-architecture-overview)
  - [🖥️ Frontend — Next.js 16](#️-frontend--nextjs-16)
  - [⚙️ Backend — Express API](#️-backend--express-api)
  - [🕷️ Scraper — Python Engine](#️-scraper--python-engine)
  - [🏛️ Infrastructure & Deployment](#️-infrastructure--deployment)
- [✨ Features in Depth](#-features-in-depth)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🔌 API Reference](#-api-reference)
- [🎨 UI/UX Design System](#-uiux-design-system)
- [🤖 AI-Powered Deduplication](#-ai-powered-deduplication)
- [🕸️ Scraped Sources](#️-scraped-sources)
- [🛡️ Security & Performance](#️-security--performance)
- [🤝 Contributing](#-contributing)
- [📚 Resources & Links](#-resources--links)
- [👨‍💻 Author](#-author)

</details>

---

## 🎯 The Problem We Solve

<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&width=700&height=80&lines=Event+discovery+in+Delhi-NCR+is+fragmented...;We+centralize+10%2B+sources+into+one+platform!+🎉" alt="Typing SVG"/>
</div>

<br/>

In Delhi-NCR, finding events means jumping between **Eventbrite**, **Meetup**, **Unstop**, university portals, LinkedIn, and countless corporate pages — wasting **hours** every week. Users encounter:

| Problem | Impact |
|---------|--------|
| 🔀 **Fragmented Sources** | 10+ websites to check manually |
| 🔁 **Duplicate Listings** | Same event posted on multiple platforms |
| ⏰ **Stale Data** | Events that already passed still showing up |
| 🔍 **Poor Discoverability** | Hard to find niche or university events |
| 📍 **No Location Context** | Difficult to find nearby events on a map |

**Delhi-Noida Events Platform** is the solution — a sophisticated, AI-driven aggregation engine that scrapes, deduplicates, and serves real-time event data from **10+ major platforms** in one beautiful interface.

---

## 🏗️ Architecture Overview

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELHI-NOIDA EVENTS PLATFORM                  │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   FRONTEND   │    │   BACKEND    │    │     SCRAPER      │  │
│  │  Next.js 16  │◄──►│  Express.js  │◄──►│  Python/Scrapy   │  │
│  │  React 19    │    │  Node.js 20  │    │  Playwright      │  │
│  │  TypeScript  │    │  TypeScript  │    │  BeautifulSoup   │  │
│  │  Tailwind v4 │    │  MongoDB ODM │    │  APScheduler     │  │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘  │
│         │                  │                      │            │
│         ▼                  ▼                      ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Supabase    │    │  MongoDB     │    │  Google Gemini   │  │
│  │  PostgreSQL  │    │  Atlas       │    │  AI Dedup Engine │  │
│  │  (Auth/User) │    │  (Events)    │    │  (Deduplication) │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              NGINX REVERSE PROXY  (Production)          │   │
│  │         Redis Cache  |  Socket.io  |  Docker Compose    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

</div>

---

### 🖥️ Frontend — Next.js 16

<img align="right" src="https://img.shields.io/badge/Port-3001-blue?style=flat-square" alt="Port 3001"/>

The frontend is a **high-performance, SEO-optimized** web application built with the latest web technologies:

<details>
<summary><b>📦 Core Technology Stack</b></summary>

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.2.3 | App Router, SSR, SSG, Image Optimization |
| **React** | 19.2.4 | Component-based UI |
| **TypeScript** | 5.x | Type safety across the codebase |
| **Tailwind CSS** | v4 | Utility-first styling, dark mode, glassmorphism |
| **Framer Motion** | 12.x | Smooth animations and micro-interactions |
| **Zustand** | 5.x | Lightweight global state management |
| **TanStack Query** | 5.x | Server state, caching, background refetch |
| **Leaflet** | 1.9.4 | Interactive event location maps |
| **Socket.io Client** | 4.8.3 | Real-time event updates |
| **Supabase JS** | 2.x | OAuth authentication (Google) |
| **React Big Calendar** | 1.x | Calendar views for events |
| **next-sitemap** | 4.x | Dynamic sitemaps for SEO |
| **Embla Carousel** | 8.x | Touch-friendly event carousels |

</details>

<details>
<summary><b>📁 Frontend Directory Structure</b></summary>

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page
│   │   ├── events/             # Events listing & detail pages
│   │   ├── profile/            # User profile & bookmarks
│   │   ├── admin/              # Admin dashboard
│   │   └── layout.tsx          # Root layout with providers
│   ├── components/
│   │   ├── EventCard.tsx       # Event card with animations
│   │   ├── FilterPanel.tsx     # Advanced filter sidebar
│   │   ├── Navbar.tsx          # Navigation with dark mode toggle
│   │   ├── MapView.tsx         # Interactive Leaflet map
│   │   └── Calendar/           # Calendar view components
│   └── lib/
│       ├── api.ts              # Axios API client
│       ├── store.ts            # Zustand global store
│       └── supabase.ts         # Supabase configuration
├── public/                     # Static assets & favicons
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── Dockerfile                  # Container definition
```

</details>

---

### ⚙️ Backend — Express API

<img align="right" src="https://img.shields.io/badge/Port-5005-green?style=flat-square" alt="Port 5005"/>

The backend is a **production-grade REST API** with comprehensive security, caching, and real-time capabilities:

<details>
<summary><b>📦 Core Technology Stack</b></summary>

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | 4.18.2 | RESTful API framework |
| **TypeScript** | 5.x | Type safety |
| **Mongoose** | 8.x | MongoDB ODM with schema validation |
| **Supabase** | 2.x | PostgreSQL for user data |
| **JWT + bcryptjs** | 9.x | Authentication & password hashing |
| **Google Auth Library** | 10.x | OAuth 2.0 integration |
| **@google/generative-ai** | 0.24.x | Gemini AI for deduplication |
| **ioredis** | 5.x | Redis caching for high traffic |
| **Socket.io** | 4.8.3 | WebSocket real-time connections |
| **Helmet** | 7.x | Security HTTP headers |
| **express-rate-limit** | 7.x | API rate limiting |
| **Winston + Morgan** | 3.x | Structured logging |
| **Nodemailer** | 8.x | Email OTP & notifications |
| **Swagger UI Express** | 5.x | Interactive API documentation |
| **Multer** | 2.x | File upload handling |
| **@google-cloud/storage** | 7.x | Cloud file storage |
| **Joi** | 17.x | Request validation schemas |

</details>

<details>
<summary><b>📁 Backend Directory Structure</b></summary>

```
backend/
├── src/
│   ├── server.ts               # App entry point
│   ├── routes/
│   │   ├── events.ts           # Event CRUD endpoints
│   │   ├── auth.ts             # Login, OAuth, JWT
│   │   ├── admin.ts            # Admin-only endpoints
│   │   └── user.ts             # User profile & bookmarks
│   ├── models/
│   │   ├── Event.ts            # Mongoose event schema
│   │   └── User.ts             # Mongoose user schema
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── validate.ts         # Joi request validation
│   │   └── errorHandler.ts     # Global error handling
│   ├── services/
│   │   ├── scraperService.ts   # Scraper orchestration
│   │   └── aiDedup.ts          # Gemini deduplication logic
│   └── scripts/
│       └── seed.ts             # Database seeding script
├── logs/                       # Winston log files
├── tsconfig.json
└── Dockerfile
```

</details>

---

### 🕷️ Scraper — Python Engine

The **heart of the platform** — an intelligent scraping engine that continuously harvests event data from across the web:

<details>
<summary><b>📦 Core Technology Stack</b></summary>

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Scrapy** | 2.11.0 | Structured web scraping framework |
| **Selenium** | 4.15.2 | Browser automation for JS-heavy sites |
| **Playwright** | 1.40.0 | Modern browser automation (stealth mode) |
| **BeautifulSoup4** | 4.x | HTML/XML parsing |
| **lxml** | 4.x | High-performance XML parser |
| **aiohttp / httpx** | Latest | Async concurrent HTTP requests |
| **PyMongo / Motor** | Latest | MongoDB sync/async drivers |
| **Pydantic** | 2.x | Data validation models |
| **APScheduler** | 3.x | Cron-based scheduling |
| **Loguru** | Latest | Beautiful structured logging |
| **fake-useragent** | Latest | Anti-bot user agent rotation |
| **tenacity** | Latest | Retry logic with backoff |
| **cloudscraper** | Latest | Cloudflare bypass |
| **Pillow** | Latest | Event image processing |

</details>

<details>
<summary><b>📁 Scraper Directory Structure</b></summary>

```
scraper/
├── main.py                     # Entry point (CLI flags)
├── scrapers/
│   ├── base_scraper.py         # Abstract base scraper class
│   ├── eventbrite_scraper.py   # Eventbrite integration
│   ├── meetup_scraper.py       # Meetup.com integration
│   ├── meraevents_scraper.py   # MeraEvents integration
│   ├── unstop_scraper.py       # Unstop (competitions) integration
│   ├── university_scraper.py   # IIT Delhi & university events
│   ├── linkedin_scraper.py     # LinkedIn Events integration
│   ├── corporate_scraper.py    # Corporate calendar scraper
│   └── dynamic_browser_scraper.py  # AI-powered universal scraper
├── processors/
│   ├── deduplicator.py         # Google Gemini dedup engine
│   └── normalizer.py           # Event data normalizer
├── models/
│   └── event_model.py          # Pydantic event schema
├── utils/
│   └── api_client.py           # Backend API integration
├── database/
│   └── connection.py           # MongoDB connection utilities
├── scheduler/
│   └── cron.py                 # APScheduler configuration
├── tests/                      # Pytest test suite
└── requirements.txt            # Python dependencies
```

</details>

---

### 🏛️ Infrastructure & Deployment

<details>
<summary><b>🐳 Docker Architecture</b></summary>

```yaml
# docker-compose.yml overview
services:
  frontend:     # Next.js — Port 3001
  backend:      # Express API — Port 5005
  scraper:      # Python engine — scheduled runs
  nginx:        # Reverse proxy — Port 80/443
  redis:        # Cache layer — Port 6379
  mongo:        # Local MongoDB (dev only)
```

</details>

<details>
<summary><b>🔧 Key Configuration Files</b></summary>

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-service orchestration |
| `ecosystem.config.js` | PM2 process management for production |
| `nginx/` | Reverse proxy config with SSL/TLS |
| `.env.example` | Environment variable template |
| `.github/workflows/` | CI/CD pipeline configuration |

</details>

---

## ✨ Features in Depth

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 🔍 **Event Discovery** | Infinite scroll with real-time search | ✅ Live |
| 🗺️ **Interactive Maps** | Leaflet maps showing event venues | ✅ Live |
| 📅 **Calendar View** | Monthly/weekly calendar for events | ✅ Live |
| 🔖 **Bookmarks** | Save events to personal profile | ✅ Live |
| 🌙 **Dark Mode** | Deep navy/indigo premium aesthetic | ✅ Live |
| 🔐 **Google OAuth** | One-click login via Supabase | ✅ Live |
| 🤖 **AI Deduplication** | Gemini-powered duplicate removal | ✅ Live |
| ⚡ **Real-Time Updates** | Socket.io live event notifications | ✅ Live |
| 📊 **Admin Dashboard** | Scraper health, logs, manual trigger | ✅ Live |
| 🔔 **Email OTP** | Secure email verification flow | ✅ Live |
| 📱 **PWA Support** | Service worker, offline capability | ✅ Live |
| 🗂️ **Advanced Filters** | City, category, date, price range | ✅ Live |
| 📈 **SEO Optimized** | Dynamic meta, JSON-LD structured data | ✅ Live |
| 🔄 **Auto-Scraping** | Scheduled cron jobs via APScheduler | ✅ Live |
| 📷 **Image Processing** | Optimized event images via Pillow | ✅ Live |

</div>

---

## 🚀 Quick Start & Installation

### Prerequisites

Before you begin, ensure you have the following installed:

```
✅ Node.js 20+          → https://nodejs.org
✅ Python 3.11+         → https://python.org
✅ Docker & Compose     → https://docker.com
✅ MongoDB Atlas Account → https://mongodb.com/atlas
✅ Supabase Project     → https://supabase.com
✅ Google Cloud Project → https://console.cloud.google.com
✅ Redis (optional)     → https://redis.io
```

---

### 🐳 Option A: Docker (Recommended — One Command!)

```bash
# 1. Clone the repository
git clone https://github.com/yuvamk/Delhi_Noida_Events.git
cd Delhi_Noida_Events

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section below)

# 3. Launch everything with Docker Compose
docker-compose up --build

# ✅ Frontend:  http://localhost:3001
# ✅ Backend:   http://localhost:5005
# ✅ API Docs:  http://localhost:5005/api/docs
```

---

### 💻 Option B: Manual Local Setup

<details>
<summary><b>Step 1️⃣ — Clone & Configure</b></summary>

```bash
git clone https://github.com/yuvamk/Delhi_Noida_Events.git
cd Delhi_Noida_Events
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/delhi_events

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google AI (Gemini for deduplication)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (optional — comment out if not used)
REDIS_URL=redis://localhost:6379

# Google Cloud Storage (for images)
GCS_BUCKET_NAME=your-gcs-bucket
```

</details>

<details>
<summary><b>Step 2️⃣ — Setup Backend</b></summary>

```bash
cd backend
npm install

# Compile TypeScript
npm run build

# Seed database with initial data (categories, admin user)
npm run seed

# Start development server (with hot reload)
npm run dev

# ✅ API running at: http://localhost:5005
# ✅ Swagger docs at: http://localhost:5005/api/docs
```

</details>

<details>
<summary><b>Step 3️⃣ — Setup Frontend</b></summary>

```bash
cd ../frontend
npm install

# Start development server
npm run dev

# ✅ Frontend running at: http://localhost:3001
```

</details>

<details>
<summary><b>Step 4️⃣ — Setup Scraper</b></summary>

```bash
cd ../scraper
pip install -r requirements.txt

# Test without sending data to backend
python main.py --dry-run

# Run a single full scrape cycle
python main.py --once

# Start with scheduled cron jobs
python main.py --schedule
```

</details>

<details>
<summary><b>Step 5️⃣ — Production Deployment with PM2</b></summary>

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
npm run start:prod

# Build & start frontend
cd ../frontend
npm run build
npm start

# Monitor processes
pm2 monit
pm2 logs dne-backend
```

</details>

---

## 🔌 API Reference

> 📖 **Full interactive docs available at:** `http://localhost:5005/api/docs` (Swagger UI)

### Events Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/events` | Paginated events list (filters: city, category, date) | ❌ Public |
| `GET` | `/api/v1/events/:id` | Event details with full metadata | ❌ Public |
| `GET` | `/api/v1/events/featured` | Curated featured events | ❌ Public |
| `GET` | `/api/v1/events/search?q=` | Full-text search across events | ❌ Public |

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | Email + password login (JWT response) | ❌ Public |
| `POST` | `/api/v1/auth/register` | User registration with OTP verification | ❌ Public |
| `POST` | `/api/v1/auth/google` | Google OAuth callback | ❌ Public |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT token | 🔒 JWT |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/user/profile` | Get user profile data | 🔒 JWT |
| `GET` | `/api/v1/user/bookmarks` | User's saved events | 🔒 JWT |
| `POST` | `/api/v1/user/bookmarks/:id` | Bookmark an event | 🔒 JWT |
| `DELETE` | `/api/v1/user/bookmarks/:id` | Remove a bookmark | 🔒 JWT |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/admin/scraper/trigger` | Manually start scraper run | 🔐 Admin JWT |
| `GET` | `/api/v1/admin/scraper/status` | Scraper health & last run info | 🔐 Admin JWT |
| `GET` | `/api/v1/admin/logs` | View application logs | 🔐 Admin JWT |
| `PUT` | `/api/v1/admin/events/:id` | Manually edit an event | 🔐 Admin JWT |

### Example Request

```bash
# Fetch Delhi tech events, paginated
curl -X GET "http://localhost:5005/api/v1/events?city=Delhi&category=Technology&page=1&limit=20" \
  -H "Content-Type: application/json"
```

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        "title": "Delhi Tech Summit 2025",
        "description": "Annual technology conference...",
        "category": "Technology",
        "city": "Delhi",
        "venue": "Pragati Maidan, New Delhi",
        "date": "2025-06-15T10:00:00Z",
        "source": "eventbrite",
        "sourceUrl": "https://eventbrite.com/...",
        "isFeatured": true
      }
    ],
    "pagination": {
      "total": 247,
      "page": 1,
      "limit": 20,
      "totalPages": 13
    }
  }
}
```

---

## 🎨 UI/UX Design System

<div align="center">

### 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🟣 **Indigo** | `#6366F1` | Primary actions, highlights |
| 🔵 **Deep Blue** | `#1E293B` | Dark mode background |
| ⚪ **Slate** | `#94A3B8` | Secondary text |
| 🟢 **Emerald** | `#10B981` | Success states |
| 🔴 **Rose** | `#F43F5E` | Errors & alerts |
| 🟡 **Amber** | `#F59E0B` | Warnings & featured badges |

</div>

### Design Principles

```
🌙  Dark Mode First     → Deep navy (#1E293B) + Indigo (#6366F1) palette
🪟  Glassmorphism       → backdrop-blur + semi-transparent overlays
✨  Micro-animations    → Framer Motion enter/exit transitions (300ms)
📱  Mobile-First        → Responsive breakpoints: sm/md/lg/xl/2xl
♿  Accessible          → ARIA labels, keyboard navigation, focus rings
⚡  Performance         → Lazy loading, Next.js Image optimization, PWA
```

### Component Highlights

- **EventCard** — Animated card with hover scale, gradient overlay, category badge
- **FilterPanel** — Sliding sidebar with smooth Framer Motion transitions
- **MapView** — Interactive Leaflet map with custom markers and popups
- **Navbar** — Glassmorphism blur bar with theme toggle and auth state
- **Calendar** — React Big Calendar integration with custom dark theme
- **Carousel** — Embla-powered touch-friendly event showcase

---

## 🤖 AI-Powered Deduplication

<div align="center">

```
📥 Raw Scraped Events
        │
        ▼
┌───────────────────┐
│   Normalizer      │  → Standardize dates, titles, locations
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Similarity Check │  → Compare event pairs by title + date + venue
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Google Gemini    │  → AI semantic analysis of descriptions
│  (Gemini Pro)     │  → Similarity score 0.0 → 1.0
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
   >0.85     <0.85
    │         │
    ▼         ▼
  MERGE     KEEP BOTH
    │
    ▼
📤 Clean, Deduplicated Events
   (removes ~20-30% duplicates)
```

</div>

The deduplication pipeline:

1. **Normalize**: Standardizes dates (UTC), location names, and titles across all sources
2. **Hash Check**: Fast pre-filter using title similarity hashing
3. **Gemini Analysis**: For potential duplicates, sends event pairs to Google Gemini for semantic comparison
4. **Merge Strategy**: Keeps the most detailed version, merges source URLs
5. **Result**: ~20-30% fewer duplicates in the final database

---

## 🕸️ Scraped Sources

<div align="center">

| # | Platform | Scraper Type | Events Type |
|---|----------|-------------|-------------|
| 1 | 🎟️ **Eventbrite** | HTTP + BeautifulSoup | All categories |
| 2 | 🤝 **Meetup.com** | Playwright (JS-rendered) | Community & Tech |
| 3 | 🎯 **MeraEvents** | Scrapy Spider | Indian events |
| 4 | 🏆 **Unstop** | Selenium + Playwright | Competitions & Hackathons |
| 5 | 🎓 **IIT Delhi** | BeautifulSoup | University & Academic |
| 6 | 💼 **LinkedIn Events** | Playwright (Auth required) | Professional & Corporate |
| 7 | 🏢 **Corporate Calendars** | HTTP | B2B conferences |
| 8 | 🤖 **Dynamic Browser Scraper** | Playwright + AI | Any new website |

</div>

### Anti-Bot & Reliability Measures

```python
# Key resilience features in the scraper engine
✅ fake-useragent      → Rotate user agents per request
✅ cloudscraper        → Bypass Cloudflare WAF protection
✅ tenacity            → Exponential backoff retry (3 attempts)
✅ proxy rotation      → Multiple IP support (configurable)
✅ APScheduler         → Cron jobs every 30 minutes
✅ Rate limiting       → Respectful delay between requests
✅ Playwright stealth  → Headless browser with human-like behavior
```

---

## 🛡️ Security & Performance

### Security Layers

```
🔒 Helmet.js          → Security HTTP headers (CSP, HSTS, etc.)
🚦 Rate Limiting       → 100 req/15min per IP (express-rate-limit)
🍪 httpOnly Cookies   → JWT stored securely, not localStorage
🔐 bcryptjs           → Password hashing with salt rounds = 12
✅ Joi Validation     → All API inputs validated before processing
🔑 JWT Rotation       → Short-lived access + refresh token pattern
🛡️ CORS Policy        → Strict allowed origins configuration
```

### Performance Optimizations

```
⚡ Redis Cache        → Frequent event queries cached (5 min TTL)
🖼️ Next.js Images    → Automatic WebP conversion + lazy loading
📦 Code Splitting    → Automatic per-route bundle splitting
🗜️ Compression       → Gzip compression on all API responses
📊 Connection Pool   → Mongoose connection pooling for MongoDB
🔄 TanStack Query    → Client-side cache + background refetch
🌐 CDN Ready         → Static assets optimized for CDN delivery
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how to get involved:

### Development Workflow

```bash
# 1. Fork & clone the repository
git clone https://github.com/YOUR_USERNAME/Delhi_Noida_Events.git

# 2. Create a feature branch
git checkout -b feature/your-amazing-feature

# 3. Make your changes and run linting
cd frontend && npm run lint
cd backend && npm run lint

# 4. Test your changes
cd scraper && python -m pytest tests/

# 5. Commit with conventional commit format
git commit -m "feat: add amazing new feature"

# 6. Push and open a Pull Request
git push origin feature/your-amazing-feature
```

### Code Style

| Area | Tool | Command |
|------|------|---------|
| Frontend/Backend | ESLint | `npm run lint` |
| Python Scraper | Black | `black scraper/` |
| Commits | Conventional Commits | `feat:`, `fix:`, `docs:`, etc. |

### Good First Issues

- 🐛 Bug fixes in any scraper
- 📝 Documentation improvements
- 🎨 UI component enhancements
- 🔌 New event source integrations
- ⚡ Performance optimizations

---

## 📚 Resources & Links

<div align="center">

### 🔗 Official Documentation

| Resource | Link |
|----------|------|
| 📘 **Next.js Docs** | https://nextjs.org/docs |
| ⚛️ **React 19 Docs** | https://react.dev |
| 🐍 **Scrapy Tutorial** | https://docs.scrapy.org/en/latest/intro/tutorial.html |
| 🎭 **Playwright Docs** | https://playwright.dev/python/docs/intro |
| 🔐 **Supabase Auth** | https://supabase.com/docs/guides/auth |
| 🤖 **Google Gemini AI** | https://ai.google.dev/docs |
| 🍃 **MongoDB Atlas** | https://www.mongodb.com/docs/atlas |
| 🐳 **Docker Compose** | https://docs.docker.com/compose |
| 🎨 **Tailwind CSS** | https://tailwindcss.com/docs |
| 🗺️ **Leaflet Maps** | https://leafletjs.com/reference.html |
| 🏪 **Zustand** | https://zustand-demo.pmnd.rs |
| 📊 **TanStack Query** | https://tanstack.com/query/latest/docs |

### 📦 Key Packages

| Package | Registry |
|---------|----------|
| `framer-motion` | [npmjs.com/package/framer-motion](https://www.npmjs.com/package/framer-motion) |
| `react-leaflet` | [npmjs.com/package/react-leaflet](https://www.npmjs.com/package/react-leaflet) |
| `socket.io` | [npmjs.com/package/socket.io](https://www.npmjs.com/package/socket.io) |
| `scrapy` | [pypi.org/project/Scrapy](https://pypi.org/project/Scrapy) |
| `playwright` | [pypi.org/project/playwright](https://pypi.org/project/playwright) |

</div>

---

## 👨‍💻 Author

<div align="center">

<img src="https://github.com/yuvamk.png" width="100" style="border-radius:50%"/>

### **Yuvam**

*Full-Stack Developer & Open Source Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-yuvamk-181717?style=for-the-badge&logo=github)](https://github.com/yuvamk)
[![Repository](https://img.shields.io/badge/Repository-Delhi_Noida_Events-6366F1?style=for-the-badge&logo=github)](https://github.com/yuvamk/Delhi_Noida_Events)

</div>

---

<div align="center">

### 🌟 If this project helped you, please give it a star!

[![Star History Chart](https://img.shields.io/github/stars/yuvamk/Delhi_Noida_Events?style=for-the-badge&color=FFD700)](https://github.com/yuvamk/Delhi_Noida_Events/stargazers)

<br/>

**Built with ❤️ for Delhi-NCR's vibrant events ecosystem** 🇮🇳

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

</div>
