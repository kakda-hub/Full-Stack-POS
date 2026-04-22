# PosSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


# KhmerPOS — Angular Point of Sale System

A fully production-ready Angular POS system with Khmer/English support.

## Quick Start

```bash
unzip pos-system.zip
cd pos-system-final
npm install
ng serve
```

Open **http://localhost:4200**

## Demo Login Credentials

| Role    | Username | Password |
|---------|----------|----------|
| Admin   | admin    | 1234     |
| Cashier | cashier  | 1234     |

## Features

### Cashier View (/sales)
- Product grid with category filter tabs
- Barcode scanner support (type barcode + Enter)
- Cart with quantity controls and per-item discounts
- Total discount % and tax % controls
- Cash / ABA / Card payment modal
- Change calculation with quick-cash buttons
- 80mm thermal printer-optimized receipt
- Real-time reactive state via Angular Signals

### Admin View (/products, /reports, /users)
- Full product CRUD with barcode, category, stock management
- Low-stock alerts and indicators
- Daily revenue KPI cards
- Payment breakdown with progress bars
- Full transaction history
- User management with role permissions table

### Architecture
```
src/app/
├── core/
│   ├── services/       auth, cart, product, transaction, language
│   ├── guards/         authGuard, adminGuard
│   └── models/         User, Product, CartItem, Transaction
├── shared/
│   ├── components/     ui-button, modal
│   └── animations/     fadeIn, slideIn, modal, list, cart, counter, page
├── features/
│   ├── sales/          SalesComponent, PaymentModal, ReceiptModal
│   ├── products/       ProductsComponent, ProductFormModal
│   ├── reports/        ReportsComponent
│   └── users/          UsersComponent, LoginComponent
└── layout/
    ├── cashier-layout/ Fixed cart sidebar + product grid
    └── admin-layout/   Dark sidebar + main content
```

### Tech Stack
- **Angular 21** with NgModules + lazy loading
- **Angular Signals** for reactive cart state
- **Angular Animations** (180-200ms, OnPush throughout)
- **Tailwind CSS v3** for all styling
- **@ngx-translate/core** for Khmer 🇰🇭 / English 🇬🇧
- **Hanuman** font for Khmer, **Inter** for English

### Language Support
- Real-time switching (no reload)
- Persisted to localStorage
- Translation files: `src/assets/i18n/en.json` + `km.json`
- `html[lang="km"]` switches to Hanuman font automatically

### Role-Based Access
- **Admin**: products, reports, users, sales
- **Cashier**: sales only
- Route guards enforce permissions
- Auth stored in localStorage with mock token structure

## Build for Production

```bash
ng build --configuration=production
# Output: dist/pos-system/browser/
```
