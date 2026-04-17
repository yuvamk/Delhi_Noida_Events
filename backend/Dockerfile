# ─── Stage 1: Dependencies ──────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install system deps needed for native modules
RUN apk add --no-cache libc6-compat

COPY package*.json ./
# ci = clean install (faster, reproducible)
RUN npm ci --only=production --ignore-scripts \
  && cp -r node_modules prod_node_modules \
  && npm ci --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TypeScript
RUN npm run build

# ─── Stage 3: Runtime ────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# dumb-init: proper PID 1, signal forwarding, zombie reaping
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 expressjs

# Copy only what's needed in production
COPY --from=deps    /app/prod_node_modules ./node_modules
COPY --from=builder /app/dist             ./dist
COPY --from=builder /app/package.json     ./package.json

# Create log dir owned by app user
RUN mkdir -p logs && chown -R expressjs:nodejs logs

USER expressjs

EXPOSE 5000

# Healthcheck (container orchestrator liveness)
HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=15s \
  --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/ready || exit 1

# dumb-init handles signals properly in Docker
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max-old-space-size=512", "--optimize-for-size", "dist/server.js"]
