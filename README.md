<div align="center">

# 🏪 Full-Stack POS System

**A production-ready, mobile-responsive Point of Sale system with NestJS backend, Angular frontend, and TiDB Cloud database**

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

## 📁 Project Structure

```
Full-Stack-POS/
├── pos-backend/                          # NestJS backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                     # JWT login, profile, password reset
│   │   │   ├── users/                    # User CRUD (admin only)
│   │   │   ├── products/                 # Product catalog, barcode, expiry tracking
│   │   │   ├── categories/               # Product categories
│   │   │   ├── sales/                    # Transaction-safe POS sales & loyalty allocation
│   │   │   ├── reports/                  # Business analytics & summary generators
│   │   │   ├── management/               # Dynamic navigation management
│   │   │   ├── upload/                   # File upload (MinIO/S3)
│   │   │   ├── upload-cloudinary/        # Cloudinary image upload
│   │   │   ├── upload-dynamic/           # Dynamic storage selection
│   │   │   ├── suppliers/                # Supplier management
│   │   │   ├── purchase-orders/          # Purchase order management
│   │   │   ├── stock-movements/          # Stock movement tracking
│   │   │   ├── returns/                  # Product returns management
│   │   │   ├── customers/                # Customer management & loyalty points
│   │   │   ├── khqr/                     # ABA KHQR payment QR generation
│   │   │   ├── quick-picks/              # Frequently bought items shortcuts
│   │   │   └── health/                   # Application health check
│   │   ├── common/                       # Guards, decorators, filters
│   │   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/               # @Roles(), @CurrentUser()
│   │   │   ├── filters/                  # HttpExceptionFilter
│   │   │   └── interceptors/             # ResponseInterceptor
│   │   ├── config/                       # DB, app, TypeORM CLI config
│   │   ├── database/
│   │   │   ├── migrations/               # Database migration files
│   │   │   └── seeders/                  # Seed scripts (products, sales, customers)
│   │   └── main.ts                       # Bootstrap entry point
│   ├── Dockerfile                        # Multi-stage production build
│   ├── docker-compose.yml                # Local MySQL + API services
│   ├── init.sql                          # Schema + seed data
│   ├── reset-migration.js                # Migration reset utility
│   └── package.json
│
├── pos-frontend/                         # Angular frontend application
│   ├── src/app/
│   │   ├── features/                     # Lazy-loaded feature modules
│   │   │   ├── dashboard/                # Admin interactive dashboard (NEW!)
│   │   │   ├── sales/                    # POS cashier cart, responsive drawer, payment modal
│   │   │   ├── products/                 # Product CRUD + stock + expiry mgmt
│   │   │   ├── categories/               # Category management
│   │   │   ├── reports/                  # Dashboard KPIs + interactive date range filters
│   │   │   ├── sales-history/            # Transaction history with search & filters
│   │   │   ├── users/                    # User management
│   │   │   ├── user-management/          # Role/permission config
│   │   │   ├── user-role/                # User role assignments
│   │   │   ├── permissions/              # Permission management
│   │   │   ├── login/                    # Authentication screen
│   │   │   ├── management-page/          # Dynamic page management
│   │   │   ├── cloudinary-file-upload/   # File upload UI
│   │   │   ├── suppliers/                # Supplier management
│   │   │   ├── purchase-orders/          # Purchase order management
│   │   │   ├── stock-movements/          # Stock movement tracking
│   │   │   ├── quick-picks/              # Quick-pick product shortcuts (NEW!)
│   │   │   └── page-not-found/           # 404 page
│   │   ├── core/                         # Guards, interceptors, services, models
│   │   ├── layout/                       # Admin & Cashier adaptive layout shells
│   │   ├── services/                     # HTTP services, auth, reactive state services
│   │   ├── shared/                       # Shared components, translation pipes, animations
│   │   ├── enums/                        # API endpoint constants
│   │   └── app-routing.module.ts         # Route configuration
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

## ⚙️ Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API listen port |
| `NODE_ENV` | `development` | Runtime environment |
| `FRONTEND_URL` | `*` | CORS allowed origin |
| `DB_HOST` | `localhost` | Database host (`mysql` inside Docker, TiDB gateway in prod) |
| `DB_PORT` | `3306` | DB port (3306 local MySQL, 4000 TiDB Cloud) |
| `DB_USER` | — | Database username |
| `DB_PASSWORD` | — | Database password |
| `DB_NAME` | `pos_db` | Database name |
| `DB_SSL` | `false` | Enable SSL (`true` required by TiDB Cloud) |
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

1. `DB_PASSWORD`
2. `DB_PASS` (legacy)
3. `DATABASE_PASSWORD`
4. `MYSQL_PASSWORD`
5. `MYSQL_ROOT_PASSWORD`
6. `TIDB_PASSWORD`
7. `MYSQL_PWD` (legacy)

### Environment validation

At startup the app **validates required environment variables** (via `ConfigModule`). In production (`NODE_ENV=production`) it additionally requires `JWT_SECRET` and `FRONTEND_URL`. If any required variable is missing, the application **fails to start with a clear error message** instead of booting misconfigured.

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
  "paymentMethod": "cash",
  "customerId": 2,
  "pointsRedeemed": 100
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

### 👥 Customers

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/customers` | admin | Create customer |
| GET | `/customers` | all | List all active customers |
| GET | `/customers/phone/:phone` | all | Find customer by phone number |
| POST | `/customers/phone/:phone/find-or-create` | all | Find by phone or auto-create |
| GET | `/customers/:id` | admin | Get customer by ID |
| PATCH | `/customers/:id` | admin | Update customer |
| DELETE | `/customers/:id` | admin | Deactivate customer |
| POST | `/customers/:id/points/add` | admin | Add loyalty points |
| POST | `/customers/:id/points/redeem` | all | Redeem points for discount |

