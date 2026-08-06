import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('UsersController (integration)', () => {
  let app: INestApplication;
  let usersService: jest.Mocked<UsersService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'cashier',
    isActive: true,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResult = {
    data: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeAll(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      uploadAvatar: jest.fn(),
      saveResetToken: jest.fn(),
      findByResetToken: jest.fn(),
      clearResetTokenAndSetPassword: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
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

  // ─── POST /api/v1/users ─────────────────────────────────────────────────
  describe('POST /api/v1/users', () => {
    it('should create a user (admin only)', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'cashier',
        })
        .expect(201);

      expect(usersService.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'cashier',
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('john@example.com');
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ email: 'test@test.com', password: 'password123' })
        .expect(400);
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ name: 'Test', email: 'invalid', password: 'password123' })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ name: 'Test', email: 'test@test.com', password: '123' })
        .expect(400);
    });

    it('should strip extra fields via whitelist', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: 'password123',
          unknownField: 'should fail',
        })
        .expect(201);

      // unknownField should be stripped by whitelist
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  // ─── GET /api/v1/users ──────────────────────────────────────────────────
  describe('GET /api/v1/users', () => {
    it('should return paginated users with the flat envelope', async () => {
      usersService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      expect(usersService.findAll).toHaveBeenCalledWith({});
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });

    it('should pass offset/max pagination parameters', async () => {
      usersService.findAll.mockResolvedValue({ data: [], total: 0, page: 5, limit: 5 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/users?offset=5&max=5')
        .expect(200);

      expect(usersService.findAll).toHaveBeenCalledWith({
        offset: 5,
        max: 5,
      });
    });

    it('should pass the role filter', async () => {
      usersService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/users?role=cashier')
        .expect(200);

      expect(usersService.findAll).toHaveBeenCalledWith({ role: 'cashier' });
    });

    it('should reject a max above 100', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users?max=1000')
        .expect(400);
    });
  });

  // ─── GET /api/v1/users/:id ──────────────────────────────────────────────
  describe('GET /api/v1/users/:id', () => {
    it('should return a user by id', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/users/1')
        .expect(200);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/abc')
        .expect(400);
    });
  });

  // ─── PATCH /api/v1/users/:id ────────────────────────────────────────────
  describe('PATCH /api/v1/users/:id', () => {
    it('should update a user', async () => {
      usersService.update.mockResolvedValue({ ...mockUser, name: 'Updated Name' } as any);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/1')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(usersService.update).toHaveBeenCalledWith(1, { name: 'Updated Name' });
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should accept avatarUrl update', async () => {
      usersService.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: 'https://example.com/avatar.jpg',
      } as any);

      await request(app.getHttpServer())
        .patch('/api/v1/users/1')
        .send({ avatarUrl: 'https://example.com/avatar.jpg' })
        .expect(200);

      expect(usersService.update).toHaveBeenCalledWith(1, {
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });
  });

  // ─── DELETE /api/v1/users/:id ───────────────────────────────────────────
  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      usersService.remove.mockResolvedValue({ message: 'User #1 deleted successfully' } as any);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/users/1')
        .expect(200);

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(response.body.data.message).toContain('deleted successfully');
    });
  });
});
