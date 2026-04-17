import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Output ────────────────────────────────────────────────────
  // "standalone" bundles everything needed for deployment (Vercel/Docker)
  output: "standalone",
  transpilePackages: ["lucide-react"],

  // ── Image Optimization ─────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.evbuc.com" },
      { protocol: "https", hostname: "secure.meetupstatic.com" },
      { protocol: "https", hostname: "**.eventbrite.com" },
      { protocol: "https", hostname: "**.meraevents.com" },
      { protocol: "https", hostname: "media.unstop.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],  // modern formats, avif is ~50% smaller
    minimumCacheTTL: 3600,                 // cache optimized images for 1 hour
    deviceSizes: [320, 480, 640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },

  // ── Compression ────────────────────────────────────────────────
  compress: true,

  // ── Poweredby header ───────────────────────────────────────────
  poweredByHeader: false,

  // ── React Strict Mode ─────────────────────────────────────────
  reactStrictMode: true,

  experimental: {
    optimizeCss: false,         // disabled to fix 'critters' missing error
  },

  // ── Compiler ──────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Security + Cache Headers ───────────────────────────────────
  async headers() {
    if (process.env.NODE_ENV === "development") return [];
    
    return [
      // ── Security on all pages ────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",      value: "on" },
        ],
      },
      // ── Next.js static assets — immutable (1 year) ───────────
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ── API routes — no cache ────────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      // ── Public pages — stale-while-revalidate ────────────────
      {
        source: "/(events|delhi-events|noida-events|category|search)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=60" },
        ],
      },
      // ── Home page — cache at CDN level ───────────────────────
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=30" },
        ],
      },
      // ── Favicon / robots ────────────────────────────────────
      {
        source: "/(favicon.ico|robots.txt|sitemap.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────
  async redirects() {
    return [
      { source: "/events/delhi",  destination: "/delhi-events",  permanent: true },
      { source: "/events/noida",  destination: "/noida-events",  permanent: true },
      { source: "/delhi",         destination: "/delhi-events",  permanent: true },
      { source: "/noida",         destination: "/noida-events",  permanent: true },
    ];
  },

  // ── Rewrites (API proxy for local dev) ────────────────────────
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    // In production on Vercel, the frontend hits the backend directly.
    // Locally, we can proxy through Next.js to avoid CORS issues.
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/proxy/:path*",
          destination: `${API_URL}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
