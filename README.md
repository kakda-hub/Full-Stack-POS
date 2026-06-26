<div align="center">

# 🏪 Full-Stack POS System

**A production-ready Point of Sale system with NestJS backend, Angular frontend, and TiDB Cloud database**

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development (No Docker)](#-local-development-no-docker)
- [Environment Variables](#-environment-variables)
- [Backend API Reference](#-backend-api-reference)
- [Frontend Features](#-frontend-features)
- [Database Schema](#-database-schema)
- [Role Permissions](#-role-permissions)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)
- [Production Checklist](#-production-checklist)

---

## 📖 Overview

Full-Stack POS is a complete Point of Sale system built for modern retail businesses. It features Khmer/English bilingual support, role-based access for admin and cashier roles, multi-payment methods (Cash, ABA scan-to-pay, Card), real-time inventory tracking, business intelligence reports, thermal printer-optimized receipts, and barcode scanning.

### Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://pos-frontend.vercel.app](https://pos-frontend.vercel.app) |
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
| **NestJS 10** | Application framework |
| **TypeORM 0.3** | ORM with MySQL driver |
| **MySQL 8.4 / TiDB Cloud** | Database |
| **Passport + JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **class-validator** | DTO validation |
| **Helmet** | Security headers |
| **Swagger** | API documentation |
| **Cloudinary / MinIO** | Image/file storage |
| **Sharp** | Image processing |

### Frontend (`pos-frontend/`)

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Frontend framework |
| **Angular Material** | UI components (dialogs, tables) |
| **Tailwind CSS 3** | Utility-first styling |
| **@ngx-translate** | i18n (Khmer/English) |
| **Angular Signals** | Reactive state management |

### Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Render** | Backend hosting |
| **Vercel** | Frontend hosting |
| **TiDB Cloud** | Managed MySQL-compatible database |

---

## 📁 Project Structure

```
Full-Stack-POS/
├── pos-backend/                          # NestJS backend API
│   ├── src/
│   │   ├── auth/                         # JWT login, profile, password reset
│   │   ├── users/                        # User CRUD (admin only)
│   │   ├── products/                     # Product catalog, barcode lookup
│   │   ├── categories/                   # Product categories
│   │   ├── sales/                        # Transaction-safe POS sales
│   │   ├── reports/                      # Business intelligence reports
│   │   ├── management/                   # Dynamic navigation management
│   │   ├── upload/                       # File upload (MinIO/S3)
│   │   ├── upload-cloudinary/            # Cloudinary image upload
│   │   ├── upload-dynamic/               # Dynamic storage selection
│   │   ├── common/                       # Guards, decorators, filters
│   │   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/               # @Roles(), @CurrentUser()
│   │   │   ├── filters/                  # HttpExceptionFilter
│   │   │   └── interceptors/             # ResponseInterceptor
│   │   ├── config/                       # DB, app, TypeORM CLI config
│   │   └── main.ts                       # Bootstrap entry point
│   ├── Dockerfile                        # Multi-stage production build
│   ├── docker-compose.yml                # Local MySQL + API services
│   ├── init.sql                          # Schema + seed data
│   └── package.json
│
├── pos-frontend/                         # Angular frontend application
│   ├── src/app/
│   │   ├── features/                     # Lazy-loaded feature modules
│   │   │   ├── sales/                    # POS cart, payment, receipt
│   │   │   ├── products/                 # Product CRUD + stock mgmt
│   │   │   ├── categories/               # Category management
│   │   │   ├── reports/                  # Dashboard KPIs + charts
│   │   │   ├── sales-history/            # Transaction history
│   │   │   ├── users/                    # User management
│   │   │   ├── user-management/          # Role/permission config
│   │   │   ├── user-role/                # User role assignments
│   │   │   ├── login/                    # Authentication screen
│   │   │   ├── management-page/          # Dynamic page management
│   │   │   ├── cloudinary-file-upload/   # File upload UI
│   │   │   └── page-not-found/           # 404 page
│   │   ├── layout/                       # Admin & Cashier layouts
│   │   ├── services/                     # HTTP services, auth, data
│   │   ├── shared/                       # Components, pipes, animations
│   │   └── enums/                        # API endpoint constants
│   ├── assets/i18n/                      # en.json, km.json translations
│   ├── Dockerfile                        # Multi-stage nginx build
│   ├── nginx.conf                        # Production nginx config
│   └── vercel.json                       # Vercel deployment config
│
├── docker-compose.yml                    # Root orchestration (all services)
└── README.md                             # This file
```

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
DB_HOST=db
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
| 🗃️ MinIO | `projectpos-minio` | http://localhost:9001 (Console) |

### Step 3: Access the App

1. Open **http://localhost:4200** — Frontend POS application
2. Login with `admin@pos.com` / `admin123`
3. API docs at **http://localhost:3000/api/docs** — Swagger with auto-auth

### Seed Data

The `init.sql` script runs automatically on MySQL startup, creating:
- **Users** — Admin (`admin@pos.com`) and Cashier (`cashier@pos.com`)
- **Categories** — Beverages, Food, Snacks, Dairy
- **Management Pages** — Navigation structure with permissions

---

## 💻 Local Development (No Docker)

### Backend

```bash
cd pos-backend
npm install

# Optional: Start MySQL via Docker
docker compose up -d mysql

# Start with hot-reload
npm run start:dev
```

### Frontend

```bash
cd pos-frontend
npm install --legacy-peer-deps
npm start

# Serves at http://localhost:4200
# Proxies /api requests to http://localhost:3000 (via proxy.conf.js)
```

---

## ⚙️ Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API listen port |
| `NODE_ENV` | `development` | Runtime environment |
| `FRONTEND_URL` | `*` | CORS allowed origin |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `4000` | DB port (3306 local, 4000 TiDB Cloud) |
| `DB_USER` | `root` | Database username |
| `DB_PASS` | — | Database password (checked first) |
| `DB_PASSWORD` | — | Database password (fallback) |
| `DB_NAME` | `pos_db` | Database name |
| `DB_SSL` | `true` | Enable SSL connection |
| `JWT_SECRET` | — | **Required in production** (32+ chars) |
| `JWT_EXPIRES_IN` | `8h` | JWT token lifetime |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | Cloudinary API secret |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `PROXY_TARGET` | `http://localhost:3000` | Backend URL for dev proxy |
| `apiUrl` (dev) | `''` | Backend API URL (empty = same origin) |
| `apiUrl` (prod) | `https://pos-backend.onrender.com` | Production API URL |

### Database Password Resolution

The system checks these env vars in order and uses the first one found:

1. `DB_PASS`
2. `DB_PASSWORD`
3. `DATABASE_PASSWORD`
4. `MYSQL_PASSWORD`
5. `MYSQL_ROOT_PASSWORD`
6. `TIDB_PASSWORD`
7. `MYSQL_PWD` (legacy)

---

## 📡 Backend API Reference

**Base URL:** `/api/v1`

All responses follow a consistent envelope format:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### 🔑 Authentication

`POST /api/v1/auth/login` — Get JWT token

```json
{ "email": "admin@pos.com", "password": "admin123" }
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@pos.com",
    "role": "admin"
  }
}
```

All subsequent requests require: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/login` | ❌ | Login and receive JWT |
| GET | `/auth/profile` | ✅ | Get current user profile |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password with token |

### 👥 Users `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### 📂 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/categories` | admin | Create category |
| GET | `/categories` | all | List all categories |
| GET | `/categories/:id` | all | Get category by ID |
| PATCH | `/categories/:id` | admin | Update category |
| DELETE | `/categories/:id` | admin | Delete category |

### 📦 Products

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/products` | admin | Create product |
| GET | `/products` | all | List products (paginated) |
| GET | `/products/:id` | all | Get product by ID |
| GET | `/products/barcode/:barcode` | all | Find by barcode |
| PATCH | `/products/:id` | admin | Update product |
| PATCH | `/products/:id/stock` | admin | Adjust stock quantity |
| DELETE | `/products/:id` | admin | Deactivate product |

### 🧾 Sales

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/sales` | all | Create sale (validates stock, deducts) |
| GET | `/sales` | all | List sales (cashier: own only) |
| GET | `/sales/:id` | all | Get sale details |

**POST /sales:**

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "discount": 1.0,
  "tax": 0.5,
  "paymentMethod": "cash"
}
```

Payment methods: `cash` | `aba` | `card`

### 📊 Reports `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Dashboard KPIs + low-stock alerts |
| GET | `/reports/daily-revenue` | Revenue grouped by day |
| GET | `/reports/top-products?limit=5` | Best-selling products |
| GET | `/reports/payment-summary` | Revenue by payment method |
| GET | `/reports/sales-by-cashier` | Performance per cashier |

All reports accept optional `from` and `to` query params (`YYYY-MM-DD`).

### 📄 Management Pages `[admin]`

GET `/management-pages` — List dynamic navigation pages

### 🖼️ File Uploads

| Endpoint | Storage | Description |
|----------|---------|-------------|
| `/upload` | MinIO/S3 | General file upload |
| `/upload-cloudinary` | Cloudinary | Cloudinary image upload |
| `/upload-dynamic` | Configurable | Dynamic storage selection |

### Swagger Auto-Authorization

The Swagger UI at `/api/docs` includes **auto-authorization**: after a successful login, the JWT token is automatically detected via a DOM MutationObserver and applied to all subsequent requests — no manual token copying needed.

---

## 🎨 Frontend Features

### Cashier View (`/sales`)

- **Product grid** with category filter tabs
- **Barcode scanner** support (type barcode + Enter)
- **Shopping cart** with quantity controls
- **Discount & tax** controls
- **Multi-payment modal** — Cash (with change calculation), ABA (QR scan), Card
- **Receipt** — 80mm thermal printer-optimized format
- **Real-time** reactive state via Angular Signals

### Admin View

- **Products** — Full CRUD with barcode, category, stock, image management
- **Categories** — Product category management
- **Reports** — Dashboard with revenue KPIs, payment breakdown, top products
- **Sales History** — Full transaction history with search and filters
- **Users** — User management with role assignments
- **User Roles** — Role and permission configuration
- **Management Pages** — Dynamic navigation page management
- **File Uploads** — Cloudinary integration for image storage

### Shared Features

- 🌐 **Khmer/English** language switching (real-time, no reload, persisted)
- 🎨 **Responsive design** — Works on desktop and tablet
- 🔐 **Role-based routing** — Guards protect admin routes
- 📄 **Pagination** — All list views support paginated data
- 🎞 **Animations** — Smooth transitions throughout

---

## 🗄 Database Schema

```
users               categories            products
────────            ──────────            ────────
id (PK)             id (PK)               id (PK)
name                name                  name
email (unique)      name_kh               name_kh
password (hashed)   description           img_url
role (admin/cashier) img_url              barcode (unique)
is_active           is_active             price
avatar_url          created_at            stock
reset_token                               category_id → categories.id
reset_token_expiry                        description
created_at                                is_active
                                          created_at

sales               sale_items            file_uploads
─────               ──────────            ────────────
id (PK)             id (PK)               id (PK)
user_id → users.id  sale_id → sales.id    original_file_name
subtotal            product_id → products  file_name
discount            quantity              file_path / file_url
tax                 price (snapshot)      file_extension
total                                     file_size
payment_method                            upload_type
created_at                                destination_storage
                                          public_id (Cloudinary)
                                          created_at

management_pages
────────────────
id (PK)
title / title_km
icon, type, url
permissions, badge
sort_order
is_active
parent_id (self-ref)
created_at / updated_at
```

---

## 🛡 Role Permissions

| Module | Admin | Cashier |
|--------|:-----:|:-------:|
| Auth (login) | ✅ | ✅ |
| Profile | ✅ | ✅ |
| Users CRUD | ✅ | ❌ |
| Categories (read) | ✅ | ✅ |
| Categories (write) | ✅ | ❌ |
| Products (read) | ✅ | ✅ |
| Products (write) | ✅ | ❌ |
| Sales (create) | ✅ | ✅ |
| Sales (read own) | ✅ | ✅ |
| Sales (read all) | ✅ | ❌ |
| Reports | ✅ | ❌ |
| Management Pages | ✅ | ❌ |

---

## 🚢 Deployment

### Backend — Render

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repo to Render:
#    → New Web Service → Select repo
#    → Runtime: Docker
#    → Root Directory: pos-backend

# 3. Set environment variables in Render dashboard:
#    DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT=4000
#    DB_SSL=true, JWT_SECRET, NODE_ENV=production
#    FRONTEND_URL=https://pos-frontend.vercel.app
```

### Frontend — Vercel

```bash
# Option 1: Connect repo via Vercel dashboard
#    → Root Directory: pos-frontend
#    → Build Command: npm run build
#    → Output Dir: dist/pos-system/browser

# Option 2: CLI
vercel --prod
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

### Backend Scripts

```bash
cd pos-backend
npm run start:dev       # Dev mode with hot-reload
npm run build           # Production build
npm run start:prod      # Run production build
npm run migration:run   # Apply database migrations
npm run migration:generate -- src/migrations/MigrationName  # Create migration
npm run lint            # ESLint
npm run test            # Run tests
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
