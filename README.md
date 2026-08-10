<div align="center">

# 🏪 Full-Stack POS System

**A production-ready, mobile-responsive Point of Sale system with NestJS backend, Angular frontend, and TiDB Cloud database**

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-2-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Khmer/English](https://img.shields.io/badge/Khmer%20%7C%20English-bilingual-4285F4?style=for-the-badge&logo=googletranslate&logoColor=white)](https://github.com/ngx-translate/core)

</div>

---

## 🚀 Demo

Try the live demo: **[https://full-stack-mtmlk3z7r-full-stack-pos.vercel.app/dashboard](https://full-stack-mtmlk3z7r-full-stack-pos.vercel.app/dashboard)**

> 🔑 Login with `admin@pos.com` / `admin123` (Admin) or `cashier@pos.com` / `cashier123` (Cashier)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development (No Docker)](#-local-development-no-docker)
- [Environment Variables](#-environment-variables)
- [Backend API Reference](#-backend-api-reference)
- [Frontend Features](#-frontend-features)
- [Database Schema](#-database-schema)
- [Role Permissions](#-role-permissions)
- [Branch Strategy & Merge Workflow](#-branch-strategy--merge-workflow)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)
- [Production Checklist](#-production-checklist)

---

## 📖 Overview

Full-Stack POS is a complete, enterprise-grade Point of Sale system built for modern retail businesses and mini-marts. It features Khmer/English bilingual support, role-based access for admins and cashiers, multi-payment methods, real-time inventory tracking, supply chain metrics, thermal-optimized receipt generation, and a fully polished, responsive layout designed for both desktops and mobile devices.

---

## ✨ Key Features

### 📊 Modern Interactive Admin Dashboard (NEW!)
- **Dynamic Welcome & Metrics**: Personal greeting based on the user's local time, accompanied by live KPI metrics (Total Products, Low Stock, Near-Expiry, Daily Transactions).
- **Inventory Safety Nets**: Integrated **Near-Expiry Alerts** dynamically detecting and flagging products expiring within the next 30 days to prevent retail losses.
- **Top Sellers & Activity**: Displays visual progress indicators for the Top 5 Selling Products and a real-time list of recent sales transactions.

### 📅 Advanced Report Filters & Analytics (NEW!)
- **Dynamic Date Ranges**: Offers intuitive report preset filters (Today, This Week, This Month) and custom date-range calendar pickers.
- **Bi-Lingual Charting & Stats**: Smooth localization in both Khmer and English, feeding clean analytical data to the business intelligence metrics page.

### 📱 Responsive Mobile Cashier Experience (NEW!)
- **Responsive Adaptive Design**: Clean transitions from desktop monitor scales to mobile screens on the main Sales feature.
- **Mobile Bottom Cart Drawer**: Replaces the desktop right-sidebar with a custom slide-out bottom drawer using smooth cubic-bezier CSS/Angular animations.
- **Active Grid Highlights**: Visually overlays item quantity badges and selected-state borders on the main product grid so cashiers instantly know what's in their cart.
- **Localized Confirmation Modals**: Uses localized, modern Angular Material dialog popups in place of generic browser alerts when clearing active carts.

### 💵 Loyalty Points & Flexible Payment Systems (NEW!)
- **Customer Rewards System**: Integrated customer lookup by phone number directly at checkout, displaying loyalty points balances, lifetime purchases, and total spent.
- **Points Redemption**: Cashiers can redeem customer points (e.g., 100 points = $1.00 USD discount) to instantly update checkout totals.
- **Real-Time ABA KHQR QR Generation**: Dynamic generation of compliant EMV-co QR codes complete with loading indicators and fallback retry prompts.
- **Change Calculator**: Automatic calculation of cash changes with convenient, clickable Quick-Cash dollar buttons.

### 🖨️ Thermal-Optimized Receipt Generation
- Styled and formatted specifically for standard **80mm thermal hardware printers**.
- Automatically renders customer details, points earned, points redeemed, item-level discounts, VAT, payment methods, and customized thank-you footers in the user's chosen language.

### 🔄 Full Supply Chain Management (NEW!)
- **Supplier Directory**: Complete supplier management with contact details, email, phone, and address records.
- **Purchase Orders**: Full PO lifecycle — Draft → Pending → Approved → Received → Cancelled with reference tracking and itemized costing.
- **Stock Movements**: Comprehensive audit trail logging all stock In/Out/Adjustment operations with reference linking.
- **Product Returns**: Admin-managed return/refund processing with automatic inventory restocking.
- **Real-Time Inventory Deduction**: Instant stock reduction during sales transaction commits.
- **Near-Expiry Detection**: Automatic flagging of products expiring within 30 days.

### ⚡ Quick Picks — Fast Checkout Items (NEW!)
- **Frequently Bought Items**: Configurable quick-pick product shortcuts for faster checkout workflows.
- **Admin-Managed**: Full CRUD with active/inactive toggling for seasonal item rotation.

### 👤 Avatar & Profile Management (NEW!)
- **User Avatar Uploads**: Profile picture upload and management for all users.
- **Cloudinary & MinIO Support**: Multi-storage image hosting with automatic optimization and resizing.

### ☁️ Cloudinary Media Manager (NEW!)

- **UI Sign-In Gate**: The Cloudinary media manager is protected by its own lightweight sign-in screen at `/cloudinary-file-upload/sign-in`. It's a UI-only gate — real Cloudinary credentials stay configured server-side.
- **Session Persistence**: "Stay signed in" keeps the session in `localStorage` (survives browser restarts); otherwise it uses `sessionStorage` (cleared when the tab closes). A **Sign Out** button on the list page clears the session and returns to sign-in.
- **Full Media Management**: Upload with drag & drop and folder selection, server-side search/sort/pagination, KPI stats (total files, size, formats), image lightbox previews, and one-click copy of public IDs and URLs.

---

### 📸 UI Preview

> Browse the **[🎨 Interactive UI Mockup Gallery](pos-frontend/src/assets/ui-mockups.html)** — a beautifully designed CSS preview of all 10 key screens:

| Screen | Description |
|--------|-------------|
| 🔐 **Login** | Brand panel with language toggle, demo login buttons |
| 🛒 **Cashier POS** | Product grid, category filters, barcode search, cart sidebar |
| 💳 **Payment Modal** | Cash/ABA/Card methods, change calculator, quick-cash buttons |
| 🧾 **Receipt** | 80mm thermal printer format with item details & totals |
| 📊 **Admin Dashboard** | KPI metrics, inventory alerts, top sellers |
| 📈 **Reports** | Bar charts, revenue trends, payment breakdown |
| 📜 **Sales History** | Transaction list with payment method badges |
| 👥 **User Management** | User cards with avatars, roles, online status |
| 📂 **Management Pages** | Tree navigation structure with URL paths |
| 🔑 **User Roles** | Role assignment with admin/cashier grouping |

### Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://full-stack-mtmlk3z7r-full-stack-pos.vercel.app/dashboard](https://full-stack-mtmlk3z7r-full-stack-pos.vercel.app/dashboard) |
| **Backend API** | [https://full-stack-pos.onrender.com/api/v1](https://full-stack-pos.onrender.com/api/v1) |
| **Swagger Docs** | [https://full-stack-pos.onrender.com/api/docs](https://full-stack-pos.onrender.com/api/docs) |

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@pos.com` | `admin123` |
| 👤 Cashier | `cashier@pos.com` | `cashier123` |

---

## 🛠 Tech Stack

### Backend (`pos-backend/`)

| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Enterprise Node.js MVC framework |
| **TypeORM 0.3** | Object-Relational Mapping (ORM) with MySQL driver |
| **MySQL 8.4 / TiDB Cloud** | Highly-available MySQL-compatible database |
| **Passport + JWT** | Sessionless JWT Authentication |
| **bcryptjs** | Password hashing |
| **class-validator** | Strongly-typed DTO validation |
| **Helmet** | Security HTTP headers |
| **Swagger** | Live interactive API documentation |
| **Cloudinary / MinIO** | Multi-channel file and image storage |
| **Sharp** | High-performance image processing & resizing |

### Frontend (`pos-frontend/`)

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Next-generation web platform |
| **Angular Signals** | Fine-grained, high-performance reactive state management |
| **Angular Material** | Premium accessible UI components (dialogs, tables) |
| **Tailwind CSS 3** | Utility-first styling with comprehensive grid architectures |
| **@ngx-translate** | Dynamic internationalization with instant language toggling |

### Infrastructure & Operations

| Tool | Purpose |
|------|---------|
| **Docker** | Component isolation & deployment standardization |
| **Render** | Microservice and background process container hosting |
| **Vercel** | Edge-optimized frontend hosting |
| **TiDB Cloud** | Serverless MySQL-compatible cloud database |

---

## 🚀 Quick Start (Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) v20+ (for local development)

### Step 1: Configure Environment

Create a `pos-backend/.env` file with the following content:

```env
# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=8h

# Database (Local MySQL via Docker)
DB_HOST=mysql
DB_PORT=3306
DB_USER=pos_user
DB_PASSWORD=pos_password
DB_NAME=pos_db
DB_SSL=false

# MinIO / S3 (local dev — optional, enables file uploads)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=pos-uploads

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ABA Merchant Details (optional)
KHQR_MERCHANT_NAME=MiniMart Store
KHQR_MERCHANT_CITY="Phnom Penh"
KHQR_BANK_ACCOUNT=demo@aba
KHQR_CURRENCY=USD
KHQR_STORE_LABEL="Main Branch"
KHQR_MERCHANT_ID=minimart001
KHQR_ACQUIRING_BANK="ABA Bank"
```

### Step 2: Start All Services

```bash
# From project root
docker compose up -d
```

| Service | Container | URL |
|---------|-----------|-----|
| 🌐 Frontend | `projectpos-frontend` | http://localhost:4200 |
| ⚙️ Backend API | `projectpos-backend` | http://localhost:3000 |
| 🗄️ MySQL | `projectpos-mysql` | Port 3306 |
| 🗃️ MinIO | `projectpos-minio` | http://localhost:9090 (Console) |

### Step 3: Access the App

1. Open **http://localhost:4200** — Frontend POS application
2. Login with `admin@pos.com` / `admin123`
3. API docs at **http://localhost:3000/api/docs** — Swagger with auto-auth

### Seed Data

The `init.sql` script runs automatically on MySQL startup, creating:
- **Users** — Admin (`admin@pos.com`), Cashier (`cashier@pos.com`)
- **Categories** — Beverages, Food, Snacks, Dairy
- **Management Pages** — Navigation structures and permission matrices
- **Sample Products** — Complete with barcodes and pricing metrics

---

## 💻 Local Development (No Docker)

### Backend

```bash
cd pos-backend
npm install

# Optional: Start MySQL via Docker
docker compose up -d mysql

# Start NestJS backend with hot-reload
npm run start:dev
```

### Frontend

```bash
cd pos-frontend
npm install --legacy-peer-deps

# Start Angular local development server
npm start

# Serves at http://localhost:4200
# Proxies /api requests to http://localhost:3000 (via proxy.conf.js)
```

---

## 🐳 Useful Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after changes
docker compose build --no-cache backend
docker compose up -d

# Run database migrations
docker compose exec api npm run migration:run

# Access MySQL shell
docker compose exec mysql mysql -u pos_user -p pos_db

# Stop everything
docker compose down

# Reset database (⚠️ destroys data volume)
docker compose down -v && docker compose up -d
```

---

## 🏗 Production Checklist

- [ ] Generate a strong `JWT_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Run database migrations (`npm run migration:run`)
- [ ] Change default admin password immediately
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Enable SSL (`DB_SSL=true`) for database connection
- [ ] Set up automated database backups
- [ ] Configure Cloudinary credentials for image uploads
- [ ] Add rate limiting for auth endpoints
- [ ] Monitor with Render's built-in metrics

---

<div align="center">
Built with ❤️ using NestJS, Angular, and TiDB Cloud
</div>
