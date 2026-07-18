# NestJS Step-by-Step Tutorial: Building a POS System Backend

> **Learn NestJS by exploring a real-world Point-of-Sale (POS) system backend**

## Table of Contents

1. [Introduction to NestJS](#1-introduction-to-nestjs)
2. [Project Overview](#2-project-overview)
3. [Prerequisites](#3-prerequisites)
4. [Project Structure](#4-project-structure)
5. [Core Concepts](#5-core-concepts)
   - [Modules](#modules)
   - [Controllers](#controllers)
   - [Services (Providers)](#services-providers)
   - [Entities (TypeORM)](#entities-typeorm)
   - [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
6. [Getting Started](#6-getting-started)
7. [Docker Setup](#7-docker-setup)
   - [Architecture Overview](#architecture-overview)
   - [Docker Compose Configuration](#docker-compose-configuration)
   - [Backend Dockerfile](#backend-dockerfile)
   - [Frontend Dockerfile](#frontend-dockerfile)
   - [Nginx Configuration for Production](#nginx-configuration-for-production)
   - [Environment Variables & .dockerignore](#environment-variables--dockerignore)
   - [Running with Docker](#running-with-docker)
   - [Development vs Production](#development-vs-production)
8. [Step-by-Step Tutorial: Building a Product Module](#8-step-by-step-tutorial-building-a-product-module)
   - [Step 1: Creating the Module](#step-1-creating-the-module)
   - [Step 2: Creating the Entity with TypeORM](#step-2-creating-the-entity-with-typeorm)
   - [Step 3: Creating DTOs with Validation](#step-3-creating-dtos-with-validation)
   - [Step 4: Creating the Service with Business Logic](#step-4-creating-the-service-with-business-logic)
   - [Step 5: Creating the Controller with Routes](#step-5-creating-the-controller-with-routes)
   - [Step 6: Registering the Module](#step-6-registering-the-module)
9. [Database Integration with TypeORM](#9-database-integration-with-typeorm)
10. [Authentication & Authorization](#10-authentication--authorization)
   - [JWT Authentication Setup](#jwt-authentication-setup)
   - [Creating the Auth Module](#creating-the-auth-module)
   - [Guards (JwtAuthGuard, RolesGuard)](#guards-jwtauthguard-rolesguard)
   - [Custom Decorators](#custom-decorators)
   - [Protecting Routes](#protecting-routes)
11. [Validation & Error Handling](#11-validation--error-handling)
    - [Global Validation Pipes](#global-validation-pipes)
    - [Exception Filters](#exception-filters)
12. [Response Transformation](#12-response-transformation)
    - [Response Interceptors](#response-interceptors)
    - [Consistent API Responses](#consistent-api-responses)
13. [API Documentation with Swagger](#13-api-documentation-with-swagger)
14. [Security Best Practices](#14-security-best-practices)
15. [Testing](#15-testing)
16. [Advanced Features](#16-advanced-features)
17. [Best Practices & Tips](#17-best-practices--tips)

---

## 1. Introduction to NestJS

**NestJS** is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript by default and combines elements of **Object-Oriented Programming (OOP)**, **Functional Programming (FP)**, and **Functional Reactive Programming (FRP)**.

### Why NestJS?

| Feature | Benefit |
|---------|---------|
| **TypeScript-first** | Type safety, better IDE support, fewer runtime errors |
| **Modular architecture** | Organize code into reusable, testable modules |
| **Dependency Injection** | Built-in DI container for clean, testable services |
| **Decorators** | Declarative route handling, validation, authentication |
| **Swagger integration** | Auto-generated API documentation |
| **ORM agnostic** | Works with TypeORM, Prisma, Mongoose, etc. |
| **Testing ready** | Jest integration out of the box |

### NestJS Architecture Overview

```
┌─────────────────────────────────────────┐
│            Application Module           │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ Auth     │  │ Products │  │ Sales │  │
│  │ Module   │  │ Module   │  │Module │  │
│  └──────────┘  └──────────┘  └───────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ Users    │  │Category  │  │Report │  │
│  │ Module   │  │Module    │  │Module │  │
│  └──────────┘  └──────────┘  └───────┘  │
└─────────────────────────────────────────┘
```

NestJS follows a **controller-service-repository** pattern:
- **Controllers** handle HTTP requests/responses
- **Services** contain business logic
- **Repositories** (via TypeORM) handle database operations

---

## 2. Project Overview

This POS (Point-of-Sale) system is a full-stack application with:

### Backend (NestJS)
- **14 feature modules**: Auth, Users, Products, Categories, Sales, Reports, Suppliers, Stock Movements, Purchase Orders, Returns, Upload (3 strategies), Management
- **Database**: MySQL/TiDB Cloud with TypeORM
- **Authentication**: JWT with role-based access (admin, cashier, user)
- **API Documentation**: Swagger with auto-authorization
- **Security**: Helmet, CORS, bcrypt password hashing

### Key Features
- Product management with barcode support
- Sales processing with transaction management
- Stock movement tracking
- Multi-language support (Khmer/English)
- File uploads (local S3, Cloudinary, dynamic)
- Paginated API responses
- Soft deletes for data preservation

---

## 3. Prerequisites

Before diving into NestJS, you should have:

| Skill | Level |
|-------|-------|
| **TypeScript** | Intermediate - classes, decorators, types |
| **Node.js** | Basic - npm, CommonJS vs ESM |
| **Express.js** | Familiarity with REST APIs |
| **SQL** | Basic - tables, queries, relations |
| **OOP** | Classes, inheritance, dependency injection |

### Tools to Install

- **Node.js** (v18+)
- **npm** or **yarn**
- **MySQL** (or TiDB Cloud for serverless)
- **Postman** or similar API client
- **VS Code** with NestJS extensions

---

## 4. Project Structure

Here's the folder structure of the POS backend:

```
pos-backend/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   ├── config/                  # Configuration files
│   │   ├── app.config.ts        # App config (port, JWT)
│   │   ├── database.config.ts   # TypeORM DB config
│   │   └── typeorm.config.ts    # CLI DataSource for migrations
│   ├── common/                  # Shared code
│   │   ├── decorators/          # Custom decorators
│   │   ├── dto/                 # Shared DTOs (pagination)
│   │   ├── filters/             # Exception filters
│   │   ├── guards/              # Auth guards
│   │   ├── helpers/             # Utility helpers
│   │   └── interceptors/        # Response interceptors
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Data seeders
│   └── modules/                 # Feature modules
│       ├── auth/
│       ├── products/
│       ├── categories/
│       ├── sales/
│       ├── users/
│       ├── reports/
│       ├── suppliers/
│       ├── stock-movements/
│       ├── purchase-orders/
│       ├── returns/
│       ├── upload/
│       ├── upload-cloudinary/
│       ├── upload-dynamic/
│       └── management/
├── test/                        # E2E tests
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Each Feature Module Follows This Pattern:

```
products/
├── entities/
│   └── product.entity.ts        # TypeORM entity
├── dto/
│   └── product.dto.ts           # Data Transfer Objects
├── products.controller.ts       # Route handlers
├── products.service.ts          # Business logic
└── products.module.ts           # Module definition
```

---

## 5. Core Concepts

### Modules

**Modules** are the fundamental building blocks in NestJS. Each module encapsulates a related set of features.

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],  // Register entity
  controllers: [ProductsController],                // Route handlers
  providers: [ProductsService],                     // Services
  exports: [ProductsService],                       // Share with other modules
})
export class ProductsModule {}
```

**Key Points:**
- `imports` - Other modules this module needs
- `controllers` - Route handlers for this module
- `providers` - Services, repositories, factories
- `exports` - Services to make available to other modules

### Controllers

**Controllers** handle incoming HTTP requests and return responses. They use **decorators** to define routes.

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';

@Controller('products')    // Base path: /api/v1/products
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()                  // POST /api/v1/products
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')              // GET /api/v1/products/:id
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
```

**Common Decorators:**
| Decorator | Purpose |
|-----------|---------|
| `@Controller()` | Defines a controller with optional base path |
| `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` | HTTP method handlers |
| `@Param()` | Route parameters |
| `@Query()` | Query string parameters |
| `@Body()` | Request body |
| `@Headers()` | Request headers |
| `@UseGuards()` | Apply guards |
| `@UseInterceptors()` | Apply interceptors |

### Services (Providers)

**Services** contain the business logic of your application. They are **providers** that can be injected into controllers and other services.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }
}
```

**Why Services?**
- **Separation of concerns**: Business logic stays out of controllers
- **Reusability**: Same service can be used by multiple controllers
- **Testability**: Easy to unit test without HTTP concerns
- **Dependency Injection**: NestJS manages service lifecycle

### Entities (TypeORM)

**Entities** map to database tables. They define the schema and relationships.

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')  // Maps to 'products' table
export class Product {
  @PrimaryGeneratedColumn()           // Auto-increment ID
  id: number;

  @Column({ length: 150 })            // VARCHAR(150)
  name: string;

  @Column({ name: 'name_kh', length: 150 })  // Custom column name
  nameKh: string;

  @Column({ unique: true, length: 100 })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**TypeORM Column Types:**

| Decorator | Database Type |
|-----------|---------------|
| `@PrimaryGeneratedColumn()` | Auto-increment integer |
| `@Column()` | Various types |
| `@CreateDateColumn()` | DATETIME (auto-set on create) |
| `@UpdateDateColumn()` | DATETIME (auto-updated) |
| `@DeleteDateColumn()` | DATETIME for soft deletes |

**Relationships:**

| Decorator | Description |
|-----------|-------------|
| `@ManyToOne()` | Many products → one category |
| `@OneToMany()` | One category → many products |
| `@OneToOne()` | One-to-one relationship |
| `@ManyToMany()` | Many-to-many relationship |
| `@JoinColumn()` | Defines the foreign key column |

### DTOs (Data Transfer Objects)

**DTOs** define the shape of data for API requests and responses. They work with `class-validator` for validation.

```typescript
import { IsString, IsNotEmpty, IsNumber, IsInt, IsPositive, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca Cola' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'កូកាកូឡា' })
  @IsString()
  @IsOptional()
  nameKh?: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '8850000000000' })
  @IsString()
  @IsNotEmpty()
  barcode: string;
}
```

**Common Validation Decorators:**

| Decorator | Purpose |
|-----------|---------|
| `@IsString()` | Must be a string |
| `@IsInt()` | Must be an integer |
| `@IsNumber()` | Must be a number (with options) |
| `@IsEmail()` | Must be a valid email |
| `@IsBoolean()` | Must be a boolean |
| `@IsOptional()` | Field is not required |
| `@IsNotEmpty()` | Must not be empty |
| `@Min()`, `@Max()` | Numeric range |
| `@MinLength()`, `@MaxLength()` | String length range |
| `@IsPositive()` | Must be > 0 |

---

## 6. Getting Started

### Installation

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project
nest new pos-backend

# Start development server
cd pos-backend
npm run start:dev
```

### Key npm Scripts

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",           # Watch mode (auto-restart)
    "start:prod": "node dist/main",
    "test": "jest --passWithNoTests",             # Unit tests
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "migration:generate": "npm run typeorm -- migration:generate -d src/config/typeorm.config.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/config/typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/config/typeorm.config.ts"
  }
}
```

---

## 7. Docker Setup

Docker provides a consistent, reproducible environment for development, testing, and production. This POS system uses Docker Compose to orchestrate multiple containers: a NestJS backend, an Angular frontend, a MySQL database, and a MinIO (S3-compatible) object storage service.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │  Frontend     │    │   Backend    │    │    MySQL 8.4   │ │
│  │  (Angular)    │───▶│  (NestJS)    │───▶│   (Database)   │ │
│  │  Port 4200    │    │  Port 3000   │    │   Port 3306    │ │
│  └──────────────┘    └──────┬───────┘    └────────────────┘ │
│                             │                                │
│                             ▼                                │
│                    ┌────────────────┐                        │
│                    │    MinIO       │                        │
│                    │  (S3 Storage)  │                        │
│                    │  Ports 9003/   │                        │
│                    │       9091     │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

The stack consists of **5 services**:

| Service | Container Name | Purpose |
|---------|---------------|---------|
| `frontend` | `projectpos-frontend` | Angular dev server (hot-reload) |
| `backend` | `projectpos-backend` | NestJS API server (hot-reload) |
| `db` | `projectpos-mysql` | MySQL 8.4 database |
| `minio` | `projectpos-minio` | S3-compatible object storage for uploads |
| `createbuckets` | `projectpos-minio-setup` | One-time MinIO bucket initializer |

### Docker Compose Configuration

The root `docker-compose.yml` orchestrates all services. Let's examine each service configuration.

#### Frontend Service

```yaml
frontend:
  build:
    context: ./pos-frontend
    dockerfile: Dockerfile
    target: development
  container_name: projectpos-frontend
  ports:
    - "4200:4200"
  restart: unless-stopped
  volumes:
    - ./pos-frontend/src:/app/src          # Hot-reload source code
    - ./pos-frontend/angular.json:/app/angular.json
    - ./pos-frontend/proxy.conf.js:/app/proxy.conf.js
    - ./pos-frontend/tsconfig.json:/app/tsconfig.json
    - ./pos-frontend/package.json:/app/package.json
    - ./pos-frontend/tailwind.config.js:/app/tailwind.config.js
    - ./pos-frontend/postcss.config.js:/app/postcss.config.js
    - ./pos-frontend/public:/app/public
    - ./pos-frontend/src/assets:/app/src/assets
  environment:
    CHOKIDAR_USEPOLLING: '1'              # Required for file watching in Docker
    PROXY_TARGET: http://backend:3000      # API proxy target
  command: npx ng serve --host 0.0.0.0 --poll 2000
```

> **Key Points:**
> - The `target: development` selects the **development stage** from the multi-stage Dockerfile
> - Source code is mounted as volumes, enabling **hot-reload** — changes in your editor instantly reflect in the container
> - `CHOKIDAR_USEPOLLING: '1'` enables file-watching polling, which is required for Docker/bind mounts to detect changes
> - `--poll 2000` sets the Angular file-watch polling interval to 2 seconds
> - `PROXY_TARGET` tells the Angular proxy to forward `/api/` requests to the backend container

#### Backend Service

```yaml
backend:
  build:
    context: ./pos-backend
    dockerfile: Dockerfile
    target: builder                           # Use builder stage for dev (includes dev deps)
  container_name: projectpos-backend
  ports:
    - "3001:3000"                            # Host:3001 → Container:3000
  restart: unless-stopped
  volumes:
    - ./pos-backend/src:/app/src              # Hot-reload source code
    - ./pos-backend/nest-cli.json:/app/nest-cli.json
    - ./pos-backend/tsconfig.json:/app/tsconfig.json
  env_file:
    - ./pos-backend/.env                      # Load all DB secrets from .env file
  environment:
    NODE_ENV: ${NODE_ENV:-development}
    PORT: 3000
    CHOKIDAR_USEPOLLING: '1'
    FRONTEND_URL: http://localhost:4200
    S3_ENDPOINT: http://minio:9000            # Internal Docker network
    S3_REGION: us-east-1
    S3_ACCESS_KEY: minioadmin
    S3_SECRET_KEY: minioadmin
    S3_BUCKET: pos-uploads
    S3_PUBLIC_URL: http://localhost:9003
  depends_on:
    - minio                                   # Wait for MinIO to start
  command: npm run start:dev                   # Run in watch mode
```

> **Key Points:**
> - Port mapping `3001:3000` — the backend is exposed on host port **3001** (not 3000) to avoid conflicts
> - All database credentials are loaded from `./pos-backend/.env` using `env_file`
> - MinIO connection uses internal Docker DNS (`http://minio:9000`) — no need to expose MinIO to the host for internal service communication
> - `depends_on: - minio` ensures MinIO starts before the backend
> - `target: builder` uses the builder stage which includes development dependencies (TypeScript, NestJS CLI)

#### MySQL Database Service

```yaml
db:
  image: mysql:8.4
  container_name: projectpos-mysql
  restart: unless-stopped
  command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
  environment:
    MYSQL_ROOT_PASSWORD: rootpassword
    MYSQL_DATABASE: pos_db
    MYSQL_USER: pos_user
    MYSQL_PASSWORD: pos_password
  ports:
    - "3306:3306"
  volumes:
    - db-data:/var/lib/mysql                 # Persistent data volume
    - ./pos-backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # Auto-init
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-prootpassword"]
    interval: 10s
    timeout: 5s
    retries: 10
```

> **Key Points:**
> - The `command` flag configures MySQL to use **utf8mb4 charset** with Unicode collation — essential for multi-language support (Khmer/English)
> - A named volume `db-data` persists database data across container restarts
> - An `init.sql` script is mounted into `/docker-entrypoint-initdb.d/`, which MySQL executes automatically on **first run** only
> - A **healthcheck** verifies MySQL is ready before other services attempt to connect
> - In production, you would use TiDB Cloud (as configured in the application), but this local MySQL is available for development and testing

#### MinIO (S3 Storage) Service

```yaml
minio:
  image: minio/minio
  container_name: projectpos-minio
  ports:
    - "9003:9000"                            # S3 API (connected by backend)
    - "9091:9090"                            # MinIO Web Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  volumes:
    - minio-data:/data                        # Persistent storage
  command: server /data --console-address ":9090"
  restart: always
```

> **MinIO** is an open-source, S3-compatible object storage server. It's used locally to simulate AWS S3 for file uploads (product images, etc.). The web console is accessible at `http://localhost:9091`.

#### Bucket Initializer Service

```yaml
createbuckets:
  image: minio/mc                              # MinIO Client
  container_name: projectpos-minio-setup
  depends_on:
    - minio
  entrypoint: >
    /bin/sh -c "
      /usr/bin/mc alias set local http://minio:9000 minioadmin minioadmin;
      /usr/bin/mc mb --ignore-existing local/pos-uploads;
      /usr/bin/mc anonymous set public local/pos-uploads;
      exit 0;
    "
```

> **One-time setup service** that:
> 1. Creates an alias to the MinIO server (`local`)
> 2. Creates a bucket called `pos-uploads` (if it doesn't already exist)
> 3. Sets the bucket to **public** so uploaded images are publicly accessible
> 4. Exits after completion (it's not a long-running service)

#### Named Volumes

```yaml
volumes:
  db-data:           # MySQL persistent storage
  minio-data:        # MinIO persistent storage
```

Named volumes ensure data survives container restarts and recreations. Without them, database records and uploaded files would be lost when containers are removed.

### Backend Dockerfile

The backend uses a **multi-stage Dockerfile** to optimize for both development and production:

```dockerfile
# ═══════════════════════════════════════════════════════════════════
#  STAGE 1: Install dependencies & build
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (layer caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# ═══════════════════════════════════════════════════════════════════
#  STAGE 2: Production runtime (minimal image)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1 || exit 1

CMD ["node", "dist/main.js"]
```

**Multi-stage build explained:**

| Stage | Purpose | Size | Dev/Prod |
|-------|---------|------|----------|
| `builder` | Install all deps + compile TypeScript | ~1.5 GB | Dev |
| `production` | Minimal runtime with compiled JS only | ~200 MB | Prod |

**Key benefits of multi-stage:**
1. **Smaller production images** — only runtime dependencies (`--omit=dev`) and compiled JavaScript are in the final image
2. **Layer caching** — `package.json` is copied first, so `npm ci` is only re-run when dependencies change
3. **Security** — runs as a non-root user (`appuser`) instead of root
4. **Health check** — Docker can verify the application is responding before routing traffic

#### Layer Caching Strategy

```dockerfile
# ✅ GOOD: Copy package.json first — changes rarely
COPY package.json package-lock.json* ./
RUN npm ci

# Then copy source — changes frequently
COPY . .
```

If `package.json` hasn't changed, Docker **reuses the cached layer** for `npm ci`, dramatically speeding up rebuilds. This is one of the most important Dockerfile optimizations.

### Frontend Dockerfile

The frontend also uses **three stages**: development, build, and production (nginx).

```dockerfile
# ─── Stage 1: Development (hot reload) ──────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]

# ─── Stage 2: Build for production ──────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production

# ─── Stage 3: Serve with nginx ────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist/pos-system/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Stage breakdown:**

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| `development` | `node:20-alpine` | Hot-reload dev server with `ng serve` |
| `build` | `node:20-alpine` | Compile the Angular app for production |
| (final) | `nginx:alpine` | Serve compiled files via nginx |

> **Note:** The `development` stage uses `--legacy-peer-deps` because Angular projects often have peer dependency conflicts that aren't an issue at runtime.

### Nginx Configuration for Production

In production, the compiled Angular app is served by **nginx**, which also proxies API requests to the backend:

```nginx
server {
  listen 80;

  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  # Proxy API requests to the backend
  location /api/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Serve static frontend files
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Nginx configuration explained:**

- **`location /api/`** — All `/api/` requests are forwarded to the backend container via Docker's internal DNS (`http://backend:3000`)
- **`try_files $uri $uri/ /index.html`** — For SPA routing: serves `index.html` for any unmatched routes, allowing Angular's router to handle them client-side
- **Proxy headers** pass the original client IP, host, and protocol to the backend for proper request logging and CORS handling

### Environment Variables & .dockerignore

#### Backend .env File

Create a `pos-backend/.env` file with your database credentials:

```env
# Database (TiDB Cloud or local MySQL)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=pos_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=8h

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# S3 (MinIO)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=pos-uploads
S3_PUBLIC_URL=http://localhost:9003
```

#### .dockerignore

The `pos-frontend/.dockerignore` file excludes unnecessary files from the Docker build context, keeping builds fast and images lean:

```
node_modules
.git
dist
.env
*.md
.gitignore
```

> **Why .dockerignore matters:** Large files like `node_modules` (hundreds of MB) are excluded from the build context, so they don't get sent to the Docker daemon. They are installed fresh inside the container via `npm install`.

### Running with Docker

#### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git clone of the project

#### Start All Services (Development)

```bash
# From the project root (where docker-compose.yml lives)
docker compose up -d

# Check container status
docker compose ps

# View logs from all services
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3001/api/v1 |
| MinIO Console | http://localhost:9091 |
| Swagger Docs | http://localhost:3001/api/docs |

> **Note:** The backend is exposed on host port **3001** (not 3000) to avoid conflicts. Update your frontend's API base URL accordingly.

#### Common Docker Commands

```bash
# Start containers in background
docker compose up -d

# Stop all containers
docker compose down

# Stop and remove volumes (⚠️ deletes database data!)
docker compose down -v

# Rebuild containers after code changes to Dockerfile
docker compose up -d --build

# Rebuild a single service
docker compose up -d --build backend

# Restart a specific service
docker compose restart backend

# View real-time logs
docker compose logs -f

# Execute a command inside a running container
docker compose exec backend sh

# Run database migrations inside the container
docker compose exec backend npm run migration:run

# Check resource usage
docker stats
```

#### Initialize the Database

Once the containers are running, run the migrations:

```bash
# Run pending TypeORM migrations
docker compose exec backend npm run migration:run

# (Optional) Seed the database with sample data
docker compose exec backend npm run seed
```

#### Verify Everything is Working

```bash
# Check all containers are running
docker compose ps

# Test the backend health endpoint
curl http://localhost:3001/api/v1

# Test a specific endpoint
curl http://localhost:3001/api/v1/products | jq .

# Open the frontend in your browser
start http://localhost:4200
```

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Dockerfile Target** | `builder` (backend) / `development` (frontend) | `production` (backend) / nginx stage (frontend) |
| **Hot Reload** | ✅ Yes — source code volumes mounted | ❌ No — compiled code baked into image |
| **Node Env** | `NODE_ENV=development` | `NODE_ENV=production` |
| **Database** | Local MySQL container or TiDB Cloud | TiDB Cloud (external) |
| **Port** | Host 3001 → Container 3000 | Host 3000 → Container 3000 |
| **File Watching** | Polling enabled (CHOKIDAR_USEPOLLING) | Not needed |
| **Image Size** | Large (includes dev deps, source) | Small (only compiled JS, production deps) |
| **Security** | Root user inside container | Non-root `appuser` |

#### Production Deployment

For production deployment, modify the Docker Compose or use the production-stage Dockerfile directly:

```bash
# Build the production backend image
docker build -t pos-backend:latest \
  -f pos-backend/Dockerfile \
  --target production \
  pos-backend/

# Build the production frontend image
docker build -t pos-frontend:latest \
  -f pos-frontend/Dockerfile \
  --target final \
  pos-frontend/

# Run the backend container
docker run -d \
  --name pos-api \
  --env-file pos-backend/.env \
  -p 3000:3000 \
  pos-backend:latest
```

#### Backend-Only Docker Compose (for production)

The project also includes a `pos-backend/docker-compose.yml` for running just the backend and MySQL:

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: pos_mysql_local
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: pos_db
      MYSQL_USER: pos_user
      MYSQL_PASSWORD: pos_password
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-prootpassword"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - pos_network

  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: pos_api
    restart: unless-stopped
    env_file:
      - .env
    environment:
      PORT: 3000
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - '3000:3000'
    networks:
      - pos_network

volumes:
  mysql_data:

networks:
  pos_network:
    driver: bridge
```

This is useful for:
- Deploying just the backend independently
- CI/CD pipelines that only test the backend
- Microservice deployments where frontend is deployed separately

### Troubleshooting Docker

| Problem | Solution |
|---------|----------|
| `port is already allocated` | Stop the conflicting service, or change the host port mapping |
| `Cannot find module` | Rebuild the container: `docker compose up -d --build backend` |
| Database connection refused | Wait for MySQL healthcheck, or check credentials in `.env` |
| File changes not reflected | Ensure `CHOKIDAR_USEPOLLING=1` is set and `--poll 2000` is used with `ng serve` |
| MinIO connection refused | Check MinIO container logs: `docker compose logs minio` |
| Permission denied on mounted volumes | Ensure the host paths exist, or fix file permissions |
| Container exits immediately | Check logs: `docker compose logs <service>` |
| Out of disk space | Run `docker system prune -a` to clean unused images and containers |

---

## 8. Step-by-Step Tutorial: Building a Product Module

Let's build a complete **Product Module** from scratch — this is the core module of any POS system.

### Step 1: Creating the Module

Use the NestJS CLI to generate the module:

```bash
# Generate module, controller, and service
nest g module products
nest g controller products
nest g service products

# Create entity directory
mkdir src/modules/products/entities
```

Or create `products.module.ts` manually:

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

### Step 2: Creating the Entity with TypeORM

Create `entities/product.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { SaleItem } from '../../sales/entities/sale-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'name_kh', length: 150 })
  nameKh: string;

  @Column({ name: 'img_url', length: 255, nullable: true })
  imgUrl: string;

  @Column({ unique: true, length: 100 })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => SaleItem, (item) => item.product)
  saleItems: SaleItem[];
}
```

**Understanding the Entity:**
- `@Entity('products')` maps to the `products` table
- `@PrimaryGeneratedColumn()` creates an auto-increment ID
- `@Column()` defines regular columns with optional name mapping
- `@ManyToOne()` creates a foreign key relationship to categories
- `@OneToMany()` creates the inverse relationship to sale items
- `@CreateDateColumn()` auto-sets the creation timestamp
- `onDelete: 'RESTRICT'` prevents deleting a category that has products

### Step 3: Creating DTOs with Validation

Create `dto/product.dto.ts`:

```typescript
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca Cola' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'កូកាកូឡា' })
  @IsString()
  @IsOptional()
  nameKh?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '8850000000000' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 0.8, description: 'Cost price from supplier' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  categoryId: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nameKh?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsPositive()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: 'positive = add, negative = subtract' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
```

**Key DTO Patterns:**
- **Create DTO**: All required fields are mandatory with `@IsNotEmpty()`
- **Update DTO**: All fields are optional with `@IsOptional()`
- **Separate DTOs for specific actions** (like `AdjustStockDto`)

### Step 4: Creating the Service with Business Logic

Create `products.service.ts`:

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // Check for duplicate barcode
    const existing = await this.productRepository.findOne({
      where: { barcode: dto.barcode },
    });
    if (existing) {
      throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
    }

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(
    includeInactive = false,
    pagination?: PaginationDto,
  ): Promise<PaginatedResult<Product>> {
    const where = includeInactive ? {} : { isActive: true };
    return paginate(this.productRepository, pagination ?? {}, {
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode, isActive: true },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with barcode "${barcode}" not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check barcode uniqueness if changing barcode
    if (dto.barcode && dto.barcode !== product.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: dto.barcode },
      });
      if (existing) {
        throw new ConflictException(`Barcode "${dto.barcode}" already in use`);
      }
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async adjustStock(id: number, dto: AdjustStockDto): Promise<Product> {
    const product = await this.findOne(id);
    const newStock = product.stock + dto.quantity;
    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot reduce stock below 0. Current stock: ${product.stock}`,
      );
    }
    product.stock = newStock;
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    // Soft-delete: deactivate instead of hard delete
    product.isActive = false;
    await this.productRepository.save(product);
    return { message: `Product #${id} deactivated successfully` };
  }
}
```

**Service Best Practices Demonstrated:**
1. **Repository Pattern**: Use `@InjectRepository()` for clean database access
2. **Business Validation**: Check for duplicate barcodes before creating
3. **Meaningful Exceptions**: Use `NotFoundException`, `ConflictException`, `BadRequestException`
4. **Soft Delete**: Deactivate records instead of hard deleting
5. **Relationship Loading**: Use `relations` option to eager-load related data
6. **Pagination**: Use a reusable pagination helper

### Step 5: Creating the Controller with Routes

Create `products.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /api/v1/products  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET /api/v1/products  [all roles]
  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.productsService.findAll(
      includeInactive === 'true',
      pagination ?? {},
    );
  }

  // GET /api/v1/products/barcode/:barcode  [all roles]
  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get a product by barcode' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  // GET /api/v1/products/:id  [all roles]
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /api/v1/products/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  // PATCH /api/v1/products/:id/stock  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/stock')
  @ApiOperation({ summary: 'Adjust product stock' })
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(id, dto);
  }

  // DELETE /api/v1/products/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
```

**Route Summary:**

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/products` | JWT | admin | Create product |
| GET | `/products` | JWT | all | List products (paginated) |
| GET | `/products/barcode/:barcode` | JWT | all | Find by barcode |
| GET | `/products/:id` | JWT | all | Get by ID |
| PATCH | `/products/:id` | JWT | admin | Update product |
| PATCH | `/products/:id/stock` | JWT | admin | Adjust stock |
| DELETE | `/products/:id` | JWT | admin | Soft-delete product |

### Step 6: Registering the Module

Add `ProductsModule` to the root `AppModule`:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ProductsModule,
    // ... other modules
  ],
})
export class AppModule {}
```

---

## 9. Database Integration with TypeORM

### Configuration Setup

The database is configured using `@nestjs/config` and `@nestjs/typeorm`:

```typescript
// config/database.config.ts
export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 4000),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),

    autoLoadEntities: true,          // Auto-load entities from modules
    synchronize: false,              // Disable in production!
    migrations: ['dist/database/migrations/**/*.js'],
    migrationsRun: true,             // Auto-run migrations on startup
    logging: process.env.NODE_ENV === 'development',

    ssl: {                           // SSL for TiDB Cloud
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },

    extra: {
      connectionLimit: 10,
      charset: 'utf8mb4',
    },

    retryAttempts: 10,               // Retry connection
    retryDelay: 3000,                // 3 seconds between retries
  };
};
```

### App Module TypeORM Setup

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => databaseConfig(configService),
      inject: [ConfigService],
    }),

    // Feature modules...
    ProductsModule,
    AuthModule,
    // ...
  ],
})
export class AppModule {}
```

### Environment Variables

```env
# Database
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_db
DB_SSL=true

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

# App
PORT=3000
NODE_ENV=development
```

### Running Migrations

```bash
# Generate a migration
npm run migration:generate -- src/database/migrations/AddProductTable

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

### Sample Migration

```typescript
// InitialSchema migration
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1719240000000 implements MigrationInterface {
  name = 'InitialSchema1719240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '150' },
          { name: 'barcode', type: 'varchar', length: '100', isUnique: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'stock', type: 'int', default: 0 },
          { name: 'category_id', type: 'int' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

---

## 10. Authentication & Authorization

### JWT Authentication Setup

The authentication system uses **Passport.js** with the **JWT strategy**.

#### Step 1: Install Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs
```

#### Step 2: Create JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('app.jwt.secret') ||
        process.env.JWT_SECRET ||
        'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // This object is attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

#### Step 3: Configure Auth Module

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('app.jwt.secret') ||
          process.env.JWT_SECRET ||
          'fallback-secret',
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn', '8h') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

#### Step 4: Create Auth Service

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check account is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Build JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // 5. Sign and return token
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
```

#### Step 5: Create Auth Controller

```typescript
// auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipIntercept } from '../../common/decorators/skip-intercept.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipIntercept()  // Don't wrap response in standard format
  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }
}
```

### Guards (JwtAuthGuard, RolesGuard)

#### JwtAuthGuard

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

#### RolesGuard

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;  // No roles required → allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
```

### Custom Decorators

#### @Roles() Decorator

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### @CurrentUser() Decorator

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

#### @SkipIntercept() Decorator

```typescript
// common/decorators/skip-intercept.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const SKIP_INTERCEPT_KEY = 'skip_intercept';
export const SkipIntercept = () => SetMetadata(SKIP_INTERCEPT_KEY, true);
```

### Protecting Routes

Combine guards and role decorators to protect routes:

```typescript
// All authenticated users can access
@UseGuards(JwtAuthGuard)
@Get()
findAll() { ... }

// Only admin users can access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
create() { ... }

// Access current user in handler
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: any) { ... }

// Access specific user property
@UseGuards(JwtAuthGuard)
@Get('my-orders')
getMyOrders(@CurrentUser('id') userId: number) { ... }
```

---

## 11. Validation & Error Handling

### Global Validation Pipes

Configured in `main.ts`:

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,               // Strip unknown properties
    forbidNonWhitelisted: true,    // Throw on unknown properties
    transform: true,               // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

**What each option does:**
- `whitelist: true` → Automatically removes any properties not in the DTO
- `forbidNonWhitelisted: true` → Throws an error if extra properties are sent
- `transform: true` → Converts plain objects to DTO class instances
- `enableImplicitConversion: true` → Auto-converts types (string → number)

### Exception Filters

The global exception filter catches all HTTP exceptions and returns a consistent error response:

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exception.message;

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${JSON.stringify(message)}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Error Response Format:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product #999 not found",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/v1/products/999"
}
```

### Standard HTTP Exceptions

| Exception | HTTP Status | When to Use |
|-----------|-------------|-------------|
| `BadRequestException` | 400 | Invalid input |
| `UnauthorizedException` | 401 | Missing/invalid auth |
| `ForbiddenException` | 403 | Insufficient permissions |
| `NotFoundException` | 404 | Resource not found |
| `ConflictException` | 409 | Duplicate resource |
| `InternalServerErrorException` | 500 | Unexpected errors |

---

## 12. Response Transformation

### Response Interceptor

The response interceptor wraps all successful responses in a consistent format:

```typescript
// common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_INTERCEPT_KEY } from '../decorators/skip-intercept.decorator';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Skip wrapping if route has @SkipIntercept() decorator
    const skipIntercept = this.reflector.get<boolean>(
      SKIP_INTERCEPT_KEY,
      context.getHandler(),
    );
    if (skipIntercept) {
      return next.handle();
    }

    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data: any) => {
        // Paginated response
        const isPaginated =
          data && typeof data === 'object' && !Array.isArray(data) &&
          'data' in data && 'total' in data && 'page' in data && 'limit' in data;

        if (isPaginated) {
          return {
            success: true,
            statusCode,
            data: data.data,
            total: data.total,
            page: data.page,
            limit: data.limit,
            timestamp: new Date().toISOString(),
          };
        }

        // Plain array
        if (Array.isArray(data)) {
          return {
            success: true,
            statusCode,
            data,
            total: data.length,
            timestamp: new Date().toISOString(),
          };
        }

        // Single object
        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
```

### Consistent API Response Formats

**Single Object Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Coca Cola",
    "price": 1.50,
    "stock": 100
  },
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    { "id": 1, "name": "Coca Cola", "price": 1.50 },
    { "id": 2, "name": "Pepsi", "price": 1.50 }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Array Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [ ... ],
  "total": 5,
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Error Response (from exception filter):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product #999 not found",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/v1/products/999"
}
```

---

## 13. API Documentation with Swagger

### Setup in main.ts

```typescript
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('POS API')
  .setDescription('The POS system API documentation')
  .setVersion('1.0')
  .addBearerAuth()                              // Enable JWT auth in Swagger
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);

const swaggerCustomOptions: SwaggerCustomOptions = {
  customSiteTitle: 'POS API Docs',
  swaggerOptions: {
    persistAuthorization: true,                  // Keep token across page refreshes
    displayRequestDuration: true,                // Show request timing
    filter: true,                                // Enable endpoint search
  },
};

SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);
```

### Auto-Authorization Feature

The POS system includes an innovative auto-authorization feature that automatically captures the JWT token after login in Swagger UI:

```typescript
const autoAuthScript = `
(function() {
  var authorized = false;

  function tryAuthorize(text) {
    if (authorized) return true;
    try {
      var obj = JSON.parse(text);
      var token = obj && (obj.accessToken || (obj.data && obj.data.accessToken));
      if (token && window.ui && window.ui.authActions) {
        window.ui.authActions.authorize({
          bearer: {
            name: 'bearer',
            value: token,
            schema: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        });
        authorized = true;
        observer.disconnect();
        return true;
      }
    } catch (e) {}
    return false;
  }

  var observer = new MutationObserver(function() {
    if (authorized) return;
    var pres = document.querySelectorAll('pre');
    for (var i = 0; i < pres.length; i++) {
      var text = pres[i].textContent || '';
      if (text.indexOf('accessToken') !== -1) {
        if (tryAuthorize(text)) {
          console.log('[Swagger] ✅ Auto-authorized via DOM observer');
          return;
        }
      }
    }
  });

  function init() {
    if (!window.ui || !window.ui.authActions) {
      setTimeout(init, 300);
      return;
    }
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Swagger] ✅ Auto-auth DOM observer active');
  }
  init();
})();`;
```

### Swagger Decorators for Controllers

```typescript
@ApiTags('Products')              // Group endpoints in Swagger UI
@ApiBearerAuth()                  // Mark all endpoints as needing JWT
@Controller('products')
export class ProductsController {

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) { ... }

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(@Query() pagination?: PaginationDto) { ... }
}
```

### Swagger Decorators for DTOs

```typescript
export class CreateProductDto {
  @ApiProperty({ example: 'Coca Cola' })
  name: string;

  @ApiPropertyOptional({ example: 'កូកាកូឡា' })
  nameKh?: string;

  @ApiProperty({ example: 1.5 })
  price: number;

  @ApiProperty({ example: '8850000000000' })
  barcode: string;
}
```

### Accessing Swagger UI

Navigate to `http://localhost:3000/api/docs` after starting the server.

---

## 14. Security Best Practices

### Helmet Configuration

Helmet sets various HTTP headers for security:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
}));
```

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
    : [
        'https://your-app.vercel.app',
        /\.vercel\.app$/,
      ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### Password Hashing with bcrypt

```typescript
import * as bcrypt from 'bcryptjs';

// Hash password (10 salt rounds)
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### Additional Security Tips

1. **Never use `synchronize: true` in production**
2. **Use environment variables for secrets**
3. **Implement rate limiting** for auth endpoints
4. **Validate and sanitize all inputs**
5. **Use parameterized queries** (TypeORM handles this)
6. **Implement proper password policies** (min length, complexity)

---

## 15. Testing

### Unit Tests

```typescript
// products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const product = { id: 1, name: 'Test Product' };
      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(result).toEqual(product);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category'],
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('not found');
    });
  });
});
```

### E2E Tests

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('POS System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@pos.com', password: 'password123' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Run Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Verbose output
npm run test:verbose

# E2E tests
npm run test:e2e
```

---

## 16. Advanced Features

### Pagination Helper

A reusable pagination utility that works with any repository:

```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

```typescript
// common/helpers/pagination.helper.ts
export async function paginate<T>(
  repository: Repository<T>,
  pagination: PaginationDto,
  options?: Omit<FindManyOptions<T>, 'skip' | 'take'>,
): Promise<PaginatedResult<T>> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  return { data, total, page, limit };
}
```

### Transaction Management with QueryRunner

For complex operations like sales that involve multiple tables:

```typescript
async create(dto: CreateSaleDto, userId: number): Promise<Sale> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // All database operations within the transaction
    const sale = queryRunner.manager.create(Sale, { ... });
    const savedSale = await queryRunner.manager.save(Sale, sale);

    // Decrement stock within the same transaction
    await queryRunner.manager.decrement(Product, { id }, 'stock', quantity);

    await queryRunner.commitTransaction();
    return savedSale;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

### Soft Deletes

Instead of hard-deleting records (which breaks historical data), use soft deletes:

```typescript
// In service - deactivate instead of delete
async remove(id: number): Promise<{ message: string }> {
  const product = await this.findOne(id);
  product.isActive = false;
  await this.productRepository.save(product);
  return { message: `Product #${id} deactivated successfully` };
}

// In queries - filter active records
findAll() {
  return this.productRepository.find({
    where: { isActive: true },  // Only active products
  });
}
```

---

## 17. Best Practices & Tips

### Folder Structure
```
src/
├── modules/      # Feature modules (one per domain)
├── common/       # Shared code (guards, filters, decorators)
├── config/       # Configuration files
└── database/     # Migrations and seeders
```

### Code Organization
1. **One module per domain** (products, users, sales)
2. **Keep entities simple** — no business logic
3. **Services handle business logic** — controllers just route
4. **DTOs for every request/response** — never use raw entity types
5. **Use dependency injection** — constructor-based injection

### Error Handling
1. **Use HTTP exceptions** instead of returning error objects
2. **Global exception filter** for consistent error responses
3. **Log errors** with proper context (method, URL, status)

### Database
1. **Always use migrations** — never `synchronize: true` in production
2. **Use transactions** for multi-table operations
3. **Implement soft deletes** to preserve data integrity
4. **Add proper indexes** for frequently queried columns

### Security
1. **Never expose stack traces** in production
2. **Use environment variables** for all secrets
3. **Validate all inputs** with class-validator
4. **Use guards** for authentication AND authorization
5. **Apply rate limiting** on auth endpoints

### Performance
1. **Use pagination** for all list endpoints
2. **Select only needed fields** in queries
3. **Use eager/lazy loading** appropriately for relations
4. **Add database indexes** on foreign keys and searched columns

### Testing
1. **Write unit tests** for services (mock the repository)
2. **Write E2E tests** for critical API flows (auth, sales)
3. **Test error cases** (not found, unauthorized, validation errors)

### Common Pitfalls to Avoid
- ❌ Using `synchronize: true` in production
- ❌ Returning entire entities in API responses (leaks internal data)
- ❌ Not validating inputs
- ❌ Hard-deleting records with historical significance
- ❌ Not handling database connection failures
- ❌ Mixing business logic into controllers

### NestJS CLI Commands Reference

```bash
# Generate a complete CRUD resource
nest g resource products

# Generate individual components
nest g module products
nest g controller products
nest g service products
nest g class products/dto/create-product.dto
nest g interface products/interfaces/product.interface

# Generate common components
nest g guard common/guards/jwt-auth
nest g filter common/filters/http-exception
nest g interceptor common/interceptors/response
nest g decorator common/decorators/current-user

# Build and run
nest build                           # Build the project
nest start                           # Start production server
nest start --watch                   # Development mode with hot reload
```

---

## Conclusion

This tutorial covered the NestJS fundamentals by exploring a real-world POS system. You've learned:

- **Modular architecture** with NestJS modules
- **Entity design** with TypeORM relationships
- **DTO validation** with class-validator
- **JWT authentication** with Passport.js
- **Role-based authorization** with custom guards
- **Exception handling** with global filters
- **Response transformation** with interceptors
- **API documentation** with Swagger
- **Database migrations** with TypeORM CLI
- **Transaction management** with QueryRunner
- **Testing strategies** for NestJS applications

The complete source code is available in the `pos-backend/` directory. Use it as a reference while building your own NestJS applications.

**Next Steps:**
- Add GraphQL support
- Implement WebSocket for real-time updates
- Add Redis caching for frequently accessed data
- Set up CI/CD pipelines
- Implement microservices architecture
