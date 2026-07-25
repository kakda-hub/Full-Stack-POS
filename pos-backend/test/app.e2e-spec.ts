import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { ProductsController } from '../src/modules/products/products.controller';
import { ProductsService } from '../src/modules/products/products.service';
import { SalesController } from '../src/modules/sales/sales.controller';
import { SalesService } from '../src/modules/sales/sales.service';
import { CategoriesController } from '../src/modules/categories/categories.controller';
import { CategoriesService } from '../src/modules/categories/categories.service';

// ─── Helpers ─────────────────────────────────────────────────────────────

function mockAuthGuard(user: { id: number; email: string; role: string }) {
  return {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = user;
      return true;
    },
  };
}

async function createE2EApp(
  controllers: any[],
  providers: any[],
  guardOverrides?: Array<{ guard: any; useValue: any }>,
  imports?: any[],
): Promise<INestApplication> {
  let builder = Test.createTestingModule({ controllers, providers, imports: imports ?? [] });

  if (guardOverrides) {
    for (const { guard, useValue } of guardOverrides) {
      builder = builder.overrideGuard(guard).useValue(useValue);
    }
  }

  const moduleRef: TestingModule = await builder.compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  return app;
}

// ════════════════════════════════════════════════════════════════════════
// E2E Tests
// ════════════════════════════════════════════════════════════════════════

jest.setTimeout(30_000);

