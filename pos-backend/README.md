# 🏪 POS System — NestJS Backend

Production-ready Point of Sale REST API built with NestJS, TypeORM, MySQL 8, and JWT auth.

---

## 🚀 Quick Start

### Development (local)

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env with your DB credentials and JWT secret

# 3. Start MySQL (or use Docker below)

# 4. Run in dev mode (auto-sync schema)
npm run start:dev
```

### Docker (recommended for production)

```bash
# Start everything (MySQL + API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API listen port |
| `NODE_ENV` | `development` | `development` or `production` |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `pos_user` | MySQL username |
| `DB_PASS` | `pos_password` | MySQL password |
| `DB_NAME` | `pos_db` | Database name |
| `JWT_SECRET` | — | **Required in production** |
| `JWT_EXPIRES_IN` | `8h` | Token lifetime |

---

## 🔐 Authentication

All endpoints (except `POST /auth/login`) require a Bearer token.

```
Authorization: Bearer <token>
```

### Default Admin Credentials (Docker seed)
```
Email:    admin@pos.com
Password: password   ← change immediately in production
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient stock for \"Coffee\". Available: 3, Requested: 10",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/v1/sales"
}
```

---

### 🔑 Auth

<!-- http://localhost:3000/api/v1/auth/profile -->

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login and receive JWT |
| GET | `/auth/profile` | ✅ | Get current user profile |

**POST /auth/login**
```json
{
  "email": "admin@pos.com",
  "password": "Admin@123"
}
```
Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": 1, "name": "System Admin", "email": "admin@pos.com", "role": "admin" }
}
```

---

### 👥 Users  `[admin only]`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Create user |
| GET | `/users` | List all users |
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
|---|---|---|---|
| POST | `/categories` | admin | Create category |
| GET | `/categories` | all | List categories |
| GET | `/categories/:id` | all | Get category |
| PATCH | `/categories/:id` | admin | Update category |
| DELETE | `/categories/:id` | admin | Delete category |

**POST /categories**
```json
{ "name": "Beverages" }
```

---

### 📦 Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/products` | admin | Create product |
| GET | `/products` | all | List products |
| GET | `/products?includeInactive=true` | admin | Include inactive |
| GET | `/products/:id` | all | Get product |
| GET | `/products/barcode/:barcode` | all | Find by barcode |
| PATCH | `/products/:id` | admin | Update product |
| PATCH | `/products/:id/stock` | admin | Adjust stock |
| DELETE | `/products/:id` | admin | Deactivate product |

**POST /products**
```json
{
  "name": "Iced Americano",
  "barcode": "8851234567890",
  "price": 3.50,
  "stock": 100,
  "categoryId": 1
}
```

**PATCH /products/:id/stock** (adjust stock, positive = add, negative = subtract)
```json
{ "quantity": 50 }
```

---

### 🧾 Sales

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sales` | all | Create new sale |
| GET | `/sales` | all | List sales (cashier: own only) |
| GET | `/sales/:id` | all | Get sale detail |

**POST /sales** — triggers full transaction: validates stock → deducts → saves
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "discount": 1.00,
  "tax": 0.50,
  "paymentMethod": "cash"
}
```

`paymentMethod` values: `cash` | `aba` | `card`

Response includes computed totals:
```json
{
  "id": 42,
  "subtotal": 10.50,
  "discount": 1.00,
  "tax": 0.50,
  "total": 10.00,
  "paymentMethod": "cash",
  "items": [
    { "productId": 1, "quantity": 2, "price": 3.50 },
    { "productId": 3, "quantity": 1, "price": 3.50 }
  ]
}
```

If stock is insufficient:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient stock for \"Iced Americano\". Available: 3, Requested: 10"
}
```

---

### 📊 Reports  `[admin only]`

All report endpoints accept optional `from` and `to` query params (`YYYY-MM-DD`).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/summary` | Dashboard overview + low stock alert |
| GET | `/reports/daily-revenue` | Revenue grouped by day |
| GET | `/reports/top-products?limit=5` | Best-selling products |
| GET | `/reports/payment-summary` | Revenue by payment method |
| GET | `/reports/sales-by-cashier` | Performance per cashier |

