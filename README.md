# Delhi & Noida Events Platform 🏙️

> **The most comprehensive events discovery platform for Delhi and Noida.** Real-time aggregation from 10+ sources, AI-powered deduplication, and a stunning Next.js frontend.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=express)](https://expressjs.com)
[![Scraper](https://img.shields.io/badge/Scraper-Python%203.11-blue?logo=python)](https://python.org)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen?logo=mongodb)](https://mongodb.com)
[![Auth](https://img.shields.io/badge/Auth-Supabase-purple?logo=supabase)](https://supabase.com)

---

## 🌟 What is this website about?

**Delhi-Noida Events** is a high-performance web platform designed to solve the fragmentation of event discovery in the Delhi-NCR region. It automatically scrapes, cleans, and categorizes events from multiple sources (Eventbrite, Meetup, Unstop, etc.) and presents them in a beautiful, unified interface.

### Key Capabilities:
- **Real-time Aggregation**: Automatically pulls data from 10+ major event platforms.
- **AI-Powered Deduplication**: Uses Google Gemini to identify and merge duplicate event listings.
- **Advanced Filtering**: Filter by city (Delhi/Noida), category, date, and popularity.
- **User Ecosystem**: Secure login, bookmarking system, and personalized event recommendations.
- **Admin Control**: A dedicated dashboard to monitor scrapers, view logs, and manually trigger data refreshes.
- **SEO Optimized**: Dynamic metadata and structured data (JSON-LD) for maximum search engine visibility.

---

## 🏗️ Technical Architecture

The platform is built using a modern, scalable micro-architecture:

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand for state management.
- **Backend**: Node.js & Express API, providing a robust RESTful interface.
- **Scraper**: A powerful Python-based engine using Scrapy and Playwright for complex JavaScript-heavy websites.
- **Database**: MongoDB Atlas for event storage and Supabase (PostgreSQL) for user-related data.
- **Proxy**: Nginx configuration included for production routing.

---

## 🚀 How to Run Locally

Follow these steps to get the entire ecosystem running on your machine.

### Prerequisites
- **Node.js 20+** and **npm**
- **Python 3.11+**
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Supabase** project (for authentication and bookmarks)
- **Redis** (optional, for high-traffic caching)

### 1. Clone the Repository
```bash
git clone https://github.com/yuvamk/Delhi_Noida_Events.git
cd Delhi_Noida_Events
```

### 2. Configure Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
# Open .env and fill in MONGODB_URI, SUPABASE_URL, etc.
```

### 3. Setup Backend
```bash
cd backend
npm install
# Seed the database with initial categories/admins
npm run seed
# Start development server
npm run dev
# API will be at http://localhost:5005
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
# Start development server
npm run dev
# Frontend will be at http://localhost:3000
```

### 5. Setup Scraper (Optional)
```bash
cd ../scraper
pip install -r requirements.txt
# Run a single scrape cycle
python main.py --once
```

### 6. Using Docker (Recommended)
If you have Docker installed, you can start everything with one command:
```bash
docker-compose up --build
```

---

## 🔌 API Documentation

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/events` | Fetch all events (paginated) |
| `GET /api/v1/events/:id` | Get detailed information for an event |
| `GET /api/v1/events/featured` | Get events highlighted by editors |
| `POST /api/v1/auth/login` | User authentication |
| `POST /api/v1/admin/scraper/trigger` | Manually start the scraper (Admin only) |

---

## 📱 UI Features
- **Dark Mode**: Premium deep navy and indigo aesthetic.
- **Glassmorphism**: Modern, transparent UI elements with blur effects.
- **Micro-animations**: Smooth transitions and hover effects for a premium feel.
- **Responsive**: Fully optimized for Mobile, Tablet, and Desktop.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

Built with ❤️ for Delhi-NCR's vibrant events ecosystem. 🇮🇳
