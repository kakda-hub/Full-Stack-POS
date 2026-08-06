import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashed,
    });

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async findAll(query: UserListQueryDto = {}): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const baseWhere: FindOptionsWhere<User> = {};
    if (query.role) baseWhere.role = query.role as UserRole;

    const search = query.search?.trim();
    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = baseWhere;
    if (search) {
      const like = Like(`%${search}%`);
      where = [
        { ...baseWhere, name: like },
        { ...baseWhere, email: like },
      ];
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['name', 'email', 'role', 'createdAt'],
      'createdAt',
      'DESC',
    );

    return paginate(this.userRepository, query, {
      where,
      select: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl', 'createdAt'],
      order: { [sortBy]: sortDirection },
    });
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  // Internal: find by email WITH password (for auth)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    // Check email uniqueness if email is being changed
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    await this.userRepository.remove(user);
    return { message: `User #${id} deleted successfully` };
  }

  async uploadAvatar(id: number, avatarUrl: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    user.avatarUrl = avatarUrl;
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  // ---- Forgot Password Helpers ----

  async saveResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await this.userRepository.update(userId, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetToken: token },
    });
  }

  async clearResetTokenAndSetPassword(userId: number, hashedNewPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedNewPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }
}
