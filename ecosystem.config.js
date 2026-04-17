/**
 * PM2 Ecosystem Configuration
 * ─────────────────────────────────────────────────────────────
 * Run with:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js --env production  ← zero-downtime reload
 *   pm2 logs dne-backend
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      // ── Backend API ──────────────────────────────────────────
      name: "dne-backend",
      script: "dist/server.js",
      cwd: "./backend",

      // Cluster mode: spawn 1 worker per CPU core
      instances: "max",           // or set to number like 4
      exec_mode: "cluster",

      // Restart policy
      watch: false,               // disable file watching in production
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",          // must stay up 10s to count as "started"
      restart_delay: 1000,        // 1s between restarts

      // Memory: restart if worker exceeds 512MB
      max_memory_restart: "512M",

      // Graceful shutdown: wait for requests to finish
      kill_timeout: 15000,        // 15s before SIGKILL
      listen_timeout: 10000,      // 10s for app to listen on port
      shutdown_with_message: true, // send 'shutdown' message before SIGTERM

      // Environment — development
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },

      // Environment — production
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        TRUST_PROXY: 1,
        GLOBAL_RATE_LIMIT: 500,   // increased limit with Redis rate limiting
        REQUEST_TIMEOUT_MS: 15000,
        MEM_LIMIT_MB: 512,
      },

      // Logging
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,           // combine cluster logs into one file
      log_type: "json",

      // Source maps for better error stack traces
      source_map_support: true,

      // Node.js flags for production performance
      node_args: [
        "--max-old-space-size=512",          // match max_memory_restart
        "--optimize-for-size",
        "--gc-interval=100",                 // more frequent GC
      ],
    },

    {
      // ── Scraper Worker ──────────────────────────────────────
      name: "dne-scraper",
      script: "main.py",
      interpreter: "python3",
      cwd: "./scraper",

      instances: 1,               // scraper is single instance
      exec_mode: "fork",

      watch: false,
      autorestart: true,
      cron_restart: "0 */6 * * *", // restart every 6h (triggers a scrape run)
      max_restarts: 5,
      max_memory_restart: "256M",

      env: {
        PYTHONUNBUFFERED: 1,      // see Python output in real-time
      },
      env_production: {
        PYTHONUNBUFFERED: 1,
        SCRAPER_MODE: "scheduled",
      },

      out_file: "./logs/scraper-out.log",
      error_file: "./logs/scraper-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],

  // ── Deploy Configuration ───────────────────────────────────
  deploy: {
    production: {
      user: "ubuntu",
      host: ["your-render-server.com"],
      ref: "origin/main",
      repo: "git@github.com:your-org/delhi-noida-events.git",
      path: "/home/ubuntu/delhi-noida-events",
      "pre-deploy-local": "",
      "post-deploy":
        "cd backend && npm ci && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
