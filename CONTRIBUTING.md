<div align="center">

# 🤝 Contributing to Full-Stack POS

**Thank you for considering contributing to this project!**

This document provides guidelines and standards for contributing to the Full-Stack POS system. Following these conventions helps maintain consistency and quality across the codebase.

</div>

---

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Style & Conventions](#-code-style--conventions)
- [Git & Commit Guidelines](#-git--commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Testing](#-testing)
- [Project Architecture](#-project-architecture)
- [Database Migrations](#-database-migrations)
- [Docker Development](#-docker-development)
- [Environment Variables](#-environment-variables)
- [Reporting Issues](#-reporting-issues)
- [License](#-license)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (recommended for local MySQL)
- [Angular CLI](https://angular.dev/tools/cli) v21+ (optional: `npm install -g @angular/cli`)
- [Git](https://git-scm.com/)

### One-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/full-stack-pos.git
cd full-stack-pos

# 2. Install frontend dependencies
cd pos-frontend
npm install --legacy-peer-deps
cd ..

# 3. Install backend dependencies
cd pos-backend
npm install
cd ..

# 4. Create backend environment file
cp pos-backend/.env.example pos-backend/.env
# Edit pos-backend/.env with your configuration
```

### Start Development

**Option A: Docker (full stack — recommended)**

```bash
docker compose up -d
```

**Option B: Separate terminals**

```bash
# Terminal 1 — Backend
cd pos-backend
docker compose up -d mysql   # Start MySQL only
npm run start:dev             # Start NestJS with hot-reload

# Terminal 2 — Frontend
cd pos-frontend
npm start                     # ng serve at http://localhost:4200
```

---

## 💻 Development Workflow

### Step-by-Step

1. **Pick an issue** — Comment on the issue to let others know you're working on it
2. **Create a branch** — `git checkout -b type/short-description` (see [branch naming](#branch-naming))
3. **Make changes** — Follow the [code style](#code-style--conventions) guidelines
4. **Test your changes** — Run relevant tests and verify manually
5. **Commit** — Follow [commit message guidelines](#commit-messages)
6. **Push** — `git push origin your-branch-name`
7. **Open a PR** — Against the `main` branch

### Branch Naming

Use a consistent naming pattern:

```
type/description

Examples:
feat/add-discount-per-item
fix/negative-stock-validation
refactor/sales-service-extraction
docs/update-api-reference
chore/upgrade-angular-deps
test/add-sales-unit-tests
```

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. (no production code change) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |

---

## 🎨 Code Style & Conventions

### General

- **Language**: TypeScript (strict mode enabled)
- **Formatting**: [Prettier](https://prettier.io/) with the project config (100 char print width, single quotes)
- **Editor**: Use `.editorconfig` settings (automatically picked up by most editors)

### TypeScript

```typescript
// ✅ Good — explicit types, descriptive names
interface CreateProductDto {
  readonly name: string;
  readonly price: number;
  readonly categoryId: number;
}

async function createProduct(dto: CreateProductDto): Promise<Product> {
  const product = this.productRepository.create(dto);
  return this.productRepository.save(product);
}

// ❌ Avoid — 'any' types, unclear naming
async function createProduct(dto: any): Promise<any> {
  // ...
}
```

#### Rules

- **No `any` types** — Use proper types, interfaces, or generics instead
- **Use `readonly`** on DTO/interface properties where applicable
- **Prefer `interface` over `type`** for object shapes
- **Async/await** over raw promises or callbacks
- **Named exports** over default exports

### NestJS Backend Conventions

- **Controllers**: Handle HTTP concerns only — delegate logic to services
- **Services**: Contain business logic — inject repositories and other services
- **Modules**: Each feature gets its own module with controller, service, entity, and DTOs
- **DTOs**: Use `class-validator` decorators for validation
- **Endpoints**: RESTful naming — plural nouns, nested resources where appropriate
- **Guards**: Use `JwtAuthGuard` for authenticated routes and `RolesGuard` with `@Roles()` for authorization

```typescript
// ✅ Good — controller delegates to service
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async create(@Body() dto: CreateProductDto) {
  return this.productsService.create(dto);
}
```

### Angular Frontend Conventions

- **Modules**: Each feature is a lazy-loaded NgModule
- **Components**: OnPush change detection, standalone components preferred
- **Signals**: Use Angular Signals for reactive state (cart, UI state)
- **Services**: One service per feature, extending `AbstractRestService` where applicable
- **Templates**: Use the `async` pipe or Signals; avoid manual subscriptions in components
- **Styling**: Use Tailwind CSS utility classes; SCSS for component-specific styles
- **i18n**: All user-facing strings go through `@ngx-translate` — add keys to both `en.json` and `km.json`

```typescript
// ✅ Good — Signal-based state
private readonly _cart = signal<CartItem[]>([]);
readonly cart = this._cart.asReadonly();

addItem(product: Product, quantity: number) {
  this._cart.update(items => [...items, { product, quantity }]);
}
```

### Angular Template Conventions

```html
<!-- ✅ Good — use async pipe or Signals -->
<div class="text-lg font-semibold">
  {{ 'PRODUCTS.TOTAL' | translate }}: {{ total() | number:'1.2-2' }}
</div>

<!-- ❌ Avoid — manual subscriptions -->
<div>{{ total }}</div>  <!-- where total was set via .subscribe() -->
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Module | `feature.module.ts` | `products.module.ts` |
| Controller | `feature.controller.ts` | `products.controller.ts` |
| Service | `feature.service.ts` | `products.service.ts` |
| Entity | `entity.entity.ts` | `product.entity.ts` |
| DTO | `dto-name.dto.ts` | `create-product.dto.ts` |
| Component | `component-name.component.ts` | `product-list.component.ts` |
| Guard | `guard-name.guard.ts` | `jwt-auth.guard.ts` |
| Decorator | `decorator-name.decorator.ts` | `current-user.decorator.ts` |

---

## 📝 Git & Commit Guidelines

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): short description

Optional longer description with context and rationale.

BREAKING CHANGE: description of breaking change
```

#### Examples

```
feat(products): add bulk stock adjustment endpoint

Allow admin users to adjust stock for multiple products in a single
request. Validates quantities before applying any changes.

Closes #42
```

```
fix(sales): prevent negative stock after concurrent requests

Add optimistic locking to the sales transaction to prevent two
cashiers from selling the same item below zero stock.
```

```
refactor(backend): extract pagination logic into reusable helper
```

```
docs: update API reference with new report endpoints
```

#### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring |
| `docs` | Documentation |
| `style` | Formatting |
| `test` | Tests |
| `chore` | Tooling, CI, dependencies |
| `perf` | Performance improvement |

### Before Committing

- [ ] Run `npm run lint` (both frontend and backend)
- [ ] Check for leftover `console.log`, `debugger`, or TODO comments
- [ ] Ensure all new public APIs are documented
- [ ] Verify translations are added for both `en.json` and `km.json`

---

## 🔄 Pull Request Process

### Opening a PR

1. **Title**: Follow the commit message format: `type(scope): description`
2. **Description**:
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?
   - Screenshots for UI changes
   - Closes issue numbers (e.g., `Closes #14`)
3. **Labels**: Add appropriate labels (`bug`, `enhancement`, `documentation`, etc.)
4. **Reviewers**: Request review from maintainers

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed — no obvious issues
- [ ] Tests added/updated for changes where applicable
- [ ] All tests pass (`npm test` in both directories)
- [ ] Linting passes (`npm run lint` in both directories)
- [ ] Documentation updated (README, API docs, comments)
- [ ] i18n strings added to both `en.json` and `km.json` (frontend changes)
- [ ] No new `any` types introduced
- [ ] Commit history is clean — squash if needed

### Review Process

1. At least one maintainer review required
2. Address all review comments
3. If changes are requested, push new commits (don't squash until approved)
4. Once approved, a maintainer will merge

### Merge Strategy

- **Squash merge** — For feature branches with multiple small commits
- **Rebase merge** — When a clean linear history is preferred

---

## 🧪 Testing

### Backend (Jest)

```bash
cd pos-backend

# Run all tests
npm test

# Run specific test file
npx jest --testPathPattern="sales"

# Watch mode
npx jest --watch

# Coverage report
npx jest --coverage
```

#### Test Guidelines

- Write unit tests for services (business logic)
- Write e2e tests for controllers (HTTP endpoints)
- Mock database repositories using TypeORM's testing utilities
- Test both success and error paths
- Test role-based access (admin vs cashier)

```typescript
// Example service test
describe('SalesService', () => {
  it('should reject sale when stock is insufficient', async () => {
    // Arrange
    jest.spyOn(productRepo, 'findOneBy').mockResolvedValue({
      id: 1,
      name: 'Coffee',
      stock: 3,
    });

    // Act & Assert
    await expect(
      service.create(mockSaleDtoWithQuantity(10), mockUser),
    ).rejects.toThrow('Insufficient stock');
  });
});
```

### Frontend (Vitest)

```bash
cd pos-frontend

# Run all tests
npm test
```

#### Test Guidelines

- Test components in isolation using Angular `TestBed`
- Test services with HTTP testing controllers
- Focus on component behavior, not DOM structure
- Use `OnPush` change detection in test setups

---

## 🗺 Project Architecture

### Repository Structure

```
Full-Stack-POS/
├── pos-backend/              # NestJS REST API
│   ├── src/
│   │   ├── auth/             # JWT authentication
│   │   ├── users/            # User management
│   │   ├── products/         # Product catalog
│   │   ├── categories/       # Product categories
│   │   ├── sales/            # POS sales processing
│   │   ├── reports/          # Business intelligence
│   │   ├── management/       # Dynamic navigation pages
│   │   ├── upload*/          # File upload services
│   │   ├── common/           # Shared guards, decorators, helpers
│   │   └── config/           # App configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── pos-frontend/             # Angular 21 SPA
│   ├── src/app/
│   │   ├── features/         # Lazy-loaded feature modules
│   │   ├── layout/           # Admin & Cashier layouts
│   │   ├── services/         # HTTP services
│   │   └── shared/           # Shared components, pipes, animations
│   ├── Dockerfile
│   └── vercel.json
├── docker-compose.yml        # Root orchestration
└── README.md
```

### Key Architecture Decisions

- **Monorepo without workspace tools** — Simple directory structure keeps things straightforward; no Nx or Lerna
- **Modular NestJS** — Each business domain is a self-contained module with its own routes, services, and entities
- **Lazy-loaded Angular modules** — Each admin feature is independently loaded for optimal bundle size
- **Angular Signals** — Used for reactive state (cart, UI interactions) instead of external state management
- **TypeORM with migrations** — Schema changes are managed through generated migration files
- **Bilingual support** — All UI text is externalized via `@ngx-translate`; both English and Khmer translations are required

---

## 🗄 Database Migrations

### When to Create a Migration

Whenever you change an entity file (add/remove columns, change types, add relations):

```bash
cd pos-backend

# 1. Make your entity changes in the .entity.ts file

# 2. Generate the migration
npm run migration:generate -- src/migrations/YourMigrationName

# 3. Review the generated SQL in the migration file

# 4. Apply the migration
npm run migration:run

# 5. If something goes wrong, revert
npm run migration:revert
```

> **Note:** In development with `synchronize: true`, migrations are optional. Always use migrations for production deployments.

### Migration Best Practices

- Give migrations descriptive names (`AddDiscountColumnToSales` not `Migration123`)
- Review generated SQL before committing
- Never edit existing migration files after they've been applied to production
- Test migrations against a copy of the production database

---

## 🐳 Docker Development

### Available Docker Commands

```bash
# From project root

# Start everything
docker compose up -d

# Rebuild a specific service
docker compose build --no-cache backend

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Run a command inside a container
docker compose exec backend npm run migration:run

# Access MySQL
docker compose exec mysql mysql -u pos_user -p pos_db

# Reset everything (⚠️ destroys data)
docker compose down -v && docker compose up -d
```

### Docker Tips

- Changes to `src/` in `pos-backend/` require a rebuild (`docker compose build backend`) if not using the dev target
- The root `docker-compose.yml` mounts volumes for hot-reload in development mode
- Frontend Docker dev mode uses `ng serve --host 0.0.0.0 --poll 2000` for file watching

---

## ⚙️ Environment Variables

### Backend

| Variable | Required | Notes |
|----------|:--------:|-------|
| `JWT_SECRET` | ✅ | Generate a strong random string (32+ chars) |
| `DB_HOST` | ✅ | TiDB Cloud host or `localhost` |
| `DB_USER` | ✅ | Database username |
| `DB_PASS` or `DB_PASSWORD` | ✅ | Database password |
| `DB_NAME` | ✅ | `pos_db` |
| `DB_PORT` | ✅ | `4000` (TiDB Cloud) or `3306` (local) |
| `FRONTEND_URL` | Production | CORS origin |

> See the [root README](README.md#-environment-variables) for the full variable reference and password resolution chain.

### Frontend

| Variable | Required | Notes |
|----------|:--------:|-------|
| `apiUrl` (in `environment.prod.ts`) | Production | Set to your deployed backend URL |
| `PROXY_TARGET` (env var) | Development | Override backend proxy target |

---

## 🐛 Reporting Issues

### Before Filing

1. Search existing [issues](https://github.com/your-org/full-stack-pos/issues) to avoid duplicates
2. Check if the issue has been fixed in the latest version
3. For security vulnerabilities, email the maintainers directly

### Bug Reports

When filing a bug report, include:

- **Description**: Clear, concise description of the bug
- **Steps to reproduce**: Minimal, complete steps to reproduce
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: OS, Node version, browser, Docker version
- **Logs**: Relevant error messages or console output

### Feature Requests

Describe:

- **Use case**: What problem are you trying to solve?
- **Proposed solution**: How should it work?
- **Alternatives**: What other approaches have you considered?
- **Context**: Any additional context or mockups

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

---

<div align="center">

**Questions?** Open a [discussion](https://github.com/your-org/full-stack-pos/discussions) or reach out to the maintainers.

**Happy coding!** 🚀

</div>
