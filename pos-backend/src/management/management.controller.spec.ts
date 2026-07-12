import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('ManagementController (integration)', () => {
  let app: INestApplication;
  let managementService: jest.Mocked<ManagementService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockPage = {
    id: 1,
    title: 'POS Sale',
    titleKm: 'លក់',
    icon: 'sale',
    type: 'page',
    url: '/sales',
    description: null,
    permissions: null,
    badge: null,
    sortOrder: 0,
    isActive: true,
    parentId: null,
    children: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPages = [
    mockPage,
    {
      ...mockPage,
      id: 2,
      title: 'Sales History',
      icon: 'history',
      url: '/sales-history',
      sortOrder: 1,
    },
  ];

  beforeAll(async () => {
    managementService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        { provide: ManagementService, useValue: managementService },
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

  // ─── POST /api/v1/management-pages ──────────────────────────────────────
  describe('POST /api/v1/management-pages', () => {
    it('should create a management page', async () => {
      managementService.create.mockResolvedValue(mockPage as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/management-pages')
        .send({
          title: 'POS Sale',
          titleKm: 'លក់',
          icon: 'sale',
          type: 'page',
          url: '/sales',
        })
        .expect(201);

      expect(managementService.create).toHaveBeenCalledWith({
        title: 'POS Sale',
        titleKm: 'លក់',
        icon: 'sale',
        type: 'page',
        url: '/sales',
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('POS Sale');
    });

    it('should return 400 when title is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/management-pages')
        .send({})
        .expect(400);
    });

    it('should create with parentId for nesting', async () => {
      managementService.create.mockResolvedValue({
        ...mockPage,
        id: 9,
        title: 'Sub Page',
        parentId: 8,
      } as any);

      await request(app.getHttpServer())
        .post('/api/v1/management-pages')
        .send({
          title: 'Sub Page',
          parentId: 8,
        })
        .expect(201);

      expect(managementService.create).toHaveBeenCalledWith({
        title: 'Sub Page',
        parentId: 8,
      });
    });
  });

  // ─── GET /api/v1/management-pages ───────────────────────────────────────
  describe('GET /api/v1/management-pages', () => {
    it('should return all active management pages with children', async () => {
      managementService.findAll.mockResolvedValue(mockPages as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/management-pages')
        .expect(200);

      expect(managementService.findAll).toHaveBeenCalled();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('POS Sale');
    });
  });

  // ─── GET /api/v1/management-pages/:id ──────────────────────────────────
  describe('GET /api/v1/management-pages/:id', () => {
    it('should return a page by id', async () => {
      managementService.findOne.mockResolvedValue(mockPage as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/management-pages/1')
        .expect(200);

      expect(managementService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.data.title).toBe('POS Sale');
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/management-pages/abc')
        .expect(400);
    });
  });

  // ─── PATCH /api/v1/management-pages/:id ─────────────────────────────────
  describe('PATCH /api/v1/management-pages/:id', () => {
    it('should update a page', async () => {
      managementService.update.mockResolvedValue({ ...mockPage, title: 'Updated' } as any);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/management-pages/1')
        .send({ title: 'Updated' })
        .expect(200);

      expect(managementService.update).toHaveBeenCalledWith(1, { title: 'Updated' });
      expect(response.body.data.title).toBe('Updated');
    });

    it('should update sortOrder', async () => {
      managementService.update.mockResolvedValue({ ...mockPage, sortOrder: 5 } as any);

      await request(app.getHttpServer())
        .patch('/api/v1/management-pages/1')
        .send({ sortOrder: 5 })
        .expect(200);

      expect(managementService.update).toHaveBeenCalledWith(1, { sortOrder: 5 });
    });

    it('should update isActive', async () => {
      managementService.update.mockResolvedValue({ ...mockPage, isActive: false } as any);

      await request(app.getHttpServer())
        .patch('/api/v1/management-pages/1')
        .send({ isActive: false })
        .expect(200);

      expect(managementService.update).toHaveBeenCalledWith(1, { isActive: false });
    });
  });

  // ─── DELETE /api/v1/management-pages/:id ────────────────────────────────
  describe('DELETE /api/v1/management-pages/:id', () => {
    it('should delete a page', async () => {
      managementService.remove.mockResolvedValue({ message: 'ManagementPage #1 deleted successfully' } as any);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/management-pages/1')
        .expect(200);

      expect(managementService.remove).toHaveBeenCalledWith(1);
      expect(response.body.data.message).toContain('deleted successfully');
    });
  });
});
