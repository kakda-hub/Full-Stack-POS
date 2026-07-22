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
import { StockMovement, StockMovementType } from '../stock-movements/entities/stock-movement.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginateQuery } from '../../common/helpers/pagination.helper';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

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

      // ── Loyalty Points & Customer Logic ───────────────────────────────
      let customer: Customer | null = null;
      let loyaltyDiscount = 0;
      let pointsRedeemed = 0;
      let pointsEarned = 0;

      // Fetch customer once if customerId is provided
      if (dto.customerId) {
        customer = await queryRunner.manager.findOne(Customer, {
          where: { id: dto.customerId },
        });
      }

      // Handle points redemption
      if (customer && dto.pointsRedeemed && dto.pointsRedeemed > 0) {
        const POINTS_PER_DOLLAR = 100;
        const maxDiscount = Math.floor(dto.pointsRedeemed / POINTS_PER_DOLLAR);
        loyaltyDiscount = Math.min(maxDiscount, subtotal - discount);
        pointsRedeemed = loyaltyDiscount * POINTS_PER_DOLLAR;

        if (customer.loyaltyPoints < pointsRedeemed) {
          throw new BadRequestException(
            `Insufficient loyalty points. Available: ${customer.loyaltyPoints}, Required: ${pointsRedeemed}`,
          );
        }
      }

      const total = subtotal - discount - loyaltyDiscount + tax;

      if (total < 0) {
        throw new BadRequestException('Sale total cannot be negative');
      }

      // Award points and update customer stats
      if (customer) {
        if (pointsRedeemed > 0) {
          customer.loyaltyPoints -= pointsRedeemed;
        }
        pointsEarned = Math.floor(total * customer.pointsPerDollar);
        customer.loyaltyPoints += pointsEarned;
        customer.totalSpent = Number(customer.totalSpent) + total;
        customer.totalPurchases += 1;
        await queryRunner.manager.save(Customer, customer);
      }

      const sale = queryRunner.manager.create(Sale, {
        userId,
        customerId: dto.customerId || null,
        subtotal,
        discount,
        tax,
        total,
        pointsEarned,
        pointsRedeemed,
        loyaltyDiscount,
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

        // Record stock movement for inventory tracking
        const movement = this.movementRepository.create({
          productId: item.productId,
          quantity: -item.quantity,
          type: StockMovementType.SALE,
          referenceType: 'sale',
          referenceId: savedSale.id,
          costPrice: product.costPrice ?? 0,
          price: Number(product.price),
          performedBy: userId,
          note: `Sale #${savedSale.id}`,
        });
        await queryRunner.manager.save(StockMovement, movement);
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
        'product.costPrice',
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
        'product.costPrice',
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
