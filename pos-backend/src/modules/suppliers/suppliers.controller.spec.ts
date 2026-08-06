import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('SuppliersController (integration)', () => {
  let app: INestApplication;
  let suppliersService: jest.Mocked<SuppliersService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockSupplier = {
    id: 1,
    name: 'ACME Distribution',
    phone: '023555123',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResult = { data: [mockSupplier], total: 1, page: 1, limit: 20 };

  beforeAll(async () => {
    suppliersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllInactive: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [{ provide: SuppliersService, useValue: suppliersService }],
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

  // ─── GET /api/v1/suppliers ──────────────────────────────────────────────
  describe('GET /api/v1/suppliers', () => {
    it('should return the standard flat envelope with total at the top level', async () => {
      suppliersService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/suppliers')
        .expect(200);

      expect(suppliersService.findAll).toHaveBeenCalledWith({});
      expect(response.body).toMatchObject({ success: true, statusCode: 200, total: 1 });
      expect(response.body.data).toHaveLength(1);
    });

    it('should route includeInactive=true to findAllInactive', async () => {
      suppliersService.findAllInactive.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/suppliers?includeInactive=true')
        .expect(200);

      expect(suppliersService.findAllInactive).toHaveBeenCalledWith({ includeInactive: 'true' });
      expect(suppliersService.findAll).not.toHaveBeenCalled();
    });

    it('should pass search/sort/offset/max', async () => {
      suppliersService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/suppliers?search=acme&sortBy=name&sort=asc&offset=0&max=20')
        .expect(200);

      expect(suppliersService.findAll).toHaveBeenCalledWith({
        search: 'acme',
        sortBy: 'name',
        sort: 'asc',
        offset: 0,
        max: 20,
      });
    });

    it('should reject invalid sort / offset / max', async () => {
      await request(app.getHttpServer()).get('/api/v1/suppliers?sort=sideways').expect(400);
      await request(app.getHttpServer()).get('/api/v1/suppliers?offset=-1').expect(400);
      await request(app.getHttpServer()).get('/api/v1/suppliers?max=1000').expect(400);
    });
  });
});
