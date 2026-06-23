import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { paginateQuery } from '../common/helpers/pagination.helper';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto, userId: number): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productMap = new Map<number, Product>();

      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, isActive: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `Product #${item.productId} not found or inactive`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". ` +
              `Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        productMap.set(item.productId, product);
      }

      let subtotal = 0;
      for (const item of dto.items) {
        const product = productMap.get(item.productId);
        subtotal += Number(product.price) * item.quantity;
      }

      const discount = dto.discount ?? 0;
      const tax = dto.tax ?? 0;
      const total = subtotal - discount + tax;

      if (total < 0) {
        throw new BadRequestException('Sale total cannot be negative');
      }

      const sale = queryRunner.manager.create(Sale, {
        userId,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
      });

      const savedSale = await queryRunner.manager.save(Sale, sale);

      for (const item of dto.items) {
        const product = productMap.get(item.productId);

        const saleItem = queryRunner.manager.create(SaleItem, {
          saleId: savedSale.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        await queryRunner.manager.save(SaleItem, saleItem);

        await queryRunner.manager.decrement(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedSale.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: number, role?: string, pagination?: PaginationDto): Promise<PaginatedResult<Sale>> {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.user', 'user')
      .select([
        'sale',
        'items',
        'product.id',
        'product.name',
        'product.barcode',
        'user.id',
        'user.name',
        'user.email',
      ])
      .orderBy('sale.createdAt', 'DESC');

    // Cashiers can only see their own sales
    if (role === 'cashier') {
      queryBuilder.where('sale.userId = :userId', { userId });
    }

    return paginateQuery(queryBuilder, pagination ?? {});
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.user', 'user')
      .select([
        'sale',
        'items',
        'product.id',
        'product.name',
        'product.barcode',
        'user.id',
        'user.name',
      ])
      .where('sale.id = :id', { id })
      .getOne();

    if (!sale) {
      throw new NotFoundException(`Sale #${id} not found`);
    }
    return sale;
  }
}
