import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('ProductsController (integration)', () => {
  let app: INestApplication;
  let productsService: jest.Mocked<ProductsService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockProduct = {
    id: 1,
    name: 'Coca Cola',
    nameKh: 'កូកាកូឡា',
    barcode: '8850000010002',
    price: 1.5,
    stock: 100,
    categoryId: 1,
    description: 'Carbonated soft drink',
    imgUrl: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: { id: 1, name: 'Beverages' },
  };

  const mockPaginatedResult = {
    data: [mockProduct],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeAll(async () => {
    productsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByBarcode: jest.fn(),
      update: jest.fn(),
      adjustStock: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: productsService },
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
        // forbidNonWhitelisted not used globally (conflicts with query params like includeInactive)
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

  // ─── POST /api/v1/products ──────────────────────────────────────────────
  describe('POST /api/v1/products', () => {
    it('should create a product (admin)', async () => {
      productsService.create.mockResolvedValue(mockProduct as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Coca Cola',
          nameKh: 'កូកាកូឡា',
          barcode: '8850000010002',
          price: 1.5,
          stock: 100,
          categoryId: 1,
        })
        .expect(201);

      expect(productsService.create).toHaveBeenCalledWith({
        name: 'Coca Cola',
        nameKh: 'កូកាកូឡា',
        barcode: '8850000010002',
        price: 1.5,
        stock: 100,
        categoryId: 1,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Coca Cola');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 with invalid price (negative)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Test',
          barcode: '123',
          price: -1,
          stock: 10,
          categoryId: 1,
        })
        .expect(400);
    });
  });

  // ─── GET /api/v1/products ───────────────────────────────────────────────
  describe('GET /api/v1/products', () => {
    it('should return the flat paginated envelope (no page/limit)', async () => {
      productsService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith({});
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(typeof response.body.timestamp).toBe('string');
      expect(response.body.page).toBeUndefined();
      expect(response.body.limit).toBeUndefined();
    });

    it('should pass includeInactive=true query param', async () => {
      productsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/products?includeInactive=true')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith({ includeInactive: 'true' });
    });

    it('should pass categoryId filter', async () => {
      productsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/products?categoryId=2')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith({ categoryId: 2 });
    });

    it('should pass offset/max pagination params', async () => {
      productsService.findAll.mockResolvedValue({ data: [], total: 0, page: 5, limit: 5 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/products?offset=20&max=5')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith({ offset: 20, max: 5 });
    });

    it('should pass search/sort params', async () => {
      productsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/products?search=coca&sortBy=name&sort=asc')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith({
        search: 'coca',
        sortBy: 'name',
        sort: 'asc',
      });
    });

    it('should reject an invalid sort direction', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?sort=invalid')
        .expect(400);
    });

    it('should reject a negative offset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?offset=-1')
        .expect(400);
    });

    it('should reject a max above 100', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?max=1000')
        .expect(400);
    });
  });

  // ─── GET /api/v1/products/barcode/:barcode ──────────────────────────────
  describe('GET /api/v1/products/barcode/:barcode', () => {
    it('should find a product by barcode', async () => {
      productsService.findByBarcode.mockResolvedValue(mockProduct as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/products/barcode/8850000010002')
        .expect(200);

      expect(productsService.findByBarcode).toHaveBeenCalledWith('8850000010002');
      expect(response.body.data.barcode).toBe('8850000010002');
    });
  });

  // ─── GET /api/v1/products/:id ───────────────────────────────────────────
  describe('GET /api/v1/products/:id', () => {
    it('should return a product by id', async () => {
      productsService.findOne.mockResolvedValue(mockProduct as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/products/1')
        .expect(200);

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/abc')
        .expect(400);
    });
  });

  // ─── PATCH /api/v1/products/:id ─────────────────────────────────────────
  describe('PATCH /api/v1/products/:id', () => {
    it('should update a product', async () => {
      productsService.update.mockResolvedValue({ ...mockProduct, name: 'Updated' } as any);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/products/1')
        .send({ name: 'Updated' })
        .expect(200);

      expect(productsService.update).toHaveBeenCalledWith(1, { name: 'Updated' });
      expect(response.body.data.name).toBe('Updated');
    });

    it('should strip extra fields (whitelist enabled)', async () => {
      productsService.update.mockResolvedValue({ ...mockProduct, name: 'Test' } as any);

      // forbidNonWhitelisted is not used here because it conflicts with query params
      // like includeInactive. Whitelist still strips unknown body fields.
      const response = await request(app.getHttpServer())
        .patch('/api/v1/products/1')
        .send({ name: 'Test', unknownField: 'should fail' })
        .expect(200);

      // unknownField should be stripped by whitelist
      expect(productsService.update).toHaveBeenCalledWith(1, { name: 'Test' });
    });
  });

  // ─── PATCH /api/v1/products/:id/stock ───────────────────────────────────
  describe('PATCH /api/v1/products/:id/stock', () => {
    it('should adjust stock with positive quantity', async () => {
      productsService.adjustStock.mockResolvedValue({ ...mockProduct, stock: 110 } as any);

      await request(app.getHttpServer())
        .patch('/api/v1/products/1/stock')
        .send({ quantity: 10 })
        .expect(200);

      expect(productsService.adjustStock).toHaveBeenCalledWith(1, { quantity: 10 });
    });

    it('should accept negative quantity for stock reduction', async () => {
      productsService.adjustStock.mockResolvedValue({ ...mockProduct, stock: 90 } as any);

      await request(app.getHttpServer())
        .patch('/api/v1/products/1/stock')
        .send({ quantity: -10 })
        .expect(200);

      expect(productsService.adjustStock).toHaveBeenCalledWith(1, { quantity: -10 });
    });

    it('should return 400 when quantity is missing', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/products/1/stock')
        .send({})
        .expect(400);
    });
  });

  // ─── DELETE /api/v1/products/:id ────────────────────────────────────────
  describe('DELETE /api/v1/products/:id', () => {
    it('should soft-delete a product', async () => {
      productsService.remove.mockResolvedValue({ message: 'Product #1 deactivated successfully' } as any);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/1')
        .expect(200);

      expect(productsService.remove).toHaveBeenCalledWith(1);
      expect(response.body.data.message).toContain('deactivated');
    });
  });
});
