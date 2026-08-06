import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReturnDto } from './dto/return.dto';
import { ReturnListQueryDto } from './dto/return-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginateQuery, resolveSort } from '../../common/helpers/pagination.helper';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,
    @InjectRepository(ReturnItem)
    private readonly returnItemRepository: Repository<ReturnItem>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateReturnDto, userId: number): Promise<Return> {
    const sale = await this.saleRepository.findOne({
      where: { id: dto.saleId },
      relations: ['items', 'items.product'],
    });
    if (!sale) {
      throw new NotFoundException(`Sale #${dto.saleId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalRefund = 0;
      const returnItems: ReturnItem[] = [];

      for (const itemDto of dto.items) {
        const saleItem = sale.items.find(
          (si) => si.productId === itemDto.productId,
        );
        if (!saleItem) {
          throw new BadRequestException(
            `Product #${itemDto.productId} is not in the original sale`,
          );
        }

        const returnItem = this.returnItemRepository.create({
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          price: Number(saleItem.price),
          refundAmount: itemDto.refundAmount,
        });
        returnItems.push(returnItem);
        totalRefund += itemDto.refundAmount;

        // Restock product
        await queryRunner.manager.increment(
          Product,
          { id: itemDto.productId },
          'stock',
          itemDto.quantity,
        );
      }

      const returnEntity = this.returnRepository.create({
        saleId: dto.saleId,
        total: totalRefund,
        reason: dto.reason,
        processedBy: userId,
        status: ReturnStatus.APPROVED,
        items: returnItems,
      });

      const saved = await queryRunner.manager.save(Return, returnEntity);

      await queryRunner.commitTransaction();
      return this.findOne(saved.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: ReturnListQueryDto = {}): Promise<PaginatedResult<Return>> {
    const qb = this.returnRepository
      .createQueryBuilder('ret')
      .leftJoinAndSelect('ret.sale', 'sale')
      .leftJoinAndSelect('ret.processedByUser', 'user')
      .leftJoinAndSelect('ret.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Resource-specific filter: status
    if (query.status) {
      qb.andWhere('ret.status = :status', { status: query.status });
    }

    // Search matches the reason or the return id
    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(ret.reason LIKE :q OR CAST(ret.id AS CHAR) LIKE :q)', {
        q: `%${search}%`,
      });
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['createdAt', 'total', 'status'],
      'createdAt',
      'DESC',
    );
    qb.orderBy(`ret.${sortBy}`, sortDirection);

    return paginateQuery(qb, query);
  }

  async findOne(id: number): Promise<Return> {
    const ret = await this.returnRepository.findOne({
      where: { id },
      relations: ['sale', 'processedByUser', 'items', 'items.product'],
    });
    if (!ret) {
      throw new NotFoundException(`Return #${id} not found`);
    }
    return ret;
  }
}
