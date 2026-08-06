import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('CustomersController (integration)', () => {
  let app: INestApplication;
  let customersService: jest.Mocked<CustomersService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockCustomer = {
    id: 1,
    name: 'Sokha',
    phone: '012345678',
    email: 'sokha@example.com',
    totalSpent: 25.0,
    totalPurchases: 3,
    loyaltyPoints: 120,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResult = {
    data: [mockCustomer],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeAll(async () => {
    customersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPhone: jest.fn(),
      findOrCreateByPhone: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addPoints: jest.fn(),
      redeemPoints: jest.fn(),
      recordPurchase: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: customersService },
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

  // ─── GET /api/v1/customers ─────────────────────────────────────────────
  describe('GET /api/v1/customers', () => {
    it('should return the standard flat envelope with total at the top level', async () => {
      customersService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/customers')
        .expect(200);

      expect(customersService.findAll).toHaveBeenCalledWith({});
      expect(response.body).toMatchObject({
        success: true,
        statusCode: 200,
        total: 1,
      });
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Sokha');
      expect(typeof response.body.timestamp).toBe('string');
      // No nested meta object, no page/limit leakage
      expect(response.body.meta).toBeUndefined();
      expect(response.body.page).toBeUndefined();
      expect(response.body.limit).toBeUndefined();
    });

    it('should pass search/sort/offset/max to the service', async () => {
      customersService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/customers?search=sok&sortBy=createdAt&sort=desc&offset=0&max=20')
        .expect(200);

      expect(customersService.findAll).toHaveBeenCalledWith({
        search: 'sok',
        sortBy: 'createdAt',
        sort: 'desc',
        offset: 0,
        max: 20,
      });
    });

    it('should reject an invalid sort direction', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers?sort=invalid')
        .expect(400);
    });

    it('should reject a negative offset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers?offset=-1')
        .expect(400);
    });

    it('should reject a max above 100', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers?max=1000')
        .expect(400);
    });
  });

  // ─── GET /api/v1/customers/phone/:phone ────────────────────────────────
  describe('GET /api/v1/customers/phone/:phone', () => {
    it('should find a customer by phone', async () => {
      customersService.findByPhone.mockResolvedValue(mockCustomer as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/customers/phone/012345678')
        .expect(200);

      expect(customersService.findByPhone).toHaveBeenCalledWith('012345678');
      expect(response.body.data.phone).toBe('012345678');
    });
  });
});
