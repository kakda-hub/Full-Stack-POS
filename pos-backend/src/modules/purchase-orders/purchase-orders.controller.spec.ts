import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('PurchaseOrdersController (integration)', () => {
  let app: INestApplication;
  let poService: jest.Mocked<PurchaseOrdersService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockPO = {
    id: 1,
    orderNumber: 'PO-001',
    supplierId: 1,
    status: 'ordered',
    total: 50,
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResult = { data: [mockPO], total: 1, page: 1, limit: 20 };

  beforeAll(async () => {
    poService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      receive: jest.fn(),
      cancel: jest.fn(),
      getPendingCount: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [{ provide: PurchaseOrdersService, useValue: poService }],
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

  // ─── GET /api/v1/purchase-orders ────────────────────────────────────────
  describe('GET /api/v1/purchase-orders', () => {
    it('should return the standard flat envelope with total at the top level', async () => {
      poService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/purchase-orders')
        .expect(200);

      expect(poService.findAll).toHaveBeenCalledWith({});
      expect(response.body).toMatchObject({ success: true, statusCode: 200, total: 1 });
      expect(response.body.data).toHaveLength(1);
      expect(response.body.page).toBeUndefined();
      expect(response.body.limit).toBeUndefined();
    });

    it('should pass search/sort/offset/max and status filter', async () => {
      poService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/purchase-orders?search=PO-001&status=ordered&sortBy=total&sort=asc&offset=10&max=10')
        .expect(200);

      expect(poService.findAll).toHaveBeenCalledWith({
        search: 'PO-001',
        status: 'ordered',
        sortBy: 'total',
        sort: 'asc',
        offset: 10,
        max: 10,
      });
    });

    it('should reject invalid sort / offset / max', async () => {
      await request(app.getHttpServer()).get('/api/v1/purchase-orders?sort=sideways').expect(400);
      await request(app.getHttpServer()).get('/api/v1/purchase-orders?offset=-1').expect(400);
      await request(app.getHttpServer()).get('/api/v1/purchase-orders?max=1000').expect(400);
      await request(app.getHttpServer()).get('/api/v1/purchase-orders?status=bogus').expect(400);
    });
  });
});