### 📱 KHQR Payment

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/khqr/generate` | all | Generate ABA KHQR QR code for payment |

### ⚡ Quick Picks

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/quick-picks` | admin | Create quick-pick item |
| GET | `/quick-picks` | all | List active items |
| GET | `/quick-picks/:id` | admin | Get item by ID |
| PATCH | `/quick-picks/:id` | admin | Update item |
| DELETE | `/quick-picks/:id` | admin | Delete item |

### 🔄 Returns `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/returns` | Create return/refund (restocks inventory) |
| GET | `/returns` | List all returns (paginated) |
| GET | `/returns/:id` | Get return by ID |

### 📦 Suppliers `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers` | List active suppliers (paginated) |
| GET | `/suppliers/:id` | Get supplier by ID |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Deactivate supplier |

### 📋 Purchase Orders `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/purchase-orders` | Create purchase order |
| GET | `/purchase-orders` | List all (paginated) |
| GET | `/purchase-orders/:id` | Get by ID |
| PATCH | `/purchase-orders/:id/receive` | Receive order (updates stock) |
| DELETE | `/purchase-orders/:id` | Cancel order |

### 📊 Stock Movements `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-movements` | List all movements (paginated, filterable) |
| GET | `/stock-movements/product/:productId` | Get movements for a specific product |
| GET | `/stock-movements/near-expiry` | Get products near expiry (default: 30 days) |

### Swagger Auto-Authorization

The Swagger UI at `/api/docs` includes **auto-authorization**: after a successful login, the JWT token is automatically detected via a DOM MutationObserver and applied to all subsequent requests — no manual token copying needed.

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
                                          lowStockThreshold
                                          expiryDate
                                          created_at

customers           sales                 sale_items
─────────           ─────                 ──────────
id (PK)             id (PK)               id (PK)
name                user_id → users.id    sale_id → sales.id
phone (unique)      customer_id → cust.   product_id → products
loyalty_points      subtotal              quantity
total_spent         discount              price (snapshot)
total_purchases     tax                   discount (percentage)
created_at          total
                    payment_method
                    cash_received
                    change
                    points_redeemed
                    points_earned
                    created_at

management_pages     suppliers             purchase_orders
────────────────     ──────────            ───────────────
id (PK)             id (PK)               id (PK)
title / title_km    name                  supplier_id → suppliers.id
icon, type, url     contact_person        reference_number (unique)
permissions, badge   email                 status (pending/approved/received/cancelled)
sort_order          phone                 order_date
is_active           address               expected_delivery
parent_id (self-ref)  is_active           subtotal
description         created_at            tax
created_at / updated_at                    total
                                          notes
                                          created_at

