import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { QuickPicksController } from './quick-picks.controller';
import { QuickPicksService } from './quick-picks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('QuickPicksController (integration)', () => {
  let app: INestApplication;
  let quickPicksService: jest.Mocked<QuickPicksService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockItem = {
    id: 1,
    label: 'Coca Cola 1.5L',
    labelKh: 'កូកា ១.៥លីត្រ',
    price: 1.5,
    sortOrder: 1,
    isActive: true,
  };

  const mockPaginatedResult = { data: [mockItem], total: 1, page: 1, limit: 20 };

  beforeAll(async () => {
    quickPicksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [QuickPicksController],
      providers: [{ provide: QuickPicksService, useValue: quickPicksService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
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

  // ─── GET /api/v1/quick-picks ────────────────────────────────────────────
  describe('GET /api/v1/quick-picks', () => {
    it('should return the standard flat envelope with total at the top level', async () => {
      quickPicksService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/quick-picks')
        .expect(200);

      expect(quickPicksService.findAll).toHaveBeenCalledWith({});
      expect(response.body).toMatchObject({ success: true, statusCode: 200, total: 1 });
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].label).toBe('Coca Cola 1.5L');
    });

    it('should pass includeInactive, search and sort params', async () => {
      quickPicksService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/quick-picks?includeInactive=true&search=cola&sortBy=price&sort=desc')
        .expect(200);

      expect(quickPicksService.findAll).toHaveBeenCalledWith({
        includeInactive: 'true',
        search: 'cola',
        sortBy: 'price',
        sort: 'desc',
      });
    });

    it('should reject invalid sort / offset / max', async () => {
      await request(app.getHttpServer()).get('/api/v1/quick-picks?sort=sideways').expect(400);
      await request(app.getHttpServer()).get('/api/v1/quick-picks?offset=-1').expect(400);
      await request(app.getHttpServer()).get('/api/v1/quick-picks?max=1000').expect(400);
    });
  });
});
