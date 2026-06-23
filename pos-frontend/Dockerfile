# ─── Stage 1: Development (hot reload) ──────────────────────────
FROM node:20-alpine as development

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]

# ─── Stage 2: Build for production ──────────────────────────────
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production

# ─── Stage 3: Serve with nginx ────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist/pos-system/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80