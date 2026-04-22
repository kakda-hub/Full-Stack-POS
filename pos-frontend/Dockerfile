# STEP 1: Build Angular
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production

# STEP 2: Serve with nginx
FROM nginx:alpine

# 👉 IMPORTANT LINE
COPY --from=build /app/dist/pos-system/browser /usr/share/nginx/html

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf