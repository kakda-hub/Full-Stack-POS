import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: UserRole.CASHIER,
    isActive: true,
    avatarUrl: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    sales: [],
  };

  // User object without password field — simulates TypeORM's .select() behavior
  const safeUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.CASHIER,
    isActive: true,
    avatarUrl: null,
    createdAt: mockUser.createdAt,
  } as const;

  const mockRepository = () => ({
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    const createDto: CreateUserDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: UserRole.CASHIER,
    };

    it('should create a user with hashed password', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated users without passwords (max=20, createdAt DESC)', async () => {
      const users = [mockUser];
      repository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          select: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl', 'createdAt'],
          order: { createdAt: 'DESC' },
          skip: 0,
          take: 20,
        }),
      );
      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
    });

    it('should filter by role and apply sort', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ role: 'cashier', sortBy: 'name', sort: 'asc' });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: 'cashier' },
          order: { name: 'ASC' },
        }),
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a user without password', async () => {
      // The actual implementation uses TypeORM .select() which excludes password.
      // We use safeUser to simulate the select behavior.
      repository.findOne.mockResolvedValue(safeUser as any);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl', 'createdAt'],
      });
      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByEmail ──────────────────────────────────────────────────────────
  describe('findByEmail', () => {
    it('should return user with password for auth', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────
  describe('update', () => {
    const updateDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should update a user successfully', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password');
    });

    it('should hash password when updating it', async () => {
      const dtoWithPassword: UpdateUserDto = { password: 'new-password' };
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.save.mockResolvedValue({ ...mockUser, password: 'hashed-password' });

      await service.update(1, dtoWithPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
    });

    it('should throw ConflictException when email is taken', async () => {
      const dtoWithEmail: UpdateUserDto = { email: 'taken@example.com' };
      repository.findOne.mockResolvedValueOnce(mockUser); // find existing user
      repository.findOne.mockResolvedValueOnce({ id: 2 } as User); // email check

      await expect(service.update(1, dtoWithEmail)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete a user successfully', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
      expect(result.message).toContain('deleted successfully');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── uploadAvatar ─────────────────────────────────────────────────────────
  describe('uploadAvatar', () => {
    it('should update avatar URL successfully', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue({
        ...mockUser,
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      const result = await service.uploadAvatar(1, 'https://example.com/avatar.jpg');

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ avatarUrl: 'https://example.com/avatar.jpg' }),
      );
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.uploadAvatar(999, 'https://example.com/avatar.jpg'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ─── Password reset helpers ───────────────────────────────────────────────
  describe('reset password helpers', () => {
    it('should save reset token', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.saveResetToken(1, 'token', new Date());

      expect(repository.update).toHaveBeenCalledWith(1, {
        resetToken: 'token',
        resetTokenExpiry: expect.any(Date),
      });
    });

    it('should find user by reset token', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByResetToken('token');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { resetToken: 'token' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should clear reset token and set new password', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.clearResetTokenAndSetPassword(1, 'new-hashed-password');

      expect(repository.update).toHaveBeenCalledWith(1, {
        password: 'new-hashed-password',
        resetToken: null,
        resetTokenExpiry: null,
      });
    });
  });
});