describe('POS API — End-to-End', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── SECTION 1: Auth Flow (no guards required) ──────────────────────
  describe('Auth Flow — Login / Forgot / Reset Password', () => {
    let app: INestApplication;
    const mockAuthService = {
      login: jest.fn(),
      getProfile: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    beforeAll(async () => {
      app = await createE2EApp(
        [AuthController],
        [{ provide: AuthService, useValue: mockAuthService }],
      );
    });

    afterAll(async () => { await app.close(); });

    it('POST /api/v1/auth/login — returns JWT with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'e2e-test-token',
        user: { id: 1, name: 'Admin', email: 'admin@pos.com', role: 'admin', avatarUrl: null },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@pos.com', password: 'admin123' })
        .expect(201);

      // @SkipIntercept() → raw response
      expect(response.body.accessToken).toBe('e2e-test-token');
      expect(response.body.user.role).toBe('admin');
    });

    it('POST /api/v1/auth/login — 400 on invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'invalid', password: 'pwd' })
        .expect(400);
    });

    it('POST /api/v1/auth/login — 400 on missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /api/v1/auth/forgot-password — 201 with valid email', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'If that email exists, a reset link has been sent.',
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'admin@pos.com' })
        .expect(201);
    });

    it('POST /api/v1/auth/reset-password — 201 with valid data', async () => {
      mockAuthService.resetPassword.mockResolvedValue({
        message: 'Password has been successfully reset',
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'newpassword123' })
        .expect(201);
    });
  });

  // ─── SECTION 2: Unauthenticated (real JwtAuthGuard) ─────────────────
  describe('Unauthenticated Access — 401', () => {
    let app: INestApplication;

    beforeAll(async () => {
      // No JwtAuthGuard override → real guard is active.
      // Need PassportModule + JwtStrategy for the guard to work.
      app = await createE2EApp(
        [ProductsController, SalesController, CategoriesController],
        [
          { provide: ProductsService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
          { provide: SalesService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
          { provide: CategoriesService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
          { provide: ConfigService, useValue: { get: () => 'test-secret' } },
          JwtStrategy,
        ],
        undefined,
        [
          PassportModule.register({ defaultStrategy: 'jwt' }),
          JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
        ],
      );
    });

    afterAll(async () => { await app.close(); });

    it('GET /api/v1/products — 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(401);
    });

    it('GET /api/v1/sales — 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/sales')
        .expect(401);
    });

    it('GET /api/v1/categories — 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(401);
    });

    it('GET /api/v1/products/1 — 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/1')
        .expect(401);
    });

    it('GET /api/v1/sales/1 — 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/sales/1')
        .expect(401);
    });
  });

  // ─── SECTION 3: Role-Based Access ───────────────────────────────────
  describe('Role-Based Access Control', () => {
    let adminApp: INestApplication;
    let cashierApp: INestApplication;
    const mockProductsService = { create: jest.fn(), findAll: jest.fn() };
    const mockSalesService = { create: jest.fn(), findAll: jest.fn() };
    const mockCategoriesService = { create: jest.fn(), findAll: jest.fn() };

    beforeAll(async () => {
      // Admin: both guards mocked to allow everything
      adminApp = await createE2EApp(
        [ProductsController, SalesController, CategoriesController],
        [
          { provide: ProductsService, useValue: mockProductsService },
          { provide: SalesService, useValue: mockSalesService },
          { provide: CategoriesService, useValue: mockCategoriesService },
        ],
        [
          { guard: JwtAuthGuard, useValue: mockAuthGuard({ id: 1, email: 'admin@pos.com', role: 'admin' }) },
          { guard: RolesGuard, useValue: { canActivate: () => true } },
        ],
      );

      // Cashier: JWT guard mocked → sets cashier role, RolesGuard REAL → checks @Roles()
      cashierApp = await createE2EApp(
        [ProductsController, SalesController, CategoriesController],
        [
          { provide: ProductsService, useValue: mockProductsService },
          { provide: SalesService, useValue: mockSalesService },
          { provide: CategoriesService, useValue: mockCategoriesService },
        ],
        [
          { guard: JwtAuthGuard, useValue: mockAuthGuard({ id: 2, email: 'cashier@pos.com', role: 'cashier' }) },
          // RolesGuard is NOT overridden → uses the real guard
        ],
      );
    });

    afterAll(async () => {
      await adminApp.close();
      await cashierApp.close();
    });

    // ── Admin tests ──────────────────────────────────────────────────
    it('Admin — POST /api/v1/products — 201', async () => {
      mockProductsService.create.mockResolvedValue({
        id: 1, name: 'Test', barcode: '123', price: 1.0, stock: 10, categoryId: 1,
      });

      const response = await request(adminApp.getHttpServer())
        .post('/api/v1/products')
        .send({ name: 'Test', barcode: '123', price: 1.0, stock: 10, categoryId: 1 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('Admin — POST /api/v1/categories — 201', async () => {
      mockCategoriesService.create.mockResolvedValue({ id: 1, name: 'Beverages' });

      await request(adminApp.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Beverages' })
        .expect(201);
    });

    // ── Cashier tests ────────────────────────────────────────────────
    it('Cashier — POST /api/v1/products — 403 (admin-only)', async () => {
      // The real RolesGuard checks @Roles('admin') on this endpoint
      await request(cashierApp.getHttpServer())
        .post('/api/v1/products')
        .send({ name: 'Test', barcode: '123', price: 1.0, stock: 10, categoryId: 1 })
        .expect(403);
    });

    it('Cashier — POST /api/v1/categories — 403 (admin-only)', async () => {
      await request(cashierApp.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Test' })
        .expect(403);
    });

    it('Cashier — GET /api/v1/sales — 200 (cashier-accessible)', async () => {
      mockSalesService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      // Sales controller does NOT have @Roles('admin') — all authenticated users can access
      await request(cashierApp.getHttpServer())
        .get('/api/v1/sales')
        .expect(200);
    });

    it('Cashier — GET /api/v1/products — 200 (all authenticated)', async () => {
      mockProductsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      // Products controller's GET doesn't have @Roles('admin') — only POST/PATCH/DELETE do
      await request(cashierApp.getHttpServer())
        .get('/api/v1/products')
        .expect(200);
    });
  });

  // ─── SECTION 4: Error Format Consistency ───────────────────────────
  describe('Error Format Consistency', () => {
    let app: INestApplication;
    const mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findByBarcode: jest.fn(),
      adjustStock: jest.fn(),
      remove: jest.fn(),
    };

    beforeAll(async () => {
      app = await createE2EApp(
        [ProductsController],
        [{ provide: ProductsService, useValue: mockProductsService }],
        [
          { guard: JwtAuthGuard, useValue: mockAuthGuard({ id: 1, email: 'admin@pos.com', role: 'admin' }) },
          { guard: RolesGuard, useValue: { canActivate: () => true } },
        ],
      );
    });

    afterAll(async () => { await app.close(); });

    it('400 validation error — has success=false, statusCode, message, path', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({}) // missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/api/v1/products');
    });

    it('400 validation error — forbidNonWhitelisted strips unknown fields', async () => {
      mockProductsService.create.mockResolvedValue({} as any);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Test',
          barcode: '123',
          price: 1.0,
          stock: 10,
          categoryId: 1,
          unknownField: 'should be rejected',
        })
        .expect(400); // forbidNonWhitelisted: true
    });

    it('404 not found — has success=false, statusCode, path', async () => {
      mockProductsService.findByBarcode.mockRejectedValue(
        new NotFoundException('Product with barcode "NONEXISTENT" not found'),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/products/barcode/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.path).toBe('/api/v1/products/barcode/NONEXISTENT');
    });

    it('success response — has success=true, data, statusCode, timestamp', async () => {
      mockProductsService.findByBarcode.mockResolvedValue({
        id: 1, name: 'Coca Cola', barcode: '8850000010002', price: 1.5, stock: 100,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/products/barcode/8850000010002')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.barcode).toBe('8850000010002');
      expect(response.body.statusCode).toBe(200);
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
