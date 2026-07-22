import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: 1,
    name: 'Coca Cola',
    nameKh: 'កូកាកូឡា',
    barcode: '8850000010002',
    price: 1.5,
    costPrice: 0.8,
    stock: 100,
    lowStockThreshold: 10,
    expiryDate: null,
    categoryId: 1,
    description: 'Carbonated soft drink',
    imgUrl: null,
    isActive: true,
    createdAt: new Date(),
    category: { id: 1, name: 'Beverages', nameKh: 'ភេសជ្ជៈ', description: 'Drinks', imgUrl: null, products: [] } as Category,
    saleItems: [],
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      nameKh: 'ផលិតផលថ្មី',
      barcode: '9990000010000',
      price: 2.5,
      stock: 50,
      categoryId: 1,
    };

    it('should create a product successfully', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockProduct);
      repository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { barcode: createDto.barcode },
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException when barcode already exists', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { barcode: createDto.barcode },
      });
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated active products by default', async () => {
      const products = [mockProduct];
      repository.findAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          skip: 0,
          take: 10,
          order: { name: 'ASC' },
        }),
      );
      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should include inactive products when requested', async () => {
      repository.findAndCount.mockResolvedValue([[mockProduct], 1]);

      await service.findAll(true);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a product by id', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByBarcode ────────────────────────────────────────────────────────
  describe('findByBarcode', () => {
    it('should return a product by barcode', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findByBarcode('8850000010002');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { barcode: '8850000010002', isActive: true },
        relations: ['category'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when barcode not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByBarcode('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────
  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 3.0,
    };

    it('should update a product successfully', async () => {
      repository.findOne.mockResolvedValueOnce(mockProduct); // findOne
      repository.save.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category'],
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Product');
      expect(result.price).toBe(3.0);
    });

    it('should throw ConflictException when new barcode already in use', async () => {
      const dtoWithBarcode: UpdateProductDto = { barcode: 'existing-barcode' };
      repository.findOne.mockResolvedValueOnce(mockProduct); // findOne
      repository.findOne.mockResolvedValueOnce({ id: 2 } as Product); // barcode check

      await expect(service.update(1, dtoWithBarcode)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when product to update not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── adjustStock ──────────────────────────────────────────────────────────
  describe('adjustStock', () => {
    it('should increase stock with positive quantity', async () => {
      repository.findOne.mockResolvedValue(mockProduct);
      repository.save.mockResolvedValue({ ...mockProduct, stock: 110 });

      const result = await service.adjustStock(1, { quantity: 10 });

      expect(result.stock).toBe(110);
    });

    it('should decrease stock with negative quantity', async () => {
      const product = { ...mockProduct, stock: 50 };
      repository.findOne.mockResolvedValue(product);
      repository.save.mockResolvedValue({ ...product, stock: 40 });

      const result = await service.adjustStock(1, { quantity: -10 });

      expect(result.stock).toBe(40);
    });

    it('should throw BadRequestException when stock would go below 0', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      await expect(service.adjustStock(1, { quantity: -200 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.adjustStock(999, { quantity: 10 })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove (soft-delete) ─────────────────────────────────────────────────
  describe('remove', () => {
    it('should soft-delete a product by setting isActive to false', async () => {
      repository.findOne.mockResolvedValue(mockProduct);
      repository.save.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await service.remove(1);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.message).toContain('deactivated');
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
