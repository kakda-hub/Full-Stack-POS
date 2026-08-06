import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Not, In } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreatePurchaseOrderDto, ReceivePurchaseOrderDto } from './dto/purchase-order.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginateQuery } from '../../common/helpers/pagination.helper';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePurchaseOrderDto, userId: number): Promise<PurchaseOrder> {
    // Validate all products exist
    for (const item of dto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product #${item.productId} not found`);
      }
    }

    let subtotal = 0;
    const items = dto.items.map((item) => {
      const total = item.quantity * item.unitCost;
      subtotal += total;
      return this.poItemRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total,
      });
    });

    const discount = dto.discount ?? 0;
    const shippingCost = dto.shippingCost ?? 0;
    const total = subtotal - discount + shippingCost;

    const po = this.poRepository.create({
      orderNumber: dto.orderNumber,
      supplierId: dto.supplierId,
      items,
      subtotal,
      discount,
      shippingCost,
      total,
      notes: dto.notes,
      orderedBy: userId,
      status: PurchaseOrderStatus.ORDERED,
    });

    return this.poRepository.save(po);
  }

  async getPendingCount(): Promise<number> {
    return this.poRepository.count({
      where: {
        status: Not(In([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED])),
      },
    });
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<PurchaseOrder>> {
    const qb = this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.orderedByUser', 'user')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('po.createdAt', 'DESC');

    return paginateQuery(qb, pagination ?? {});
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id },
      relations: ['supplier', 'orderedByUser', 'items', 'items.product'],
    });
    if (!po) {
      throw new NotFoundException(`PurchaseOrder #${id} not found`);
    }
    return po;
  }

  async receive(id: number, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findOne(id);

    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Purchase order has already been fully received');
    }
    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive a cancelled purchase order');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update stock and cost price for each item
      for (const item of po.items) {
        const newReceived = item.receivedQuantity + item.quantity;
        item.receivedQuantity = newReceived;

        // Update product stock
        await queryRunner.manager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );

        // Update cost price if the product doesn't have one or the PO has a better price
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (product && (!product.costPrice || item.unitCost < product.costPrice)) {
          await queryRunner.manager.update(Product, item.productId, {
            costPrice: item.unitCost,
          });
        }
      }

      po.status = PurchaseOrderStatus.RECEIVED;
      po.receivedBy = dto.receivedBy;
      po.receivedAt = new Date();
      if (dto.notes) po.notes = dto.notes;
      await queryRunner.manager.save(PurchaseOrder, po);

      await queryRunner.commitTransaction();
      return this.findOne(po.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: number): Promise<PurchaseOrder> {
    const po = await this.findOne(id);

    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel a received purchase order');
    }

    po.status = PurchaseOrderStatus.CANCELLED;
    return this.poRepository.save(po);
  }
}
