import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/entities/user.entity';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-random-bytes'),
  }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hashed-token'),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: UserRole.ADMIN,
    isActive: true,
    avatarUrl: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    sales: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            saveResetToken: jest.fn(),
            findByResetToken: jest.fn(),
            clearResetTokenAndSetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── login ────────────────────────────────────────────────────────────────
  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access token and user on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'john@example.com',
        role: 'admin',
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          avatarUrl: null,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when account is deactivated', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── getProfile ───────────────────────────────────────────────────────────
  describe('getProfile', () => {
    it('should return user profile by id', async () => {
      const safeUser = { ...mockUser };
      delete (safeUser as any).password;
      usersService.findOne.mockResolvedValue(safeUser as any);

      const result = await service.getProfile(1);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(safeUser);
    });
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('should generate token and return success message', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await service.forgotPassword('john@example.com');

      expect(usersService.saveResetToken).toHaveBeenCalledWith(
        1,
        'mock-hashed-token',
        expect.any(Date),
      );
      expect(result.message).toContain('reset link');
      consoleSpy.mockRestore();
    });

    it('should return success even if email not found (prevent enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('reset link');
    });
  });

  // ─── resetPassword ────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      usersService.findByResetToken.mockResolvedValue({
        ...mockUser,
        resetToken: 'mock-hashed-token',
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour in future
      });

      const result = await service.resetPassword('token', 'new-password');

      expect(usersService.clearResetTokenAndSetPassword).toHaveBeenCalledWith(
        1,
        'hashed-password',
      );
      expect(result.message).toContain('successfully reset');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'new-password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      usersService.findByResetToken.mockResolvedValue({
        ...mockUser,
        resetToken: 'token',
        resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour in past
      });

      await expect(service.resetPassword('expired-token', 'new-password'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
