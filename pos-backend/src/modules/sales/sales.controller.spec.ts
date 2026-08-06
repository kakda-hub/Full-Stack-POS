import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('SalesController (integration)', () => {
  let app: INestApplication;
  let salesService: jest.Mocked<SalesService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 2, email: 'cashier@pos.com', role: 'cashier' };
      return true;
    },
  };

  const mockSale = {
    id: 1,
    userId: 2,
    subtotal: 3.0,
    discount: 0,
    tax: 0,
    total: 3.0,
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 1,
        saleId: 1,
        productId: 1,
        quantity: 2,
        price: 1.5,
        product: { id: 1, name: 'Coca Cola', barcode: '8850000010002' },
      },
    ],
    user: { id: 2, name: 'Cashier', email: 'cashier@pos.com' },
  };

  const mockPaginatedResult = {
    data: [mockSale],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeAll(async () => {
    salesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        { provide: SalesService, useValue: salesService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
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

  // ─── POST /api/v1/sales ─────────────────────────────────────────────────
  describe('POST /api/v1/sales', () => {
    it('should create a sale with cashier user ID', async () => {
      salesService.create.mockResolvedValue(mockSale as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          items: [{ productId: 1, quantity: 2 }],
          paymentMethod: 'cash',
        })
        .expect(201);

      // The CurrentUser decorator should extract 'id' (2) from request.user
      expect(salesService.create).toHaveBeenCalledWith(
        {
          items: [{ productId: 1, quantity: 2 }],
          paymentMethod: 'cash',
        },
        2, // userId from CurrentUser('id')
      );
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(3.0);
    });

    it('should create a sale with optional fields (discount, tax, aba payment)', async () => {
      salesService.create.mockResolvedValue({
        ...mockSale,
        discount: 0.5,
        tax: 0.25,
        paymentMethod: 'aba',
        total: 2.75,
      } as any);

      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          items: [{ productId: 1, quantity: 2 }],
          discount: 0.5,
          tax: 0.25,
          paymentMethod: 'aba',
        })
        .expect(201);

      expect(salesService.create).toHaveBeenCalledWith(
        {
          items: [{ productId: 1, quantity: 2 }],
          discount: 0.5,
          tax: 0.25,
          paymentMethod: 'aba',
        },
        2,
      );
    });

    it('should return 400 when items array is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({ items: [] })
        .expect(400);
    });

    it('should return 400 when items are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({})
        .expect(400);
    });

    it('should return 400 when productId is not a positive integer', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({ items: [{ productId: -1, quantity: 2 }] })
        .expect(400);
    });

    it('should return 400 when quantity is less than 1', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({ items: [{ productId: 1, quantity: 0 }] })
        .expect(400);
    });
  });

  // ─── GET /api/v1/sales ──────────────────────────────────────────────────
  describe('GET /api/v1/sales', () => {
    it('should return paginated sales for cashier (filtered by userId)', async () => {
      salesService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/sales')
        .expect(200);

      expect(salesService.findAll).toHaveBeenCalledWith(
        2, // userId from CurrentUser('id')
        'cashier', // role from CurrentUser('role')
        {},
      );
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });

    it('should pass offset/max pagination parameters', async () => {
      salesService.findAll.mockResolvedValue({ data: [], total: 0, page: 5, limit: 5 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/sales?offset=20&max=5')
        .expect(200);

      expect(salesService.findAll).toHaveBeenCalledWith(
        2,
        'cashier',
        { offset: 20, max: 5 },
      );
    });

    it('should pass the paymentMethod filter', async () => {
      salesService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/sales?paymentMethod=aba')
        .expect(200);

      expect(salesService.findAll).toHaveBeenCalledWith(
        2,
        'cashier',
        { paymentMethod: 'aba' },
      );
    });
  });

  // ─── GET /api/v1/sales/:id ──────────────────────────────────────────────
  describe('GET /api/v1/sales/:id', () => {
    it('should return a sale by id', async () => {
      salesService.findOne.mockResolvedValue(mockSale as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/sales/1')
        .expect(200);

      expect(salesService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/sales/abc')
        .expect(400);
    });
  });
});
