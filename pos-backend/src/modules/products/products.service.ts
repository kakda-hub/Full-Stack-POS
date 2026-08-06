import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, paginateQuery, resolveSort } from '../../common/helpers/pagination.helper';

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

  async findAll(query: ProductListQueryDto = {}): Promise<PaginatedResult<Product>> {
    const baseWhere: FindOptionsWhere<Product> = {};
    if (query.includeInactive !== 'true') baseWhere.isActive = true;
    if (query.categoryId !== undefined) baseWhere.categoryId = query.categoryId;

    // Search matches name / nameKh / barcode (OR) combined with the base filters (AND)
    const search = query.search?.trim();
    let where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = baseWhere;
    if (search) {
      const like = Like(`%${search}%`);
      where = [
        { ...baseWhere, name: like },
        { ...baseWhere, nameKh: like },
        { ...baseWhere, barcode: like },
      ];
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['name', 'nameKh', 'barcode', 'price', 'stock', 'createdAt'],
      'name',
      'ASC',
    );

    return paginate(this.productRepository, query, {
      where,
      relations: ['category'],
      order: { [sortBy]: sortDirection },
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
  async getLowStock(query: LowStockQueryDto = {}): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (query.threshold !== undefined) {
      // Use a global threshold override
      queryBuilder.andWhere('product.stock <= :threshold', { threshold: query.threshold });
    } else {
      // Use each product's own low_stock_threshold
      queryBuilder.andWhere('product.stock <= product.low_stock_threshold');
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['name', 'price', 'stock', 'createdAt'],
      'stock',
      'ASC',
    );
    queryBuilder.orderBy(`product.${sortBy}`, sortDirection);

    return paginateQuery(queryBuilder, query);
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
