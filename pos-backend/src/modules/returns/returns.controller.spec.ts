import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('ReturnsController (integration)', () => {
  let app: INestApplication;
  let returnsService: jest.Mocked<ReturnsService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockReturn = {
    id: 1,
    saleId: 1,
    total: 5,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResult = { data: [mockReturn], total: 1, page: 1, limit: 20 };

  beforeAll(async () => {
    returnsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ReturnsController],
      providers: [{ provide: ReturnsService, useValue: returnsService }],
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

  // ─── GET /api/v1/returns ────────────────────────────────────────────────
  describe('GET /api/v1/returns', () => {
    it('should return the standard flat envelope with total at the top level', async () => {
      returnsService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/returns')
        .expect(200);

      expect(returnsService.findAll).toHaveBeenCalledWith({});
      expect(response.body).toMatchObject({ success: true, statusCode: 200, total: 1 });
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toBeUndefined();
    });

    it('should pass search/sort/offset/max and status filter', async () => {
      returnsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/returns?search=damaged&status=approved&sortBy=total&sort=desc&offset=20&max=20')
        .expect(200);

      expect(returnsService.findAll).toHaveBeenCalledWith({
        search: 'damaged',
        status: 'approved',
        sortBy: 'total',
        sort: 'desc',
        offset: 20,
        max: 20,
      });
    });

    it('should reject invalid sort / offset / max / status', async () => {
      await request(app.getHttpServer()).get('/api/v1/returns?sort=sideways').expect(400);
      await request(app.getHttpServer()).get('/api/v1/returns?offset=-5').expect(400);
      await request(app.getHttpServer()).get('/api/v1/returns?max=200').expect(400);
      await request(app.getHttpServer()).get('/api/v1/returns?status=bogus').expect(400);
    });
  });
});
