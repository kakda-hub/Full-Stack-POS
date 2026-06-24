# ═══════════════════════════════════════════════════════════════════
#  STAGE 1: Install dependencies & build
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (layer caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# ═══════════════════════════════════════════════════════════════════
#  STAGE 2: Production runtime (minimal image)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1 || exit 1

CMD ["node", "dist/main.js"]
