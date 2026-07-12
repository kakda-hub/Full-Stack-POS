import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('ReportsController (integration)', () => {
  let app: INestApplication;
  let reportsService: jest.Mocked<ReportsService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockSummary = {
    totalSales: 100,
    totalRevenue: 5000.0,
    totalDiscount: 200.0,
    averageOrderValue: 50.0,
    lowStockProducts: [
      { id: 1, name: 'Milk', stock: 5, barcode: '8850000160004' },
    ],
  };

  const mockDailyRevenue = [
    { date: '2025-01-15', totalSales: 5, revenue: 150.0, totalDiscount: 10.0, totalTax: 15.0 },
  ];

  const mockTopProducts = [
    { productId: 1, productName: 'Coca Cola', barcode: '8850000010002', totalQuantitySold: 50, totalRevenue: 75.0 },
  ];

  const mockPaymentSummary = [
    { paymentMethod: 'cash', totalTransactions: 10, totalRevenue: 250.0 },
  ];

  const mockSalesByCashier = [
    { userId: 1, cashierName: 'Admin', totalSales: 50, totalRevenue: 3000.0 },
  ];

  beforeAll(async () => {
    reportsService = {
      getSummary: jest.fn(),
      getDailyRevenue: jest.fn(),
      getTopProducts: jest.fn(),
      getPaymentSummary: jest.fn(),
      getSalesByCashier: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: reportsService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
      .overrideGuard(RolesGuard).useValue(mockRolesGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        // forbidNonWhitelisted not used globally (conflicts with query params)
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /api/v1/reports/summary ────────────────────────────────────────
  describe('GET /api/v1/reports/summary', () => {
    it('should return dashboard summary', async () => {
      reportsService.getSummary.mockResolvedValue(mockSummary as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/summary')
        .expect(200);

      expect(reportsService.getSummary).toHaveBeenCalledWith({});
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSales).toBe(100);
      expect(response.body.data.lowStockProducts).toHaveLength(1);
    });

    it('should pass date range query parameters', async () => {
      reportsService.getSummary.mockResolvedValue(mockSummary as any);

      await request(app.getHttpServer())
        .get('/api/v1/reports/summary?from=2025-01-01&to=2025-01-31')
        .expect(200);

      expect(reportsService.getSummary).toHaveBeenCalledWith({
        from: '2025-01-01',
        to: '2025-01-31',
      });
    });
  });

  // ─── GET /api/v1/reports/daily-revenue ──────────────────────────────────
  describe('GET /api/v1/reports/daily-revenue', () => {
    it('should return daily revenue data', async () => {
      reportsService.getDailyRevenue.mockResolvedValue(mockDailyRevenue as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/daily-revenue')
        .expect(200);

      expect(reportsService.getDailyRevenue).toHaveBeenCalledWith({});
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].revenue).toBe(150.0);
    });

    it('should pass date range parameters', async () => {
      reportsService.getDailyRevenue.mockResolvedValue([] as any);

      await request(app.getHttpServer())
        .get('/api/v1/reports/daily-revenue?from=2025-01-01&to=2025-01-31')
        .expect(200);

      expect(reportsService.getDailyRevenue).toHaveBeenCalledWith({
        from: '2025-01-01',
        to: '2025-01-31',
      });
    });
  });

  // ─── GET /api/v1/reports/top-products ───────────────────────────────────
  describe('GET /api/v1/reports/top-products', () => {
    it('should return top products with default limit', async () => {
      reportsService.getTopProducts.mockResolvedValue(mockTopProducts as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/top-products')
        .expect(200);

      expect(reportsService.getTopProducts).toHaveBeenCalledWith({});
      expect(response.body.data[0].productName).toBe('Coca Cola');
    });

    it('should pass custom limit parameter', async () => {
      reportsService.getTopProducts.mockResolvedValue([] as any);

      await request(app.getHttpServer())
        .get('/api/v1/reports/top-products?limit=10')
        .expect(200);

      // Note: intersection type (TopProductsDto & DateRangeDto) doesn't auto-transform,
      // so limit stays as string from query params
      expect(reportsService.getTopProducts).toHaveBeenCalledWith({ limit: '10' });
    });
  });

  // ─── GET /api/v1/reports/payment-summary ────────────────────────────────
  describe('GET /api/v1/reports/payment-summary', () => {
    it('should return payment method summary', async () => {
      reportsService.getPaymentSummary.mockResolvedValue(mockPaymentSummary as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/payment-summary')
        .expect(200);

      expect(reportsService.getPaymentSummary).toHaveBeenCalledWith({});
      expect(response.body.data[0].paymentMethod).toBe('cash');
    });
  });

  // ─── GET /api/v1/reports/sales-by-cashier ──────────────────────────────
  describe('GET /api/v1/reports/sales-by-cashier', () => {
    it('should return sales grouped by cashier', async () => {
      reportsService.getSalesByCashier.mockResolvedValue(mockSalesByCashier as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/sales-by-cashier')
        .expect(200);

      expect(reportsService.getSalesByCashier).toHaveBeenCalledWith({});
      expect(response.body.data[0].cashierName).toBe('Admin');
    });
  });
});
