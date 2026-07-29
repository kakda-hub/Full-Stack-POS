import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, paginateQuery } from '../../common/helpers/pagination.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { barcode: dto.barcode },
    });
    if (existing) {
      throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
    }
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(includeInactive = false, pagination?: PaginationDto): Promise<PaginatedResult<Product>> {
    const where = includeInactive ? {} : { isActive: true };
    return paginate(this.productRepository, pagination ?? {}, {
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode, isActive: true },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with barcode "${barcode}" not found`);
    }
    return product;
  }

  /**
   * Get all products where stock is at or below their low-stock threshold.
   * Optionally override the threshold across all products via query param.
   */
  async getLowStock(threshold?: number, pagination?: PaginationDto): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (threshold !== undefined) {
      // Use a global threshold override
      queryBuilder.andWhere('product.stock <= :threshold', { threshold });
    } else {
      // Use each product's own low_stock_threshold
      queryBuilder.andWhere('product.stock <= product.low_stock_threshold');
    }

    queryBuilder.orderBy('product.stock', 'ASC');

    return paginateQuery(queryBuilder, pagination ?? {});
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.barcode && dto.barcode !== product.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: dto.barcode },
      });
      if (existing) {
        throw new ConflictException(`Barcode "${dto.barcode}" already in use`);
      }
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async adjustStock(id: number, dto: AdjustStockDto): Promise<Product> {
    const product = await this.findOne(id);
    const newStock = product.stock + dto.quantity;
    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot reduce stock below 0. Current stock: ${product.stock}`,
      );
    }
    product.stock = newStock;
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    // Soft-delete: deactivate instead of hard delete to preserve sale history
    product.isActive = false;
    await this.productRepository.save(product);
    return { message: `Product #${id} deactivated successfully` };
  }
}
