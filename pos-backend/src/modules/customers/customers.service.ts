import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Customer } from './entities/customer.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  AddPointsDto,
  RedeemPointsDto,
} from './dto/customer.dto';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException(`Customer with phone "${dto.phone}" already exists`);
    }
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAll(query: ListQueryDto = {}): Promise<PaginatedResult<Customer>> {
    const baseWhere: FindOptionsWhere<Customer> = { isActive: true };

    const search = query.search?.trim();
    let where: FindOptionsWhere<Customer> | FindOptionsWhere<Customer>[] = baseWhere;
    if (search) {
      const like = Like(`%${search}%`);
      where = [
        { ...baseWhere, name: like },
        { ...baseWhere, phone: like },
        { ...baseWhere, email: like },
      ];
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['name', 'phone', 'email', 'totalSpent', 'totalPurchases', 'loyaltyPoints', 'createdAt'],
      'name',
      'ASC',
    );

    return paginate(this.customerRepository, query, {
      where,
      order: { [sortBy]: sortDirection },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async findByPhone(phone: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { phone, isActive: true },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with phone "${phone}" not found`);
    }
    return customer;
  }

  async findOrCreateByPhone(phone: string, name?: string): Promise<Customer> {
    // Try to find existing customer
    const existing = await this.customerRepository.findOne({
      where: { phone },
    });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.customerRepository.save(existing);
      }
      return existing;
    }
    // Create new customer
    return this.create({
      phone,
      name: name || `Customer ${phone}`,
    });
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (dto.phone && dto.phone !== customer.phone) {
      const existing = await this.customerRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existing) {
        throw new ConflictException(`Phone "${dto.phone}" already in use`);
      }
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    customer.isActive = false;
    await this.customerRepository.save(customer);
    return { message: `Customer #${id} deactivated successfully` };
  }

  /**
   * Add loyalty points to a customer's account
   */
  async addPoints(id: number, dto: AddPointsDto): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.loyaltyPoints += dto.points;
    return this.customerRepository.save(customer);
  }

  /**
   * Redeem loyalty points (returns the dollar value redeemed)
   */
  async redeemPoints(id: number, dto: RedeemPointsDto): Promise<{ customer: Customer; discountValue: number }> {
    const customer = await this.findOne(id);

    if (customer.loyaltyPoints < dto.points) {
      throw new BadRequestException(`Insufficient points. Available: ${customer.loyaltyPoints}, Requested: ${dto.points}`);
    }

    // 100 points = $1 discount
    const POINTS_PER_DOLLAR = 100;
    const discountValue = Math.floor(dto.points / POINTS_PER_DOLLAR) * 1.0;

    if (discountValue <= 0) {
      throw new BadRequestException(`Minimum 100 points required to redeem. You have ${customer.loyaltyPoints} points.`);
    }

    const pointsToDeduct = discountValue * POINTS_PER_DOLLAR;
    customer.loyaltyPoints -= pointsToDeduct;
    const saved = await this.customerRepository.save(customer);

    return { customer: saved, discountValue };
  }

  /**
   * Record a purchase: add to totalSpent/totalPurchases and award points
   */
  async recordPurchase(id: number, amount: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.totalSpent = Number(customer.totalSpent) + amount;
    customer.totalPurchases += 1;
    customer.loyaltyPoints += Math.floor(amount * customer.pointsPerDollar);
    return this.customerRepository.save(customer);
  }
}
