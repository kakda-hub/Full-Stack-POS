# ─── Stage 1: Build ─────────────────────────────
FROM node:18-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ─── Stage 2: Production ───────────────────────
FROM node:18-slim

WORKDIR /app

# Copy only package.json and install prod deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled files
COPY --from=builder /app/dist ./dist

# Non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]