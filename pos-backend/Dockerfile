# # ─── Stage 1: Build ───────────────────────────────────────────────────────────
# FROM node:18-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm install  # use install instead of ci

# COPY . .
# RUN npm run build

# # ─── Stage 2: Production ──────────────────────────────────────────────────────
# FROM node:18-alpine AS production

# WORKDIR /app

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY package*.json ./

# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

# EXPOSE 3000
# CMD ["node", "dist/main"]

# ─── Stage 1: Build ─────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ─── Stage 2: Production ───────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy only package.json and install prod deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled files
COPY --from=builder /app/dist ./dist

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]