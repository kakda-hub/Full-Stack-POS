import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('CategoriesController (integration)', () => {
  let app: INestApplication;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockCategory = {
    id: 1,
    name: 'Beverages',
    nameKh: 'ភេសជ្ជៈ',
    description: 'Drinks and beverages',
    imgUrl: null,
  };

  const mockPaginatedResult = {
    data: [mockCategory],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeAll(async () => {
    categoriesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: categoriesService },
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

  // ─── POST /api/v1/categories ────────────────────────────────────────────
  describe('POST /api/v1/categories', () => {
    it('should create a category (admin)', async () => {
      categoriesService.create.mockResolvedValue(mockCategory as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'Beverages',
          nameKh: 'ភេសជ្ជៈ',
          description: 'Drinks and beverages',
        })
        .expect(201);

      expect(categoriesService.create).toHaveBeenCalledWith({
        name: 'Beverages',
        nameKh: 'ភេសជ្ជៈ',
        description: 'Drinks and beverages',
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Beverages');
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({})
        .expect(400);
    });
  });

  // ─── GET /api/v1/categories ─────────────────────────────────────────────
  describe('GET /api/v1/categories', () => {
    it('should return paginated categories', async () => {
      categoriesService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(categoriesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should pass pagination parameters', async () => {
      categoriesService.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 5 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/categories?page=2&limit=5')
        .expect(200);

      expect(categoriesService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });
  });

  // ─── GET /api/v1/categories/:id ─────────────────────────────────────────
  describe('GET /api/v1/categories/:id', () => {
    it('should return a category by id', async () => {
      categoriesService.findOne.mockResolvedValue(mockCategory as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories/1')
        .expect(200);

      expect(categoriesService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.data.name).toBe('Beverages');
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/categories/abc')
        .expect(400);
    });
  });

  // ─── PATCH /api/v1/categories/:id ──────────────────────────────────────
  describe('PATCH /api/v1/categories/:id', () => {
    it('should update a category', async () => {
      categoriesService.update.mockResolvedValue({ ...mockCategory, name: 'Updated' } as any);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/categories/1')
        .send({ name: 'Updated' })
        .expect(200);

      expect(categoriesService.update).toHaveBeenCalledWith(1, { name: 'Updated' });
      expect(response.body.data.name).toBe('Updated');
    });
  });

  // ─── DELETE /api/v1/categories/:id ──────────────────────────────────────
  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete a category', async () => {
      categoriesService.remove.mockResolvedValue({ message: 'Category #1 deleted successfully' } as any);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/categories/1')
        .expect(200);

      expect(categoriesService.remove).toHaveBeenCalledWith(1);
      expect(response.body.data.message).toContain('deleted successfully');
    });
  });
});
