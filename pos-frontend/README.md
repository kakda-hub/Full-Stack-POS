<div align="center">

# 🎨 POS Frontend — Angular 21 Application

**A production-ready Point of Sale frontend built with Angular, Tailwind CSS, and bilingual Khmer/English support**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Angular Material](https://img.shields.io/badge/Material-21-757575?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io/)
[![Render](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

> **📖 Full project documentation is available in the [root README](../README.md).** This README covers frontend-specific setup and architecture.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Features by Role](#-features-by-role)
- [Routing & Navigation](#-routing--navigation)
- [Language Support](#-language-support)
- [Environment Configuration](#-environment-configuration)
- [Docker](#-docker)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)

---

## 📖 Overview

This is the Angular frontend for the Full-Stack POS system. It provides two distinct interfaces:

- **Cashier View** — A streamlined POS sales interface with product grid, barcode scanning, cart management, multi-payment modal (Cash/ABA/Card), and thermal printer-optimized receipts.
- **Admin View** — A full management dashboard with KPI metrics, product/category management, users & roles, permissions, sales history, reports, suppliers, purchase orders, stock movements, quick picks, file uploads, and dynamic navigation pages.

The app features real-time Khmer/English language switching, role-based route protection, Angular Signals for reactive state, and responsive design for desktop and tablet use.

### Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://pos-frontend.vercel.app](https://pos-frontend.vercel.app) |

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@pos.com` | `admin123` |
| 👤 Cashier | `cashier@pos.com` | `cashier123` |

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Frontend framework with NgModules + lazy loading |
| **Angular Material** | UI components (dialogs, tables, inputs) |
| **Tailwind CSS 3** | Utility-first styling |
| **@ngx-translate** | Internationalization (Khmer/English) |
| **Angular Signals** | Reactive state management (cart, UI state) |
| **Angular Animations** | Smooth transitions (180-200ms, `OnPush` strategy) |
| **Vitest** | Unit testing |
| **Prettier** | Code formatting |

### Fonts

- **Khmer** (`html[lang="km"]`) — [Hanuman](https://fonts.google.com/specimen/Hanuman)
- **English** — [Inter](https://fonts.google.com/specimen/Inter)

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Angular CLI](https://angular.dev/tools/cli) v21+ (`npm install -g @angular/cli`)
- Backend API running at `http://localhost:3000` (see [root README](../README.md))

### Development

```bash
# 1. Navigate to the frontend directory
cd pos-frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the development server
npm start

# The app serves at http://localhost:4200
# API requests to /api are proxied to http://localhost:3000 via proxy.conf.js
```

> **Note:** `--legacy-peer-deps` is required due to peer dependency conflicts between Angular 21 and some @ngx-translate packages.

### Proxy Configuration

The development server proxies `/api` requests to the backend using `proxy.conf.js`:

```js
const PROXY_TARGET = process.env.PROXY_TARGET || 'http://localhost:3000';
```

Override the target with:

```bash
PROXY_TARGET=http://your-backend:3000 npm start
```

---

## 📁 Project Structure

```
pos-frontend/
├── src/
│   ├── app/
│   │   ├── features/                    # Lazy-loaded feature modules
│   │   │   ├── login/                   # Authentication screen
│   │   │   ├── sales/                   # POS cart, payment, receipt
│   │   │   ├── products/                # Product CRUD + stock management
│   │   │   ├── categories/              # Category management
│   │   │   ├── reports/                 # Dashboard KPIs + charts
│   │   │   ├── sales-history/           # Transaction history
│   │   │   ├── users/                   # User management
│   │   │   ├── user-management/         # Role/permission configuration
│   │   │   ├── user-role/               # User role assignments
│   │   │   ├── permissions/             # Permission management
│   │   │   ├── dashboard/                # Admin interactive dashboard with KPIs
│   │   │   ├── management-page/         # Dynamic navigation page management
│   │   │   ├── cloudinary-file-upload/  # Cloudinary media manager (sign-in, upload, list)
│   │   │   ├── suppliers/                # Supplier management
│   │   │   ├── purchase-orders/          # Purchase order management
│   │   │   ├── stock-movements/          # Stock movement tracking
│   │   │   ├── quick-picks/              # Quick-pick product shortcuts
│   │   │   └── page-not-found/          # 404 page
│   │   ├── layout/                      # Layout components
│   │   │   ├── admin-layout/            # Dark sidebar + main content
│   │   │   └── cashier-layout/          # Fixed cart sidebar + product grid
│   │   ├── services/                    # HTTP services, auth, data
│   │   │   ├── shared/                  # Abstract REST base service
│   │   │   └── dialogs/                 # Reusable dialog services
│   │   ├── shared/                      # Shared components, pipes, animations
│   │   │   ├── animations/              # Reusable Angular animations
│   │   │   ├── pipes/                   # Date format, safe HTML pipes
│   │   │   └── reusable-component/      # Reusable UI component module
│   │   ├── enums/                       # API endpoint constants
│   │   ├── app-routing.module.ts        # Route definitions
│   │   ├── app.module.ts                # Root module
│   │   └── app.html / app.scss          # Root component
│   ├── assets/
│   │   ├── i18n/                        # Translation files
│   │   │   ├── en.json                  # English translations
│   │   │   └── km.json                  # Khmer translations 🇰🇭
│   │   └── styles/                      # Shared style utilities
│   ├── environments/
│   │   ├── environment.ts               # Dev environment (apiUrl: '')
│   │   └── environment.prod.ts          # Prod environment (apiUrl: Render URL)
│   ├── main.ts                          # App bootstrap
│   ├── index.html                       # HTML entry point
│   └── styles.scss                      # Global styles
├── Dockerfile                           # Multi-stage build (dev → build → nginx)
├── nginx.conf                           # Production nginx configuration
├── vercel.json                          # Vercel deployment configuration
├── proxy.conf.js                        # Dev server API proxy
├── tailwind.config.js                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

---

## 🎨 Features by Role

### Cashier (`/sales`)

| Feature | Description |
|---------|-------------|
| 🏷️ **Product Grid** | Category-filtered product cards with price display |
| 📷 **Barcode Scanner** | Type barcode + Enter for instant product lookup |
| 🛒 **Shopping Cart** | Quantity controls, per-item adjustments, line totals |
| 💰 **Discount & Tax** | Global discount % and tax % controls |
| 💳 **Multi-Payment Modal** | Cash (with change calculation), ABA scan-to-pay QR, Card |
| 👤 **Customer Lookup** | Find customer by phone, view loyalty points & history |
| 💰 **Points Redemption** | Redeem loyalty points for instant discounts at checkout |
| 🧾 **Receipt** | 80mm thermal printer-optimized receipt format |
| ⚡ **Real-Time State** | Reactive cart via Angular Signals |
| ⚡ **Quick Picks** | Frequently bought items for faster checkout workflows |

### Admin (`/dashboard`, `/products`, `/reports`, `/users`, etc.)

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Interactive admin dashboard with KPI metrics, near-expiry alerts, top sellers |
| 📦 **Products** | Full CRUD with barcode, category, stock, image management |
| 📂 **Categories** | Product category CRUD |
| 📊 **Reports** | Revenue KPIs, daily trends, top products, payment breakdown |
| 📜 **Sales History** | Transaction history with search and filters |
| 👥 **Users** | User management with role assignments |
| 🔐 **User Roles & Permissions** | Role configuration and permission management |
| 📄 **Management Pages** | Dynamic navigation page management |
| ☁️ **Cloudinary Media Manager** | Sign-in gated media manager — upload, search, sort, paginate & preview Cloudinary assets |
| 🌐 **Language Manager** | Khmer/English translation interface |
| 📦 **Suppliers** | Supplier directory with contact and address details |
| 📋 **Purchase Orders** | Full PO lifecycle management (Draft → Received) |
| 📊 **Stock Movements** | Inventory audit trail and near-expiry detection |
| ⚡ **Quick Picks** | Configure frequently bought items for fast checkout |

### Shared

- 🌐 **Khmer/English** language switching — real-time, no reload, persisted to localStorage
- 🎨 **Responsive design** — Works on desktop and tablet
- 🔐 **Role-based routing** — Guards protect admin routes (redirect to 404)
- 📄 **Pagination** — All list views support paginated data
- 🎞 **Animations** — Smooth transitions (fade, slide, list, modal, counter, page)

---

## 🧭 Routing & Navigation

| Path | Module | Access | Description |
|------|--------|:------:|-------------|
| `/login` | LoginModule | Public | Authentication page |
| `/sales` | SalesModule | All | POS cashier interface (default) |
| `/products` | ProductsModule | Admin | Product management |
| `/categories` | CategoriesModule | Admin | Category management |
| `/reports` | ReportsModule | Admin | Business intelligence |
| `/sales-history` | SalesHistoryModule | Admin | Transaction history |
| `/users` | UsersModule | Admin | User management |
| `/user-management` | UserManagementModule | Admin | User management config |
| `/user-role` | UserRoleModule | Admin | Role assignments |
| `/permission` | PermissionsModule | Admin | Permission configuration |
| `/management-page` | ManagementPageModule | Admin | Dynamic navigation pages |
| `/dashboard` | DashboardModule | Admin | Admin interactive dashboard (NEW!) |
| `/cloudinary-file-upload` | CloudinaryFileUploadModule | Admin | Cloudinary media manager (redirects to sign-in) |
| `/cloudinary-file-upload/sign-in` | CloudinaryFileUploadModule | Admin | Sign-in gate for the media manager |
| `/cloudinary-file-upload/list` | CloudinaryFileUploadModule | Admin | Upload & manage media assets (signed-in) |
| `/suppliers` | SuppliersModule | Admin | Supplier management |
| `/purchase-orders` | PurchaseOrdersModule | Admin | Purchase order management |
| `/stock-movements` | StockMovementsModule | Admin | Stock movement tracking |
| `/quick-picks` | QuickPicksModule | Admin | Quick-pick product shortcuts |
| `/**` | PageNotFoundModule | All | 404 page |

---

## 🌐 Language Support

- **Real-time switching** via `@ngx-translate/core` — no page reload needed
- **Persisted** to `localStorage`
- **Translation files**: `src/assets/i18n/en.json` and `km.json`
- **Auto font switching**: `html[lang="km"]` triggers Hanuman Khmer font

---

## ⚙️ Environment Configuration

### `src/environments/environment.ts` (development)

```ts
export const environment = {
  production: false,
  apiUrl: '',        // Empty = same origin (proxied via proxy.conf.js)
};
```

### `src/environments/environment.prod.ts` (production)

```ts
export const environment = {
  production: true,
  apiUrl: 'https://pos-backend.onrender.com',  // ← Update to your Render URL
};
```

> **Important:** Update `apiUrl` in `environment.prod.ts` to point to your deployed backend before building for production.

---

## 🐳 Docker

### Development (with hot reload)

```bash
# From project root
docker compose up -d frontend

# Or from pos-frontend directory:
docker build --target development -t pos-frontend .
docker run -p 4200:4200 pos-frontend
```

### Production (nginx)

```bash
docker build --target build -t pos-frontend-build .
# Uses multi-stage build: install → build → nginx serve
```

The production Docker image:
1. Installs dependencies and builds the Angular app
2. Copies the output to an nginx-alpine image
3. Configures nginx to serve static files and proxy `/api` to the backend

---

## 🚢 Deployment

### Vercel (recommended)

The project includes a `vercel.json` configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/pos-system/browser",
  "framework": null
}
```

**Option 1:** Connect your GitHub repo via the Vercel dashboard:
- Root Directory: `pos-frontend`
- Build Command: `npm run build`
- Output Directory: `dist/pos-system/browser`

**Option 2:** CLI:

```bash
vercel --prod
```

> **Note:** Update `environment.prod.ts` with your backend URL before deploying.

---

## 🛠 Useful Commands

```bash
# Development
npm start                   # Start dev server at http://localhost:4200
npm run start -- --port 4300  # Start on a different port

# Build
npm run build               # Production build
npm run build -- --configuration=development  # Dev build

# Testing
npm test                    # Run unit tests (Vitest)

# Code quality
npx prettier --check src/   # Check formatting
npx prettier --write src/   # Format code
npx ng build --stats-json   # Build with bundle analysis

# Generate code (Angular CLI)
npx ng generate component features/my-feature/my-component
npx ng generate service features/my-feature/my-service
npx ng generate module features/my-feature/my-module
```

---

<div align="center">
Built with ❤️ using Angular, Tailwind CSS, and @ngx-translate
</div>
