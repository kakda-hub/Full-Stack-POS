import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, StockMovementType } from './entities/stock-movement.entity';
import { StockMovementQueryDto } from './dto/stock-movement.dto';
import { paginateQuery } from '../../common/helpers/pagination.helper';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
  ) {}

  async record(movement: Partial<StockMovement>): Promise<StockMovement> {
    const record = this.movementRepository.create(movement);
    return this.movementRepository.save(record);
  }

  /** Get all products with any near-expiry stock movements */
  async findNearExpiryProducts(days: number = 30) {
    const nearExpiry = await this.findNearExpiry(days);
    // Deduplicate by product
    const productMap = new Map<number, any>();
    for (const movement of nearExpiry) {
      if (!productMap.has(movement.productId)) {
        productMap.set(movement.productId, {
          productId: movement.productId,
          productName: movement.product?.name || `#${movement.productId}`,
          barcode: movement.product?.barcode || '',
          quantity: movement.quantity,
          expiryDate: movement.expiryDate,
        });
      }
    }
    return Array.from(productMap.values());
  }

  async findAll(query: StockMovementQueryDto) {
    const qb = this.movementRepository
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.product', 'product')
      .leftJoinAndSelect('sm.performedByUser', 'user')
      .orderBy('sm.createdAt', 'DESC');

    if (query.productId) {
      qb.andWhere('sm.productId = :productId', { productId: query.productId });
    }
    if (query.type) {
      qb.andWhere('sm.type = :type', { type: query.type });
    }

    return paginateQuery(qb, { page: query.page, limit: query.limit });
  }

  async findByProduct(productId: number) {
    return this.movementRepository.find({
      where: { productId },
      relations: ['performedByUser', 'product'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Find stock movements with expiry dates that are near expiring
   * @param days Number of days from now to look ahead
   */
  async findNearExpiry(days: number = 30) {
    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.movementRepository
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.product', 'product')
      .leftJoinAndSelect('sm.performedByUser', 'user')
      .where('sm.expiryDate IS NOT NULL')
      .andWhere('sm.expiryDate >= :today', { today: today.toISOString().split('T')[0] })
      .andWhere('sm.expiryDate <= :future', { future: future.toISOString().split('T')[0] })
      .andWhere('sm.quantity > 0')
      .orderBy('sm.expiryDate', 'ASC')
      .getMany();
  }
}
