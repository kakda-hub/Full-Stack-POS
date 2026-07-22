import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { Customer } from '../customers/entities/customer.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { CreateSaleDto, SaleItemDto } from './dto/create-sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let saleRepository: jest.Mocked<Repository<Sale>>;
  let saleItemRepository: jest.Mocked<Repository<SaleItem>>;
  let productRepository: jest.Mocked<Repository<Product>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      decrement: jest.fn(),
    },
  };

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
    category: null as any,
    saleItems: [],
  };

  const mockSale: Sale = {
    id: 1,
    userId: 1,
    user: null as any,
    subtotal: 3.0,
    discount: 0,
    tax: 0,
    total: 3.0,
    paymentMethod: PaymentMethod.CASH,
    customerId: null,
    pointsEarned: 0,
    pointsRedeemed: 0,
    loyaltyDiscount: 0,
    createdAt: new Date(),
    items: [],
  };

  const mockSaleWithItems: Sale = {
    ...mockSale,
    items: [
      {
        id: 1,
        saleId: 1,
        sale: null as any,
        productId: 1,
        product: mockProduct,
        quantity: 2,
        price: 1.5,
      },
    ],
  };

  beforeEach(async () => {
    // Reset mocks
    mockQueryRunner.connect.mockReset();
    mockQueryRunner.startTransaction.mockReset();
    mockQueryRunner.commitTransaction.mockReset();
    mockQueryRunner.rollbackTransaction.mockReset();
    mockQueryRunner.release.mockReset();
    mockQueryRunner.manager.findOne.mockReset();
    mockQueryRunner.manager.create.mockReset();
    mockQueryRunner.manager.save.mockReset();
    mockQueryRunner.manager.decrement.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SaleItem),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {},
        },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: {
            create: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {},
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleRepository = module.get(getRepositoryToken(Sale));
    productRepository = module.get(getRepositoryToken(Product));
    dataSource = module.get(getDataSourceToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    const createDto: CreateSaleDto = {
      items: [{ productId: 1, quantity: 2 }],
      discount: 0,
      tax: 0,
      paymentMethod: PaymentMethod.CASH,
    };

    it('should create a sale with stock deduction', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);
      mockQueryRunner.manager.create.mockReturnValue(mockSale);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockSale) // save sale
        .mockResolvedValueOnce({ id: 1, saleId: 1, productId: 1, quantity: 2, price: 1.5 }) // save sale item
        .mockResolvedValueOnce(undefined) // decrement
        .mockResolvedValueOnce({ id: 1, productId: 1, quantity: -2, type: 'sale' }); // save stock movement

      // Mock findOne for the return call (service.findOne is called after commit)
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSaleWithItems);

      const result = await service.create(createDto, 1);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(
        Product,
        expect.objectContaining({
          where: { id: 1, isActive: true },
        }),
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        Sale,
        expect.objectContaining({
          userId: 1,
          subtotal: 3.0,
          total: 3.0,
        }),
      );
      expect(mockQueryRunner.manager.decrement).toHaveBeenCalledWith(
        Product,
        { id: 1 },
        'stock',
        2,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockSaleWithItems);

      jest.restoreAllMocks();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      mockQueryRunner.manager.findOne.mockResolvedValue(lowStockProduct);

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when total is negative', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);
      mockQueryRunner.manager.create.mockReturnValue(mockSale);

      const negativeDto: CreateSaleDto = {
        items: [{ productId: 1, quantity: 1 }],
        discount: 100,
        tax: 0,
        paymentMethod: PaymentMethod.CASH,
      };

      await expect(service.create(negativeDto, 1)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated sales for admin', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockSaleWithItems], 1]),
      };
      saleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(1, 'admin');

      expect(result.data).toEqual([mockSaleWithItems]);
      expect(result.total).toBe(1);
      // Admin should NOT have the where clause for userId
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should filter by userId for cashiers', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      saleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll(2, 'cashier');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'sale.userId = :userId',
        { userId: 2 },
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a sale by id', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockSaleWithItems),
      };
      saleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSaleWithItems);
    });

    it('should throw NotFoundException when sale not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      saleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