**GET /reports/summary?from=2025-01-01&to=2025-01-31**
```json
{
  "totalSales": 128,
  "totalRevenue": 1540.50,
  "totalDiscount": 45.00,
  "averageOrderValue": 12.03,
  "lowStockProducts": [
    { "id": 5, "name": "Espresso Beans", "stock": 3, "barcode": "..." }
  ]
}
```

**GET /reports/daily-revenue**
```json
[
  { "date": "2025-01-31", "totalSales": 24, "revenue": 312.00, "totalDiscount": 5.00, "totalTax": 10.00 },
  { "date": "2025-01-30", "totalSales": 18, "revenue": 228.50, "totalDiscount": 3.00, "totalTax": 7.50 }
]
```

**GET /reports/top-products?limit=5**
```json
[
  { "productId": 1, "productName": "Iced Americano", "barcode": "...", "totalQuantitySold": 240, "totalRevenue": 840.00 }
]
```

**GET /reports/payment-summary**
```json
[
  { "paymentMethod": "cash", "totalTransactions": 80, "totalRevenue": 960.00 },
  { "paymentMethod": "aba",  "totalTransactions": 35, "totalRevenue": 430.50 },
  { "paymentMethod": "card", "totalTransactions": 13, "totalRevenue": 150.00 }
]
```

---

## 🗄 Database Schema

```
users           categories      products
────────        ──────────      ────────
id (PK)         id (PK)         id (PK)
name            name            name
email                           barcode (unique)
password                        price
role                            stock
is_active                       category_id → categories.id
created_at                      is_active
                                created_at

sales                           sale_items
─────                           ──────────
id (PK)                         id (PK)
user_id → users.id              sale_id → sales.id
subtotal                        product_id → products.id
discount                        quantity
tax                             price  ← snapshot at sale time
total
payment_method
created_at
```

---

## 🛡 Role Permissions Matrix

| Module | Admin | Cashier |
|---|---|---|
| Auth login | ✅ | ✅ |
| Users CRUD | ✅ | ❌ |
| Categories (read) | ✅ | ✅ |
| Categories (write) | ✅ | ❌ |
| Products (read) | ✅ | ✅ |
| Products (write) | ✅ | ❌ |
| Sales (create) | ✅ | ✅ |
| Sales (read own) | ✅ | ✅ |
| Sales (read all) | ✅ | ❌ |
| Reports | ✅ | ❌ |

---

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d --build

# Restart API only
docker-compose restart api

# Run DB migrations (production)
docker-compose exec api npm run migration:run

# Access MySQL shell
docker-compose exec mysql mysql -u pos_user -p pos_db

# View container logs
docker-compose logs -f api
docker-compose logs -f mysql

# Teardown (keeps DB volume)
docker-compose down

# Teardown + wipe database
docker-compose down -v
```

---

## 🏗 Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string (32+ chars)
- [ ] Set `NODE_ENV=production` (disables schema auto-sync)
- [ ] Run `npm run migration:generate` and `npm run migration:run`
- [ ] Change default admin password
- [ ] Configure `FRONTEND_URL` in docker-compose for CORS
- [ ] Set MySQL root password in docker-compose.yml
- [ ] Enable SSL for MySQL connection in production
- [ ] Set up automated DB backups

---

## 📁 Project Structure

```
src/
├── auth/               JWT login, profile
│   ├── dto/
│   ├── strategies/     jwt.strategy.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
├── users/              User management (admin only)
├── products/           Product catalog + barcode lookup
├── categories/         Product categories
├── sales/              Transaction-safe POS sales
├── reports/            Aggregated business intelligence
├── common/
│   ├── decorators/     @Roles(), @CurrentUser()
│   ├── guards/         JwtAuthGuard, RolesGuard
│   ├── filters/        HttpExceptionFilter
│   └── interceptors/   ResponseInterceptor (envelope)
├── config/             DB config, app config, TypeORM CLI config
└── main.ts             Bootstrap: Helmet, CORS, ValidationPipe
```