quick_picks           purchase_order_items  stock_movements       returns
───────────           ───────────────────  ───────────────       ───────
id (PK)              id (PK)              id (PK)               id (PK)
product_id → products.id purchase_order_id  product_id → products  sale_id → sales.id
display_order        product_id → products  quantity_change      user_id → users.id
is_active            quantity              type (in/out/adjust)  reason
created_at           unit_cost             reference_type        status (pending/approved/rejected)
                     total                 reference_id          refund_amount
                                            notes                 created_at
                                            created_at
```

---

## 🛡 Role Permissions

| Module | Admin | Cashier |
|--------|:-----:|:-------:|
| Auth (login) | ✅ | ✅ |
| Profile | ✅ | ✅ |
| Dashboard Overview | ✅ | ❌ |
| Users CRUD | ✅ | ❌ |
| Customers (read) | ✅ | ✅ |
| Customers (write) | ✅ | ❌ |
| Categories (read) | ✅ | ✅ |
| Categories (write) | ✅ | ❌ |
| Products (read) | ✅ | ✅ |
| Products (write) | ✅ | ❌ |
| Sales (create) | ✅ | ✅ |
| Sales (read own) | ✅ | ✅ |
| Sales (read all) | ✅ | ❌ |
| KHQR Payment | ✅ | ✅ |
| Quick Picks (read) | ✅ | ✅ |
| Quick Picks (write) | ✅ | ❌ |
| Reports (analytics) | ✅ | ❌ |
| Suppliers & POs | ✅ | ❌ |
| Stock Movements | ✅ | ❌ |
| Product Returns | ✅ | ❌ |

---

## 🌿 Branch Strategy & Merge Workflow

This project uses **two long-lived branches that share the exact same source code**. The only difference between them is the **runtime environment**, which is configured entirely through **environment variables** — never hardcoded.

```
feature/*
   │
   ▼
master          ← Local development (Docker + MySQL, SSL disabled)
   │
   ▼
main            ← Production (Render + TiDB Cloud, SSL enabled)
   │
   ▼
Render Auto Deploy
```

| Branch | Environment | Database | SSL |
|--------|-------------|----------|-----|
| **master** | Development | Local MySQL (Docker) | `DB_SSL=false` |
| **main** | Production | TiDB Cloud | `DB_SSL=true` |

### How the environment is chosen

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` in `pos-backend/.env` (local) or Render's Environment tab (production) determine the database.
- The application reads these values at startup via `ConfigService` and **fails fast** if required production variables are missing.
- Database credentials are **never stored in Git**. `pos-backend/.env` is git-ignored; only the placeholder template `.env.example` is committed.

### Merge workflow

```bash
# Develop on a feature branch
git checkout -b feature/my-change master
# ... commit work ...

# Merge into master (local dev) and test locally
git checkout master
git merge feature/my-change

# Promote to main (production) once verified
git checkout main
git merge master

# Render auto-deploys the main branch — no credential changes needed
```

**Why credentials never break during merge:**

- `master` uses **local MySQL** credentials from your local `.env` — never committed.
- `main` uses **TiDB Cloud** credentials that live only in the **Render dashboard** → Environment tab.
- Merging `master → main` only changes application code, never database config.

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

# 3. Set environment variables in Render dashboard (production values):
#    DB_HOST=<TiDB Cloud gateway host>
#    DB_PORT=4000
#    DB_USER=<TiDB username>
#    DB_PASSWORD=<TiDB password>
#    DB_NAME=<database>
#    DB_SSL=true
#    JWT_SECRET=<strong random secret>
#    NODE_ENV=production
#    FRONTEND_URL=https://pos-frontend.vercel.app
```

### TiDB Cloud

1. Create a free **Serverless** cluster at [tidbcloud.com](https://tidbcloud.com).
2. Copy the connection details → MySQL protocol → **Host** (e.g. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`), **Port** `4000`, **Username**, and **Password**.
3. Put those values in Render's Environment tab with `DB_SSL=true`. TiDB Cloud requires SSL, which the app enables automatically when `DB_SSL=true`.
4. `DB_NAME` defaults to `pos_db`; run migrations on Render with `npm run migration:run` (or the health check will apply them at startup).

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
