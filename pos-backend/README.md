<div align="center">

# ⚙️ POS Backend — NestJS REST API

**A production-ready Point of Sale REST API built with NestJS, TypeORM, MySQL 8 / TiDB Cloud, and JWT authentication**

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

> **📖 Full project documentation is available in the [root README](../README.md).** This README covers backend-specific setup, API reference, and architecture.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Role Permissions](#-role-permissions)
- [Docker](#-docker)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)
- [Production Checklist](#-production-checklist)

---

## 📖 Overview

This is the NestJS backend for the Full-Stack POS system. It provides a RESTful API for:

- **Authentication** — JWT-based login, profile, password reset
- **User Management** — CRUD for admin-managed users
- **Product Catalog** — Products with barcode lookup, stock management, category association
- **Sales Processing** — Transaction-safe sales with stock validation and deduction
- **Reports** — Aggregated business intelligence (daily revenue, top products, payment breakdown)
- **Customer Management** — Customer CRUD, loyalty points, and rewards redemption
- **KHQR Payment** — Real-time ABA KHQR QR code generation for scan-to-pay
- **Quick Picks** — Configurable frequently-bought items for fast checkout
- **Supplier Management** — Complete supplier directory with contact details
- **Purchase Orders** — Full PO lifecycle (Draft → Approved → Received → Cancelled)
- **Stock Movements** — Audit trail for all stock In/Out/Adjustment operations
- **Product Returns** — Admin-managed returns with automatic inventory restocking
- **File Uploads** — MinIO/S3 and Cloudinary storage support
- **Dynamic Navigation** — Management pages with role-based permissions

### Live Demo

| Service | URL |
|---------|-----|
| **Backend API** | [https://full-stack-pos.onrender.com/api/v1](https://full-stack-pos.onrender.com/api/v1) |
| **Swagger Docs** | [https://full-stack-pos.onrender.com/api/docs](https://full-stack-pos.onrender.com/api/docs) |

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Application framework (controllers, services, modules) |
| **TypeORM 0.3** | ORM with MySQL driver |
| **MySQL 8.4 / TiDB Cloud** | Database |
| **Passport + JWT** | Authentication strategy |
| **bcryptjs** | Password hashing |
| **class-validator / class-transformer** | DTO validation and transformation |
| **Helmet** | Security headers |
| **@nestjs/swagger** | OpenAPI documentation |
| **@aws-sdk/client-s3** | S3/MinIO file storage |
| **Cloudinary SDK** | Cloudinary image upload |
| **Sharp** | Image processing/resizing |
| **Jest** | Unit testing |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [MySQL 8.4](https://dev.mysql.com/downloads/mysql/) (or [Docker](https://docs.docker.com/get-docker/) for local MySQL)
- [npm](https://www.npmjs.com/) or compatible package manager

### Development (local)

```bash
# 1. Navigate to the backend directory
cd pos-backend

# 2. Install dependencies
npm install

# 3. Start MySQL (using Docker — optional but recommended)
docker compose up -d mysql

# 4. Create a .env file (see Environment Variables section below)
#    Or copy from .env.example if available

# 5. Start the development server with hot-reload
npm run start:dev

# API serves at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### Docker (full stack)

```bash
# From project root
docker compose up -d

# Or from pos-backend directory:
docker compose up -d

# This starts MySQL + the API server
```

> See the [root README's Docker section](../README.md#-quick-start-docker) for detailed Docker setup with environment variables.

---

## 📁 Project Structure

```
pos-backend/
├── src/
│   ├── auth/                          # Authentication module
│   │   ├── dto/                       # Login, forgot/reset password DTOs
│   │   ├── strategies/                # JWT passport strategy
│   │   ├── auth.service.ts            # Login, password reset logic
│   │   ├── auth.controller.ts         # Auth endpoints
│   │   └── auth.module.ts
│   ├── users/                         # User management (admin only)
│   │   ├── dto/                       # Create/update user DTOs
│   │   ├── entities/                  # User entity
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── products/                      # Product catalog
│   │   ├── dto/                       # Product DTOs
│   │   ├── entities/                  # Product entity
│   │   ├── products.service.ts
│   │   ├── products.controller.ts
│   │   └── products.module.ts
│   ├── categories/                    # Product categories
│   │   ├── dto/                       # Category DTOs
│   │   ├── entities/                  # Category entity
│   │   ├── categories.service.ts
│   │   ├── categories.controller.ts
│   │   └── categories.module.ts
│   ├── sales/                         # POS sales processing
│   │   ├── dto/                       # Create sale DTO
│   │   ├── entities/                  # Sale and SaleItem entities
│   │   ├── sales.service.ts
│   │   ├── sales.controller.ts
│   │   └── sales.module.ts
│   ├── reports/                       # Business intelligence
│   │   ├── dto/                       # Report DTOs
│   │   ├── reports.service.ts
│   │   ├── reports.controller.ts
│   │   └── reports.module.ts
│   ├── management/                    # Dynamic navigation pages
│   │   ├── dto/                       # Management page DTOs
│   │   ├── entities/                  # Management page entity
│   │   ├── management.service.ts
│   │   ├── management.controller.ts
│   │   └── management.module.ts
│   ├── upload/                        # File upload (MinIO/S3)
│   ├── upload-cloudinary/             # Cloudinary image upload
│   ├── upload-dynamic/                # Dynamic storage selection
│   ├── customers/                     # Customer CRUD & loyalty points
│   │   ├── dto/                       # Customer DTOs
│   │   ├── customers.service.ts
│   │   ├── customers.controller.ts
│   │   └── customers.module.ts
│   ├── khqr/                          # ABA KHQR QR payment generation
│   │   ├── dto/                       # KHQR DTOs
│   │   ├── khqr.service.ts
│   │   ├── khqr.controller.ts
│   │   └── khqr.module.ts
│   ├── quick-picks/                   # Frequently bought items shortcuts
│   │   ├── dto/                       # Quick pick DTOs
│   │   ├── quick-picks.service.ts
│   │   ├── quick-picks.controller.ts
│   │   └── quick-picks.module.ts
│   ├── suppliers/                     # Supplier management
│   │   ├── dto/                       # Supplier DTOs
│   │   ├── suppliers.service.ts
│   │   ├── suppliers.controller.ts
│   │   └── suppliers.module.ts
│   ├── purchase-orders/               # Purchase order lifecycle
│   │   ├── dto/                       # PO DTOs
│   │   ├── purchase-orders.service.ts
│   │   ├── purchase-orders.controller.ts
│   │   └── purchase-orders.module.ts
│   ├── stock-movements/               # Stock movement tracking
│   │   ├── dto/                       # Stock movement DTOs
│   │   ├── stock-movements.service.ts
│   │   ├── stock-movements.controller.ts
│   │   └── stock-movements.module.ts
│   ├── returns/                       # Product returns & refunds
│   │   ├── dto/                       # Return DTOs
│   │   ├── returns.service.ts
│   │   ├── returns.controller.ts
│   │   └── returns.module.ts
│   ├── health/                        # Application health check
│   ├── common/                        # Shared infrastructure
│   │   ├── guards/                    # JwtAuthGuard, RolesGuard
│   │   ├── decorators/               # @Roles(), @CurrentUser(), @SkipIntercept()
│   │   ├── filters/                   # HttpExceptionFilter
│   │   ├── interceptors/              # ResponseInterceptor (envelope)
│   │   └── helpers/                   # Pagination helper
│   ├── config/                        # App, DB, TypeORM CLI config
│   └── main.ts                        # Bootstrap: Helmet, CORS, ValidationPipe, Swagger
├── Dockerfile                         # Multi-stage production build
├── docker-compose.yml                 # Local MySQL + API services
├── init.sql                           # Schema + seed data
└── tsconfig.json                      # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `pos-backend/` directory:

```env
# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=8h

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=pos_user
DB_PASSWORD=pos_password
DB_NAME=pos_db
DB_SSL=false

# MinIO / S3 (optional — for file uploads)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=pos-uploads

# Cloudinary (optional — for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API listen port |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `FRONTEND_URL` | `*` | CORS allowed origin |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `4000` | DB port (3306 for local MySQL, 4000 for TiDB Cloud) |
| `DB_USER` | `root` | Database username |
| `DB_PASS` | — | Database password **(checked first)** |
| `DB_PASSWORD` | — | Database password (fallback) |
| `DB_NAME` | `pos_db` | Database name |
| `DB_SSL` | `true` | Enable SSL connection |
| `JWT_SECRET` | — | **Required in production** (32+ random characters) |
| `JWT_EXPIRES_IN` | `8h` | JWT token lifetime |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | Cloudinary API secret |

### Database Password Resolution

The system checks these environment variables in order and uses the first one found:

1. `DB_PASS`
2. `DB_PASSWORD`
3. `DATABASE_PASSWORD`
4. `MYSQL_PASSWORD`
5. `MYSQL_ROOT_PASSWORD`
6. `TIDB_PASSWORD`
7. `MYSQL_PWD` (legacy)

---

## 🔐 Authentication

### Default Credentials (seed data)

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@pos.com` | `admin123` |
| 👤 Cashier | `cashier@pos.com` | `cashier123` |

### How It Works

1. **POST `/auth/login`** — Returns a JWT access token and user profile
2. **Include the token** in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```
3. **Protected routes** use `JwtAuthGuard`; admin-only routes add `RolesGuard` with `@Roles('admin')`

### Response Envelope

All API responses follow a consistent format:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient stock for \"Coffee\". Available: 3, Requested: 10",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/v1/sales"
}
```

---

## 📡 API Reference

**Base URL:** `/api/v1`

### 🔑 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/login` | ❌ | Login and receive JWT |
| GET | `/auth/profile` | ✅ | Get current user profile |
| POST | `/auth/forgot-password` | ❌ | Request password reset email |
| POST | `/auth/reset-password` | ❌ | Reset password with token |

**POST /auth/login**

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

---

### 👥 Users `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | List all users (paginated) |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

**POST /users**

```json
{
  "name": "Jane Smith",
  "email": "jane@pos.com",
  "password": "SecurePass123",
  "role": "cashier"
}
```

---

### 📂 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/categories` | admin | Create category |
| GET | `/categories` | all | List all categories |
| GET | `/categories/:id` | all | Get category by ID |
| PATCH | `/categories/:id` | admin | Update category |
| DELETE | `/categories/:id` | admin | Delete category |

**POST /categories**

```json
{ "name": "Beverages" }
```

---

### 📦 Products

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/products` | admin | Create product |
| GET | `/products` | all | List products (paginated) |
| GET | `/products?includeInactive=true` | admin | Include inactive products |
| GET | `/products/:id` | all | Get product by ID |
| GET | `/products/barcode/:barcode` | all | Find product by barcode |
| PATCH | `/products/:id` | admin | Update product |
| PATCH | `/products/:id/stock` | admin | Adjust stock quantity |
| DELETE | `/products/:id` | admin | Deactivate product (soft delete) |

**POST /products**

```json
{
  "name": "Iced Americano",
  "name_kh": "អាយស្គរអាមេរិកាណូ",
  "barcode": "8851234567890",
  "price": 3.5,
  "stock": 100,
  "categoryId": 1,
  "description": "Refreshing iced coffee"
}
```

**PATCH /products/:id/stock** (positive = add, negative = subtract)

```json
{ "quantity": 50 }
```

---

### 🧾 Sales

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/sales` | all | Create a new sale |
| GET | `/sales` | all | List sales (cashier sees own only) |
| GET | `/sales/:id` | all | Get sale details |

**POST /sales** — Triggers a full transaction: validates stock → deducts inventory → saves sale

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

**Payment methods:** `cash` | `aba` | `card`

**Response:**

```json
{
  "id": 42,
  "subtotal": 10.5,
  "discount": 1.0,
  "tax": 0.5,
  "total": 10.0,
  "paymentMethod": "cash",
  "items": [
    { "productId": 1, "quantity": 2, "price": 3.5 },
    { "productId": 3, "quantity": 1, "price": 3.5 }
  ]
}
```

---

### 📊 Reports `[admin]`

All report endpoints accept optional `from` and `to` query parameters (`YYYY-MM-DD`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Dashboard KPIs + low-stock alerts |
| GET | `/reports/daily-revenue` | Revenue grouped by day |
| GET | `/reports/top-products?limit=5` | Best-selling products |
| GET | `/reports/payment-summary` | Revenue by payment method |
| GET | `/reports/sales-by-cashier` | Performance per cashier |

**GET /reports/summary?from=2026-01-01&to=2026-01-31**

```json
{
  "totalSales": 128,
  "totalRevenue": 1540.5,
  "totalDiscount": 45.0,
  "averageOrderValue": 12.03,
  "lowStockProducts": [
    { "id": 5, "name": "Espresso Beans", "stock": 3, "barcode": "8851234567890" }
  ]
}
```

**GET /reports/daily-revenue**

```json
[
  { "date": "2026-01-31", "totalSales": 24, "revenue": 312.0, "totalDiscount": 5.0, "totalTax": 10.0 },
  { "date": "2026-01-30", "totalSales": 18, "revenue": 228.5, "totalDiscount": 3.0, "totalTax": 7.5 }
]
```

**GET /reports/top-products?limit=5**

```json
[
  {
    "productId": 1,
    "productName": "Iced Americano",
    "barcode": "8851234567890",
    "totalQuantitySold": 240,
    "totalRevenue": 840.0
  }
]
```

**GET /reports/payment-summary**

```json
[
  { "paymentMethod": "cash", "totalTransactions": 80, "totalRevenue": 960.0 },
  { "paymentMethod": "aba",  "totalTransactions": 35, "totalRevenue": 430.5 },
  { "paymentMethod": "card", "totalTransactions": 13, "totalRevenue": 150.0 }
]
```

---

### 📄 Management Pages `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/management-pages` | List dynamic navigation pages |

Used by the admin layout to render dynamic sidebar navigation with role-based visibility.

---

### 🖼️ File Uploads

| Endpoint | Storage | Description |
|----------|---------|-------------|
| `/upload` | MinIO/S3 | General file upload |
| `/upload-cloudinary` | Cloudinary | Cloudinary image upload |
| `/upload-dynamic` | Configurable | Dynamic storage backend selection |

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

---

### 📱 KHQR Payment

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/khqr/generate` | all | Generate ABA KHQR QR code for payment |

---

### ⚡ Quick Picks

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/quick-picks` | admin | Create quick-pick item |
| GET | `/quick-picks` | all | List active items |
| GET | `/quick-picks/:id` | admin | Get item by ID |
| PATCH | `/quick-picks/:id` | admin | Update item |
| DELETE | `/quick-picks/:id` | admin | Delete item |

---

### 📦 Suppliers `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers` | List active suppliers (paginated) |
| GET | `/suppliers/:id` | Get supplier by ID |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Deactivate supplier |

---

### 📋 Purchase Orders `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/purchase-orders` | Create purchase order |
| GET | `/purchase-orders` | List all (paginated) |
| GET | `/purchase-orders/:id` | Get by ID |
| PATCH | `/purchase-orders/:id/receive` | Receive order (updates stock) |
| DELETE | `/purchase-orders/:id` | Cancel order |

---

### 🔄 Returns `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/returns` | Create return/refund (restocks inventory) |
| GET | `/returns` | List all returns (paginated) |
| GET | `/returns/:id` | Get return by ID |

---

### 📊 Stock Movements `[admin]`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-movements` | List all movements (paginated, filterable) |
| GET | `/stock-movements/product/:productId` | Get movements for a specific product |
| GET | `/stock-movements/near-expiry` | Get products near expiry (default: 30 days) |

---

### 📖 Swagger Documentation

Interactive API documentation is available at **`/api/docs`** when the server is running.

**Auto-authorization:** After logging in via Swagger, the JWT token is automatically detected using a DOM MutationObserver and applied to all subsequent requests — no manual token copying needed.

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
total                                       file_size
payment_method                              upload_type
created_at                                  destination_storage
                                            public_id (Cloudinary)
                                            created_at

management_pages     customers             quick_picks
────────────────     ──────────            ───────────
id (PK)             id (PK)               id (PK)
title / title_km    name                  product_id → products.id
icon, type, url     phone (unique)        display_order
permissions, badge   loyalty_points        is_active
sort_order          total_spent           created_at
is_active           total_purchases
parent_id (self-ref)  created_at
created_at / updated_at

suppliers             purchase_orders       purchase_order_items
──────────            ───────────────       ───────────────────
id (PK)              id (PK)               id (PK)
name                 supplier_id → suppliers.id  purchase_order_id
contact_person       reference_number (unique)   product_id → products
email                status (pending/approved/received/cancelled)
phone                order_date            unit_cost
address              expected_delivery     total
is_active            subtotal
created_at           tax
                     total
                     notes
                     created_at

stock_movements       returns
───────────────       ───────
id (PK)              id (PK)
product_id → products  sale_id → sales.id
quantity_change      user_id → users.id
type (in/out/adjust) reason
reference_type       status (pending/approved/rejected)
reference_id         refund_amount
notes                created_at
created_at
```

---

## 🛡 Role Permissions Matrix

| Module | Admin | Cashier |
|--------|:-----:|:-------:|
| Auth (login) | ✅ | ✅ |
| Profile | ✅ | ✅ |
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
| Reports | ✅ | ❌ |
| Management Pages | ✅ | ❌ |
| Suppliers & POs | ✅ | ❌ |
| Stock Movements | ✅ | ❌ |
| Product Returns | ✅ | ❌ |

---

## 🐳 Docker

### Services

The `docker-compose.yml` defines two services:

| Service | Container | Description |
|---------|-----------|-------------|
| 🗄️ `mysql` | `pos_mysql_local` | MySQL 8.4 with auto-seeding (`init.sql`) |
| ⚙️ `api` | `pos_api` | NestJS API (multi-stage Dockerfile) |

### Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up -d --build

# Restart API only
docker compose restart api

# Run database migrations
docker compose exec api npm run migration:run

# Access MySQL shell
docker compose exec mysql mysql -u pos_user -p pos_db

# View logs
docker compose logs -f api
docker compose logs -f mysql

# Stop services (keeps DB volume)
docker compose down

# Stop and wipe database (⚠️ destroys all data)
docker compose down -v
```

### Multi-stage Dockerfile

The `Dockerfile` uses a multi-stage build:

1. **`builder`** — Installs all dependencies and compiles TypeScript
2. **`production`** — Minimal image with only production dependencies and compiled output, runs as a non-root `appuser`

---

## 🚢 Deployment

### Render (recommended)

```bash
# 1. Push your code to GitHub

# 2. In the Render dashboard:
#    → New Web Service
#    → Connect your repository
#    → Runtime: Docker
#    → Root Directory: pos-backend

# 3. Set required environment variables:
#    DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT=4000
#    DB_SSL=true, JWT_SECRET, NODE_ENV=production
#    FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🛠 Useful Commands

```bash
# Development
npm run start:dev            # Dev mode with hot-reload
npm run start:debug          # Debug mode with watch

# Building
npm run build                # Production build (output: dist/)
npm run start:prod           # Run production build

# Database Migrations
npm run migration:generate -- src/migrations/MigrationName  # Generate migration from entities
npm run migration:run        # Apply pending migrations
npm run migration:revert     # Revert last migration

# Code Quality
npm run lint                 # ESLint with auto-fix
npm run format               # Prettier formatting

# Testing
npm run test                 # Run unit tests (Jest)

# TypeORM CLI (direct)
npm run typeorm -- migration:run -d src/config/typeorm.config.ts
```

---

## 🏗 Production Checklist

- [ ] Generate a strong `JWT_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production` (disables TypeORM schema sync)
- [ ] Run `npm run migration:run` to apply database migrations
- [ ] Change the default admin password immediately
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Enable SSL for database connection (`DB_SSL=true`)
- [ ] Set up automated database backups
- [ ] Configure Cloudinary credentials for image uploads
- [ ] Add rate limiting for auth endpoints (login, forgot-password)
- [ ] Monitor with Render's built-in metrics

---

<div align="center">
Built with ❤️ using NestJS, TypeORM, and MySQL / TiDB Cloud
</div>
