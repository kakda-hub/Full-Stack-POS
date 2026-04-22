import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
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
}
