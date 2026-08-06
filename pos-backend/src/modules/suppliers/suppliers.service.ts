import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { SupplierListQueryDto } from './dto/supplier-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: SupplierListQueryDto = {}): Promise<PaginatedResult<Supplier>> {
    return this.findWithWhere({ isActive: true }, query);
  }

  async findAllInactive(query: SupplierListQueryDto = {}): Promise<PaginatedResult<Supplier>> {
    return this.findWithWhere({}, query);
  }

  private findWithWhere(
    baseWhere: FindOptionsWhere<Supplier>,
    query: SupplierListQueryDto,
  ): Promise<PaginatedResult<Supplier>> {
    const search = query.search?.trim();
    let where: FindOptionsWhere<Supplier> | FindOptionsWhere<Supplier>[] = baseWhere;
    if (search) {
      const like = Like(`%${search}%`);
      where = [
        { ...baseWhere, name: like },
        { ...baseWhere, phone: like },
        { ...baseWhere, email: like },
        { ...baseWhere, contactPerson: like },
      ];
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['name', 'phone', 'email', 'contactPerson', 'createdAt'],
      'name',
      'ASC',
    );

    return paginate(this.supplierRepository, query, {
      where,
      order: { [sortBy]: sortDirection },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier #${id} not found`);
    }
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: number): Promise<{ message: string }> {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    await this.supplierRepository.save(supplier);
    return { message: `Supplier #${id} deactivated successfully` };
  }
}
