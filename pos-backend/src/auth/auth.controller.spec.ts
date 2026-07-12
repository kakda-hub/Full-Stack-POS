import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
      return true;
    },
  };

  const loginResponse = {
    accessToken: 'mock-jwt-token',
    user: {
      id: 1,
      name: 'Admin',
      email: 'admin@pos.com',
      role: 'admin',
      avatarUrl: null,
    },
  };

  beforeAll(async () => {
    authService = {
      login: jest.fn(),
      getProfile: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
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

  // ─── POST /api/v1/auth/login ────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    it('should return JWT token on valid credentials', async () => {
      authService.login.mockResolvedValue(loginResponse as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@pos.com', password: 'admin123' })
        .expect(201);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@pos.com',
        password: 'admin123',
      });
      expect(response.body.accessToken).toBe('mock-jwt-token');
      // login endpoint has @SkipIntercept(), so response is raw
      expect(response.body.user.email).toBe('admin@pos.com');
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'admin123' })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@pos.com' })
        .expect(400);
    });

    it('should return 400 when email is invalid format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'admin123' })
        .expect(400);
    });
  });

  // ─── GET /api/v1/auth/profile ───────────────────────────────────────────
  describe('GET /api/v1/auth/profile', () => {
    it('should return the current user profile', async () => {
      const profileData = {
        id: 1,
        name: 'Admin',
        email: 'admin@pos.com',
        role: 'admin',
        avatarUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
      } as any;
      authService.getProfile.mockResolvedValue(profileData as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(200);

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@pos.com');
    });
  });

  // ─── POST /api/v1/auth/forgot-password ──────────────────────────────────
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send reset link for valid email', async () => {
      authService.forgotPassword.mockResolvedValue({
        message: 'If that email exists, a reset link has been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'admin@pos.com' })
        .expect(201);

      expect(authService.forgotPassword).toHaveBeenCalledWith('admin@pos.com');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({})
        .expect(400);
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid' })
        .expect(400);
    });
  });

  // ─── POST /api/v1/auth/reset-password ───────────────────────────────────
  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      authService.resetPassword.mockResolvedValue({
        message: 'Password has been successfully reset',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'newpassword123' })
        .expect(201);

      expect(authService.resetPassword).toHaveBeenCalledWith('valid-token', 'newpassword123');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when token is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ newPassword: 'newpassword123' })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'token', newPassword: '123' })
        .expect(400);
    });

    it('should return 400 when newPassword is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'token' })
        .expect(400);
    });
  });
});
