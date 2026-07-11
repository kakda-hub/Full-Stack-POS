# 🏪 Full-Stack POS System — User Guide

> **A production-ready Point of Sale (POS) system** built with NestJS (backend), Angular (frontend), MySQL/TiDB (database), and Docker. Features bilingual Khmer/English support, role-based access (Admin & Cashier), real-time inventory tracking, business intelligence reports, thermal-printer receipts, and barcode scanning.

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
   - [Accessing the Application](#accessing-the-application)
   - [Login Credentials](#login-credentials)
3. [Interface Overview](#interface-overview)
   - [Cashier Layout](#cashier-layout)
   - [Admin Layout](#admin-layout)
   - [Language Switching](#language-switching)
   - [Dark/Light Theme](#darklight-theme)
4. [Cashier Guide — Selling at the POS](#cashier-guide--selling-at-the-pos)
   - [Product Grid & Browsing](#product-grid--browsing)
   - [Searching & Barcode Scanning](#searching--barcode-scanning)
   - [Adding Items to Cart](#adding-items-to-cart)
   - [Managing the Cart](#managing-the-cart)
   - [Discounts & Tax](#discounts--tax)
   - [Checkout & Payment](#checkout--payment)
   - [Printing Receipts](#printing-receipts)
   - [Low Stock Alerts](#low-stock-alerts)
5. [Admin Guide — Managing the Store](#admin-guide--managing-the-store)
   - [Products Management](#products-management)
   - [Categories Management](#categories-management)
   - [Sales History](#sales-history)
   - [Reports & Analytics](#reports--analytics)
   - [User Management](#user-management)
   - [User Roles & Permissions](#user-roles--permissions)
   - [Management Pages](#management-pages)
   - [File Uploads (Cloudinary)](#file-uploads-cloudinary)
6. [Technical Reference](#technical-reference)
   - [Tech Stack](#tech-stack)
   - [System Architecture](#system-architecture)
   - [API Overview](#api-overview)
   - [Database Schema](#database-schema)
   - [Role-Based Permissions Matrix](#role-based-permissions-matrix)
   - [Deployment Architecture](#deployment-architecture)
7. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## System Overview

The Full-Stack POS System is a modern point-of-sale solution designed for retail businesses, restaurants, and small-to-medium enterprises. It supports the complete sales workflow from product browsing to payment processing and receipt printing.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Point of Sale** | Fast, intuitive cashier interface with product grid, cart management, and multi-payment support |
| **Inventory Management** | Real-time stock tracking with low-stock alerts and barcode lookups |
| **Multi-Payment** | Cash (with change calculation), ABA scan-to-pay QR, and credit/debit card |
| **Bilingual UI** | Full English and Khmer (ភាសាខ្មែរ) language support, switchable in real-time |
| **Analytics & Reports** | Dashboard with revenue KPIs, daily revenue charts, top products, payment breakdowns, and cashier performance |
| **Role-Based Access** | Distinct Admin and Cashier roles with granular permissions |
| **Receipt Printing** | 80mm thermal-printer-optimized receipts with itemized details |
| **Image Management** | Cloudinary-powered image uploads for products, categories, and user avatars |

### Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://pos-frontend.vercel.app](https://pos-frontend.vercel.app) |
| **Backend API** | [https://full-stack-pos.onrender.com/api/v1](https://full-stack-pos.onrender.com/api/v1) |
| **API Documentation** | [https://full-stack-pos.onrender.com/api/docs](https://full-stack-pos.onrender.com/api/docs) |

---

## Getting Started

### Accessing the Application

**Option 1 — Production (Live Demo)**
- Open your browser and navigate to: **https://pos-frontend.vercel.app**
- No installation required.

**Option 2 — Local Development (Docker)**
```bash
# From the project root
docker compose up -d

# Services:
# Frontend:  http://localhost:4200
# Backend:   http://localhost:3000
# MySQL:     Port 3306
# MinIO:     http://localhost:9090 (Console)
```

**Option 3 — Local Development (Manual)**
```bash
# Terminal 1 — Backend
cd pos-backend
npm install
npm run start:dev

# Terminal 2 — Frontend
cd pos-frontend
npm install --legacy-peer-deps
npm start
# Opens at http://localhost:4200
```

### Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| 👑 **Admin** | `admin@pos.com` | `admin123` | Full system access |
| 👤 **Cashier** | `cashier@pos.com` | `cashier123` | Sales-only access |

> **Tip:** On the login screen, click **"Demo Admin"** or **"Demo Cashier"** buttons to auto-fill credentials for quick access.

---

## Interface Overview

### Cashier Layout

The Cashier interface is a streamlined, high-efficiency layout designed for fast checkout operations.

```
┌──────────────────────────────────────────────────────────────┐
│  KhmerPOS [cart count]    🌙  🇰🇭/🇬🇧  [User]  [Logout]     │
├──────────────────────────────────┬───────────────────────────┤
│                                  │  ← Your Cart              │
│  🔍 Search or scan barcode...    │  ─────────────────────    │
│  [Beverages] [Food] [Snacks]     │  Item Name        [×]     │
│                                  │  [-]  2  [+]    $10.00   │
│  ┌─────┐ ┌─────┐ ┌─────┐        │  Item Name        [×]     │
│  │ 🥤  │ │ 🍱  │ │ 🍿  │       │  [-]  1  [+]    $5.00    │
│  │ Coke │ │ Rice│ │Chips│       │                           │
│  │$1.50 │ │$3.00│ │$2.00│       │  Subtotal          $15.00 │
│  │12 in │ │5 in │ │0 in │       │  TOTAL             $15.00 │
│  │stock │ │stock│ │sold │       │                           │
│  └─────┘ └─────┘ └─────┘        │  [   Checkout Now   ✅ ]  │
│                                  │                           │
└──────────────────────────────────┴───────────────────────────┘
```

**Key Elements:**
- **Top Navigation Bar** — Brand logo, cart badge with item count, theme toggle, language switch, user profile, logout
- **Left Panel (Product Grid)** — Search bar, category filter tabs, product cards with images, prices, and stock levels
- **Right Panel (Cart Sidebar)** — Toggleable cart view; shows cart items with quantity controls, totals, and checkout button

**Navigation:**
- **Desktop:** Sidebar is always visible; use cart toggle button to show/hide
- **Mobile:** Cart collapses to a slide-over panel; tap the cart icon in the search bar to open
- **Keyboard Shortcut:** Press `Ctrl + B` to toggle the cart sidebar

### Admin Layout

The Admin interface provides a comprehensive dashboard-style layout with a collapsible sidebar navigation.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  │  Main Content Area               │
│  │ ← SystemPOS         │  │                                  │
│  │   Smart Solutions   │  │  (Router outlet — feature pages) │
│  │                     │  │                                  │
│  │  Menu Overview      │  │                                  │
│  │                     │  │                                  │
│  │  🛒 Sales           │  │                                  │
│  │  📦 Products        │  │                                  │
│  │  📊 Reports         │  │                                  │
│  │  👥 Users           │  │                                  │
│  │  📁 Categories      │  │                                  │
│  │  🔐 Permissions     │  │                                  │
│  │  📜 Sales History   │  │                                  │
│  │  ⚙️ Settings ▾      │  │                                  │
│  │     • User Mgmt     │  │                                  │
│  │     • User Roles    │  │                                  │
│  │     • Management    │  │                                  │
│  │     • File Uploads  │  │                                  │
│  │                     │  │                                  │
│  │  🌙 Dark Mode       │  │                                  │
│  │  🇰🇭 ភាសាខ្មែរ     │  │                                  │
│  │  [👤 Admin] [🚪]    │  │                                  │
│  └─────────────────────┘  │                                  │
└──────────────────────────────────────────────────────────────┘
```

**Navigation Items (Admin):**

| Icon | Menu Item | Route | Description |
|------|-----------|-------|-------------|
| 🛒 | Sales | `/sales` | POS checkout (same as cashier view) |
| 📦 | Products | `/products` | Product catalog CRUD |
| 📊 | Reports | `/reports` | Business analytics dashboard |
| 👥 | Users | `/users` | User account management |
| 📁 | Categories | `/categories` | Product category management |
| 🔐 | Permissions | `/permission` | Role permission configuration |
| 📜 | Sales History | `/sales-history` | Full transaction history |
| ⚙️ | **Settings** | *(submenu)* | |
| | User Management | `/user-management` | Additional user configuration |
| | User Roles | `/user-role` | Role assignment & management |
| | Management | `/management-page` | Dynamic navigation page builder |
| | File Uploads | `/cloudinary-file-upload` | Cloudinary image management |

> **Note:** The sidebar can be collapsed to icon-only mode by clicking the arrow button at the top edge. On mobile devices, a bottom navigation bar appears with the most essential menu items.

### Language Switching

The system supports **English** and **Khmer (ភាសាខ្មែរ)** languages.

**How to switch:**
- **Login Screen:** Click the floating toggle button in the top-right corner (shows 🇰🇭/🇬🇧)
- **Cashier Layout:** Click the language button in the top navigation bar
- **Admin Layout:** Click the language toggle in the sidebar footer

Language preference is persisted and applied in real-time without page reload. All UI text, labels, and product names (when Khmer names are provided) update instantly.

### Dark/Light Theme

Toggle between **Dark Mode** and **Light Mode**:
- **Cashier Layout:** Click the moon/sun icon in the top bar
- **Admin Layout:** Click the "Dark" / "Light" button in the sidebar footer

Theme preferences apply immediately across all screens.

---

## Cashier Guide — Selling at the POS

### Product Grid & Browsing

The main POS screen displays products in a responsive grid layout.

**Browsing Products:**
1. Products are displayed as cards showing image, name, price, and stock count
2. **Category Filter Tabs** appear below the search bar — click a category to filter products (e.g., Beverages, Food, Snacks, Dairy)
3. The selected category is highlighted in indigo
4. Stock indicators:
   - **Green** — Adequate stock (>5 available)
   - **Amber badge** — Low stock (1-5 remaining, shows exact count)
   - **Red "Out" badge** — Out of stock (product is disabled but visible)
   - Greyed-out image + "Out of stock" label for unavailable items

### Searching & Barcode Scanning

**Text Search:**
- Type in the search field to filter products by name in real-time
- Search supports both English and Khmer names
- Results update as you type (debounced for performance)

**Barcode Scanning:**
1. Click the search input to focus it
2. Scan a product barcode using a connected barcode scanner (or type the barcode manually)
3. Press **Enter** — the product is immediately added to cart
4. The search field clears and resets automatically

> 💡 **Pro Tip:** Barcode scanners typically send the barcode number followed by Enter. Simply scan and the item is added automatically!

### Adding Items to Cart

**To add a product:**
- Click on any product card — it is instantly added to the cart
- If the cart was closed, it auto-opens when an item is added
- Visual feedback: a "+1" fly animation appears on the product card, and the stock count flashes momentarily

**From the product grid, you can see effective stock** (stock minus what's already in the cart). If a product runs out of available stock, clicking it triggers a shake animation, and an "Out of stock" error toast appears.

### Managing the Cart

The cart sidebar provides full control over selected items:

**Quantity Controls:**
- **+** button — Increase quantity (capped at available stock)
- **- button** — Decrease quantity (removes item at 0)
- **Remove (×)** — Remove item entirely from cart

**Cart Features:**
- **Clear All** — Empties the entire cart (with confirmation prompt)
- **Empty State** — Friendly icon and message when cart is empty
- **Animated Totals** — Subtotal and total amounts animate smoothly when they change
- **Item Count Badge** — Shows total item count in the top navigation bar

### Discounts & Tax

The system supports applying discounts and tax to sales. These are configured via the checkout flow:

- **Discount** — Enter a discount amount (flat $ value) to apply to the sale
- **Tax** — Enter a tax amount to apply

Both discount and tax values are reflected in the cart totals and printed on receipts.

### Checkout & Payment

When the cart is ready, click **"Checkout Now"** to open the payment modal.

#### Step 1: Choose Payment Method

The payment modal presents three options:

| Method | Icon | Description |
|--------|------|-------------|
| **Cash** 💵 | Handles cash payments with automatic change calculation |
| **ABA** 📱 | ABA Bank scan-to-pay QR code (displays QR for customer to scan) |
| **Card** 💳 | Credit/debit card processing (tap/swipe/dip) |

#### Step 2: Complete Payment

**For Cash Payments:**
1. Select the **Cash** method (default)
2. Enter the amount received from the customer
3. Use **Quick Amount** buttons for common denominations ($5, $10, $20, $50)
4. The **Change** amount is automatically calculated and displayed in green
5. If the amount is insufficient, a red warning appears
6. Click **"Confirm Payment"** to complete the sale

> ⚠️ The Confirm button is disabled until the cash amount is sufficient (≥ total).

**For ABA Payments:**
1. Select the **ABA** method
2. An ABA QR code display appears for the customer to scan
3. Click **"Confirm Payment"** to complete

**For Card Payments:**
1. Select the **Card** method
2. A card processing interface appears
3. Click **"Confirm Payment"** to complete

#### What Happens After Payment:

1. ✅ **Success toast** notification appears
2. 📄 **Receipt modal** opens automatically with the full transaction summary
3. 📉 **Stock is reduced** in real-time for each purchased item
4. 🗑️ **Cart is cleared** ready for the next customer
5. 🔄 **Product grid refreshes** to show updated stock levels

### Printing Receipts

The receipt is optimized for **80mm thermal printers** and includes:

```
┌─────────────────────────┐
│    KhmerPOS Store       │
│   Phnom Penh, Cambodia  │
│   Tel: +855 23 000 000  │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Receipt:    #42         │
│ Date:     15/06/2026    │
│           14:30         │
│ Cashier:  Admin         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Coke            $3.00   │
│  2 × $1.50              │
│ Rice            $3.00   │
│  1 × $3.00              │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Subtotal       $6.00    │
│ TOTAL          $6.00    │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Payment:      CASH      │
│ Received:     $10.00    │
│ Change:        $4.00    │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Thank you!              │
│ Please come again.      │
│ Powered by KhmerPOS     │
└─────────────────────────┘
```

**Receipt Actions:**
- **Print** — Opens the browser print dialog (choose your thermal printer)
- **New Sale** — Closes the receipt and returns to a fresh POS screen

### Low Stock Alerts

When products run low on stock, an amber warning banner appears at the top of the product grid:

- Shows how many products are low on stock
- Lists the product names
- Admin users see a **"Manage"** link to quickly navigate to Products page
- Low-stock products get special amber "N left" badges on their product cards

---

## Admin Guide — Managing the Store

### Products Management

**Route:** `/products`

The Products page provides full CRUD (Create, Read, Update, Delete) management of the product catalog.

#### Product List View

- **Table layout** with columns: No., Image, Name, Barcode, Category, Price, Stock, Actions
- **Khmer names** displayed below English names where available
- **Stock color coding:**
  - 🟢 Green = Adequate stock
  - 🟡 Amber = Low stock (below threshold)
  - 🔴 Red = Out of stock
- **Search bar** — Filter products by name
- **Category filter buttons** — Filter by product category
- **Pagination** — Navigate through product pages
- **Low stock alert banner** — Prominent warning when products are running low

#### Adding / Editing a Product

Click **"Add New"** or the **edit (pencil) icon** on any product row to open the product dialog.

**Form Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| **Image** | No | Click to upload product photo via Cloudinary |
| **Name** | ✅ Yes | Product name in English |
| **Name (Khmer)** | No | Product name in Khmer (displays when language is Khmer) |
| **Price** | ✅ Yes | Selling price in USD |
| **Stock** | ✅ Yes | Current inventory quantity |
| **Barcode** | ✅ Yes | Unique product barcode (duplicate check enforced) |
| **Category** | ✅ Yes | Product category selection |
| **Description** | No | Optional product description |

**Image Upload:**
- Click the image placeholder (dashed border box)
- Select an image file from your computer
- The image uploads to Cloudinary automatically
- A spinner shows during upload
- The uploaded image preview appears once complete
- Hover over the image to see "Change Image" option

**Saving:**
- Click **"Save"** to create or update the product
- Validation errors appear inline (e.g., missing required fields, duplicate barcode)

#### Deleting a Product

1. Click the **trash icon** on any product row
2. A confirmation dialog appears: *"Delete [product name]?"*
3. Click **"Delete"** to confirm or **"Cancel"** to abort
4. On successful deletion, a success toast notification appears

> Note: Deleting a product soft-deactivates it rather than removing it from transaction history.

### Categories Management

**Route:** `/categories`

Manage product categories to organize your catalog.

**Features:**
- **List view** with columns: Name, Name (Khmer), Description
- **Search** — Filter categories by name
- **Add New** — Open dialog to create a new category
- **Edit** — Click pencil icon to modify an existing category
- **Delete** — Click trash icon (with confirmation dialog)
- **Category Image** — Upload a representative image for each category

**Category Form Fields:**
- **Name** (required) — English category name
- **Name (Khmer)** — Khmer category name
- **Image** — Optional category image upload
- **Description** — Optional description

### Sales History

**Route:** `/sales-history`

View and analyze all completed transactions.

**KPI Cards at Top:**
| Metric | Description |
|--------|-------------|
| 📋 Total Transactions | Count of sales in the current view |
| 💰 Total Revenue | Sum of all sales totals |
| 👥 Cashiers | Number of unique cashiers |
| 📊 Avg Order Value | Average transaction amount |

**Filters & Search:**

| Filter | Description |
|--------|-------------|
| **Search** | Search by cashier name or sale ID |
| **Quick Filters** | All Time, Today, This Week, This Month |
| **Date Range** | Custom date range with From/To date pickers |

**Sales Table Columns:**
- # (Sale ID)
- Date & Time
- Cashier Name
- Items (product list preview)
- Payment Method (with color-coded badge)
- Total (amount)

**Interaction:**
- **Click any row** to open the **Sale Detail Modal** showing:
  - Full itemized list with quantities and line totals
  - Payment method and cashier info
  - Subtotal, Discount, Tax, and Grand Total
  - **Print Receipt** button to re-print any past receipt
  - **Close** button

**Pagination:** Navigate through pages (15 records per page).

### Reports & Analytics

**Route:** `/reports`

The Reports dashboard provides comprehensive business intelligence for data-driven decision making.

#### Date Range Filter

- **Preset buttons:** Today, This Week, This Month
- **Custom mode:** Select specific From/To dates
- All charts and KPIs update based on the selected date range

#### KPI Cards

| KPI | Description |
|-----|-------------|
| 💵 **Total Revenue** | Sum of all sales in the period |
| ✅ **Transactions** | Total number of sales |
| 📦 **Total Products** | Count of all active products |
| ⚠️ **Low Stock** | Number of products below threshold |

#### Daily Revenue Chart (Bar Chart)

- Visual bar chart showing revenue per day
- Hover over any bar to see exact revenue and transaction count
- Scales automatically based on data range
- Color-coded bars with smooth animations

#### Top Products (Best Sellers)

- Ranked list (1st, 2nd, 3rd, etc.) of best-selling products
- Each entry shows:
  - Rank badge (🥇 gold, 🥈 silver, 🥉 bronze)
  - Product name
  - Quantity sold
  - Revenue generated
  - Progress bar relative to the top seller

#### Payment Breakdown

- Visual breakdown by payment method (Cash, ABA, Card)
- Each method shows:
  - Icon and method name
  - Transaction count
  - Revenue bar (color-coded: green/indigo/violet)
  - Total amount

#### Sales by Cashier

- Performance breakdown per cashier
- Each cashier shows:
  - Initial avatar
  - Transaction count
  - Revenue progress bar
  - Total revenue generated

#### Transaction History Table

- Complete list of all transactions in the selected period
- Columns: ID, Time, Cashier, Payment, Items, Total
- Color-coded payment method badges
- Sorted by most recent first

### User Management

**Route:** `/users`

Manage user accounts for the POS system.

**User Cards View:**
- Each user displayed as a card with:
  - **Avatar** (with gradient initials fallback if no image)
  - **Name** and **Username**
  - **Role** badge (Admin in indigo, Cashier in green)
  - **Status** indicator (green dot = active, grey = inactive)
  - **Last Login** timestamp
  - **Edit** and **Delete** buttons

**Stats Cards:**
- **Total Users** — Count of all users
- **Admins** — Count of admin role users
- **Cashiers** — Count of cashier role users

**Adding / Editing a User:**

Form Fields:
| Field | Required | Description |
|-------|----------|-------------|
| **Avatar** | No | Click avatar circle to upload profile photo (Cloudinary) |
| **Name** | ✅ Yes | Full name |
| **Email** | No | Email address (used as username for login) |
| **Password** | ✅ (new) / No (edit) | Login password (min 6 characters) |
| **Role** | ✅ Yes | Admin or Cashier |

**Deleting a User:**
- Confirmation dialog before deletion
- Success/error toast notifications

### User Roles & Permissions

**Route:** `/user-role`

View and manage user role assignments in a clean, organized interface.

**Two Sections:**
1. **Administrators** — Users with admin role, shown with violet accent
2. **Cashiers** — Users with cashier role, shown with green accent

**Each User Card Displays:**
- Avatar (image or gradient initials)
- Name and email
- Online status indicator (green dot for active)
- Role selector dropdown
- Active/Inactive status badge

**Changing a Role:**
1. Find the user in the appropriate section
2. Click the role dropdown selector
3. Choose "Admin" or "Cashier"
4. The role updates immediately with a loading spinner
5. The user moves to the corresponding section automatically

**Stats Cards:**
- Total Users count
- Admin count (with shield icon)
- Cashier count (with shopping bag icon)

### Management Pages

**Route:** `/management-page`

Build and customize the dynamic navigation structure. This feature allows admins to create a hierarchical menu system.

**Tree View Interface:**
- Visual tree structure showing parent-child relationships
- Expand/collapse nodes
- Drag-and-drop (or button-based) reordering

**Node Types:**
- **Menu** — A parent container (folder icon) that can hold sub-items
- **Link** — A single page link (document icon) that routes to a URL

**Actions per Node:**
| Action | Description |
|--------|-------------|
| **➕ Add Sub-item** | Create a child node under the selected parent |
| **✏️ Edit Details** | Modify the node's title, URL, icon, type |
| **🗑️ Delete** | Remove the node (with confirmation) |

**Form Fields (Edit/Create):**
| Field | Description |
|-------|-------------|
| **Name** * | Page title |
| **Name (Khmer)** | Khmer page title |
| **Type** * | Menu (parent) or Link (page) |
| **Icon Name** | Material icon identifier |
| **URL** | Route path for the page |
| **Permissions** | Role access level required |
| **Badge** | Optional notification badge |
| **Sort Order** | Position in navigation |

> Fields marked with * are required.

### File Uploads (Cloudinary)

**Route:** `/cloudinary-file-upload`

Manage uploaded images and files stored on Cloudinary.

**Features:**
- View all uploaded files in a grid/list
- See file details: name, URL, type, upload date, file size
- Upload new files
- Delete existing files
- Copy file URLs for use in products, categories, or user avatars

---

## Technical Reference

### Tech Stack

#### Backend (`pos-backend/`)

| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Progressive Node.js application framework |
| **TypeORM 0.3** | ORM with MySQL driver for database operations |
| **MySQL 8.4 / TiDB Cloud** | Database (compatible with both) |
| **Passport + JWT** | Authentication with JSON Web Tokens |
| **bcryptjs** | Password hashing and security |
| **class-validator / class-transformer** | DTO validation and transformation |
| **Helmet** | HTTP security headers |
| **Swagger (OpenAPI)** | Auto-generated API documentation |
| **Cloudinary SDK** | Cloud-based image upload and management |
| **Sharp** | Image processing and optimization |
| **@aws-sdk/client-s3** | S3-compatible storage (MinIO fallback) |

#### Frontend (`pos-frontend/`)

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Modern frontend framework with standalone components |
| **Angular Material** | UI component library (dialogs, selects, menus) |
| **Tailwind CSS 3** | Utility-first CSS framework for styling |
| **@ngx-translate** | Internationalization (i18n) for Khmer/English |
| **Angular Signals** | Reactive state management and change detection |
| **Angular Animations** | Smooth page transitions and micro-interactions |

#### Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker & Docker Compose** | Containerized development environment |
| **Render** | Backend API hosting (production) |
| **Vercel** | Frontend hosting (production) |
| **TiDB Cloud** | Managed MySQL-compatible database |
| **Cloudinary** | Image storage and CDN |

### System Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│  Database    │
│  (Angular)   │ HTTP │  (NestJS)    │  SQL │  (MySQL/     │
│              │◀─────│              │◀─────│   TiDB)      │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Cloudinary  │
                      │  (Images)    │
                      └──────────────┘
```

**Request Flow:**
1. User interacts with the Angular frontend
2. HTTP requests are sent to the NestJS API (`/api/v1/...`)
3. All API requests require JWT authentication (except login)
4. Backend validates permissions using guards and decorators
5. Data is persisted to MySQL / TiDB via TypeORM
6. Images are uploaded directly to Cloudinary from the frontend
7. Responses follow a consistent envelope format

**API Response Envelope:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-06-15T14:30:00.000Z"
}
```

### API Overview

**Base URL:** `/api/v1`

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/login` | ❌ | Login with email/password → returns JWT + user |
| GET | `/auth/profile` | ✅ | Get current authenticated user's profile |
| POST | `/auth/forgot-password` | ❌ | Request a password reset link via email |
| POST | `/auth/reset-password` | ❌ | Reset password using a valid reset token |

#### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details by ID |
| PATCH | `/users/:id` | Update user information |
| DELETE | `/users/:id` | Delete a user |

#### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/categories` | admin | Create a new category |
| GET | `/categories` | all | List all categories |
| GET | `/categories/:id` | all | Get category by ID |
| PATCH | `/categories/:id` | admin | Update category |
| DELETE | `/categories/:id` | admin | Delete category |

#### Products

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/products` | admin | Create a new product |
| GET | `/products` | all | List products (paginated, filterable) |
| GET | `/products/:id` | all | Get product by ID |
| GET | `/products/barcode/:barcode` | all | Lookup product by barcode |
| PATCH | `/products/:id` | admin | Update product |
| PATCH | `/products/:id/stock` | admin | Adjust product stock quantity |
| DELETE | `/products/:id` | admin | Deactivate product (soft delete) |

#### Sales

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/sales` | all | Create a new sale (validates & deducts stock) |
| GET | `/sales` | all | List sales (cashier sees own only) |
| GET | `/sales/:id` | all | Get sale details with line items |

**Sale POST body:**
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

**Payment methods:** `cash` | `aba` | `card`

#### Reports (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Dashboard KPIs + low-stock alerts |
| GET | `/reports/daily-revenue` | Revenue grouped by day |
| GET | `/reports/top-products?limit=5` | Best-selling products |
| GET | `/reports/payment-summary` | Revenue by payment method |
| GET | `/reports/sales-by-cashier` | Performance metrics per cashier |

All report endpoints accept optional `from` and `to` query parameters (`YYYY-MM-DD` format) for date range filtering.

#### Management Pages

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/management-pages` | admin | List all dynamic navigation pages |
| POST | `/management-pages` | admin | Create a new navigation page |
| PATCH | `/management-pages/:id` | admin | Update a navigation page |
| DELETE | `/management-pages/:id` | admin | Delete a navigation page |

#### File Uploads

| Endpoint | Storage | Description |
|----------|---------|-------------|
| `/upload` | MinIO/S3 | General file upload to S3-compatible storage |
| `/upload-cloudinary` | Cloudinary | Image upload to Cloudinary |
| `/upload-dynamic` | Configurable | Upload with dynamic storage selection |

---

### Database Schema

```
users                     categories                  products
────────                  ──────────                  ────────
id (PK, auto-increment)   id (PK)                     id (PK)
name                      name                        name
email (unique)            name_kh                     name_kh
password (bcrypt hashed)  description                 img_url
role (enum: admin/cashier) img_url                    barcode (unique)
is_active (boolean)       is_active                   price
avatar_url                created_at                  stock
reset_token                                          category_id → categories.id
reset_token_expiry                                   description
created_at                                           is_active (boolean)
                                                     low_stock_threshold
                                                     created_at

sales                      sale_items                 management_pages
─────                      ──────────                 ────────────────
id (PK)                    id (PK)                    id (PK)
user_id → users.id         sale_id → sales.id         title
subtotal                   product_id → products.id   title_km
discount                   quantity                   icon
tax                        price (snapshot)           type (menu/link)
total                      discount (per-item)        url
payment_method (cash/aba/card)                        permissions (JSON)
created_at                                           badge
                                                     sort_order
file_uploads                                         is_active
────────────                                         parent_id (self-ref)
id (PK)                                              created_at / updated_at
original_file_name
file_name / file_url
file_extension
file_size
upload_type
destination_storage
public_id (Cloudinary)
created_at
```

### Role-Based Permissions Matrix

| Module / Feature | 👑 Admin | 👤 Cashier |
|-----------------|:--------:|:----------:|
| 🔑 Login | ✅ | ✅ |
| 👤 View Profile | ✅ | ✅ |
| 🛒 Create Sales | ✅ | ✅ |
| 📋 View Own Sales | ✅ | ✅ |
| 📋 View All Sales | ✅ | ❌ |
| 📦 View Products | ✅ | ✅ |
| ✏️ Create/Edit Products | ✅ | ❌ |
| 📁 View Categories | ✅ | ✅ |
| ✏️ Create/Edit Categories | ✅ | ❌ |
| 👥 Manage Users (CRUD) | ✅ | ❌ |
| 🔐 Manage Roles & Permissions | ✅ | ❌ |
| 📊 View Reports & Analytics | ✅ | ❌ |
| 🗂️ Manage Navigation Pages | ✅ | ❌ |
| 🖼️ File Upload Management | ✅ | ❌ |
| ⚙️ System Settings | ✅ | ❌ |

### Deployment Architecture

```
Production Environment:
┌────────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                         │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Angular SPA deployed to Vercel edge network           ││
│  │  URL: https://pos-frontend.vercel.app                  ││
│  │  Requests proxy to Render backend                      ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Render (Backend)                                           │
│  ┌────────────────────────────────────────────────────────┐│
│  │  NestJS API server (Docker container)                  ││
│  │  URL: https://full-stack-pos.onrender.com              ││
│  │  API Base: /api/v1                                     ││
│  │  Swagger: /api/docs                                    ││
│  │  CORS configured for Vercel frontend domain            ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  TiDB Cloud (Database)                                      │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Managed MySQL-compatible database                     ││
│  │  SSL-enabled connection                                ││
│  │  Port: 4000 (TiDB Cloud) / 3306 (local)                ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Cloudinary (Media Storage)                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Image hosting with CDN                                ││
│  │  Used for product images, category images, avatars     ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

**How to Deploy:**

**Backend (Render):**
```bash
# 1. Push code to GitHub
# 2. In Render dashboard: New Web Service → Select repo
# 3. Runtime: Docker
# 4. Root Directory: pos-backend
# 5. Set environment variables (DB, JWT, Cloudinary, etc.)
```

**Frontend (Vercel):**
```bash
# Option 1: Connect GitHub repo via Vercel dashboard
#   → Root Directory: pos-frontend
#   → Build Command: npm run build
#   → Output Dir: dist/pos-system/browser
# Option 2: Vercel CLI
#   vercel --prod
```

---

## Troubleshooting & FAQ

### Common Issues

| Issue | Solution |
|-------|----------|
| **Cannot log in** | Ensure Caps Lock is off. Use the Demo buttons to auto-fill credentials. Check that the backend server is running. |
| **Barcode scanner not working** | Ensure the scanner is connected and configured to send Enter after scan. Click the search box before scanning. |
| **Cart items disappear** | Cart is stored in memory and clears on page refresh. Complete checkout or use the "Clear" button intentionally. |
| **Products not showing** | Check if products exist in the database. Verify category filter is not hiding them. Check search query. |
| **Receipt not printing** | The Print button opens the browser's print dialog. Select your thermal printer (e.g., 80mm) and ensure it's connected. |
| **Language not switching** | Language preference is stored locally. Try refreshing the page if labels don't update. |
| **Image upload fails** | Check Cloudinary credentials in environment variables. Verify file size is within limits. Check network connectivity. |
| **Dashboard shows no data** | Select a broader date range. Ensure sales have been created for the selected period. |

### FAQ

**Q: Can I change the logo and store name?**
A: Yes. The store name appears on receipts and can be customized in the code. The logo can be replaced by updating the image URL in the layout components.

**Q: How do I add a new payment method?**
A: Payment methods are defined in the frontend and backend. New methods require code changes to both the payment modal component and the sales API enum validation.

**Q: Can I export reports to Excel/PDF?**
A: Currently, reports are view-only within the dashboard. Export functionality can be added as a future enhancement.

**Q: Is the system available offline?**
A: No, the system requires an active internet connection to communicate with the backend API and database. Offline support is not currently implemented.

**Q: Can multiple cashiers use the system simultaneously?**
A: Yes. Each cashier logs in with their own credentials and sees their own transactions. The backend handles concurrent requests. Stock levels update in real-time across all active sessions.

**Q: How do I reset an admin password?**
A: Use the "Forgot Password?" link on the login screen to request a password reset email. Alternatively, another admin can reset the password from the User Management section.

**Q: What happens to sales when a product is deleted?**
A: Products are soft-deactivated (not permanently removed). Existing sale records retain their product information via price snapshots in the sale_items table, so historical data remains accurate.

**Q: Can I customize receipt layout?**
A: The receipt template is defined in the frontend code. Developers can modify the HTML/CSS to add logos, change layout, or include additional information like VAT registration numbers.

---

<div align="center">

**Built with ❤️ using NestJS, Angular, and TiDB Cloud**

*Document version 1.0 — Last updated: July 2026*

</div>
