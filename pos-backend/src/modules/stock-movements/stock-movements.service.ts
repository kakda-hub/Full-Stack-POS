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
}
