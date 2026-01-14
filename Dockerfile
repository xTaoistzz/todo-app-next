# # -------------------------------
# # Dependencies Stage
# # -------------------------------
# FROM node:22-alpine AS deps
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install production dependencies
# # ไม่ใช้ --prefer-offline เพื่อให้ได้ latest patches
# RUN npm ci --only=production && \
#     npm cache clean --force

# # -------------------------------
# # Builder Stage
# # -------------------------------
# FROM node:22-alpine AS builder
# WORKDIR /app

# # Copy production dependencies
# COPY --from=deps /app/node_modules ./node_modules
# COPY package*.json ./

# # Install dev dependencies for build
# RUN npm install --only=development

# # Copy source code
# COPY . .

# # Build with production optimizations
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV NODE_ENV=production

# # Build Next.js - standalone จะ optimize ให้อัตโนมัติ
# RUN npm run build

# # -------------------------------
# # Runner Stage (Performance-First)
# # -------------------------------
# FROM node:22-alpine AS runner
# WORKDIR /app

# # Install runtime dependencies
# RUN apk add --no-cache \
#     tini \
#     && rm -rf /var/cache/apk/*

# # Set production environment
# ENV NODE_ENV=production \
#     PORT=3000 \
#     NEXT_TELEMETRY_DISABLED=1 \
#     HOSTNAME="0.0.0.0"

# # Create non-root user
# RUN addgroup --system --gid 1001 nodejs && \
#     adduser --system --uid 1001 nextjs

# # Copy standalone output with all necessary dependencies
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# # Switch to non-root user
# USER nextjs

# EXPOSE 3000

# # Use tini for proper signal handling and process management
# ENTRYPOINT ["/sbin/tini", "--"]

# # Start Next.js with optimal Node.js flags for performance
# CMD ["node", "--max-old-space-size=512", "server.js"]

# # Expected size: ~200-250MB with full performance
# # ไม่ลบ source maps ที่อาจจำเป็นสำหรับ error tracking
# # ไม่ optimize จนเกินไปที่ส่งผลต่อ runtime performance

# -------------------------------
# Dependencies Stage
# -------------------------------
# -------------------------------
# Dependencies Stage
# -------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# -------------------------------
# Builder Stage
# -------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

RUN npm install --only=development
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# -------------------------------
# Runtime Stage (Next.js only)
# -------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
# Expected size: ~350MB
# Nginx as reverse proxy/webserver → Next.js backend