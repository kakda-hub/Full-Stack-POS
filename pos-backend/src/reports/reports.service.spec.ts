import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let dataSource: jest.Mocked<DataSource>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockDataSource = () => ({
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  });

  beforeEach(async () => {
    // Reset all mocks on the shared mockQueryBuilder
    Object.values(mockQueryBuilder).forEach((mockFn) => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockReset();
      }
    });
    // Re-chain mockReturnThis after reset
    Object.keys(mockQueryBuilder).forEach((key) => {
      if (key !== 'getRawMany' && key !== 'getRawOne' && jest.isMockFunction(mockQueryBuilder[key])) {
        mockQueryBuilder[key].mockReturnThis();
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getDataSourceToken(),
          useFactory: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    dataSource = module.get(getDataSourceToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getDailyRevenue ──────────────────────────────────────────────────────
  describe('getDailyRevenue', () => {
    it('should return daily revenue data', async () => {
      const mockRaw = [
        { date: '2025-01-15', totalSales: '5', revenue: '150.00', totalDiscount: '10.00', totalTax: '15.00' },
        { date: '2025-01-14', totalSales: '3', revenue: '90.00', totalDiscount: '5.00', totalTax: '9.00' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRaw);

      const result = await service.getDailyRevenue({});

      expect(dataSource.createQueryBuilder).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2025-01-15',
        totalSales: 5,
        revenue: 150.0,
        totalDiscount: 10.0,
        totalTax: 15.0,
      });
    });

    it('should apply date range filters', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getDailyRevenue({ from: '2025-01-01', to: '2025-01-31' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  // ─── getTopProducts ───────────────────────────────────────────────────────
  describe('getTopProducts', () => {
    it('should return top products with default limit of 5', async () => {
      const mockRaw = [
        { productId: 1, productName: 'Coca Cola', barcode: '8850000010002', totalQuantitySold: '50', totalRevenue: '75.00' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRaw);

      const result = await service.getTopProducts({});

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        productId: 1,
        productName: 'Coca Cola',
        barcode: '8850000010002',
        costPrice: 0,
        totalQuantitySold: 50,
        totalRevenue: 75.0,
        totalProfit: 0,
        profitMargin: 0,
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it('should apply custom limit', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getTopProducts({ limit: 10 });

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });

  // ─── getPaymentSummary ───────────────────────────────────────────────────
  describe('getPaymentSummary', () => {
    it('should return payment method summary', async () => {
      const mockRaw = [
        { paymentMethod: 'cash', totalTransactions: '10', totalRevenue: '250.00' },
        { paymentMethod: 'aba', totalTransactions: '5', totalRevenue: '150.00' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRaw);

      const result = await service.getPaymentSummary({});

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        paymentMethod: 'cash',
        totalTransactions: 10,
        totalRevenue: 250.0,
      });
    });
  });

  // ─── getSummary ───────────────────────────────────────────────────────────
  describe('getSummary', () => {
    it('should return dashboard summary with low stock products', async () => {
      // First call: getRawMany for summary (called once)
      // Second call: getRawMany for low stock products (called again)
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { totalSales: '100', totalRevenue: '5000.00', totalDiscount: '200.00', averageOrderValue: '50.00' },
        ]);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ totalCost: '3000.00' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { id: 1, name: 'Milk', stock: 5, barcode: '8850000160004', costPrice: '1.20' },
      ]);

      const result = await service.getSummary({});

      expect(result).toEqual({
        totalSales: 100,
        totalRevenue: 5000.0,
        totalDiscount: 200.0,
        averageOrderValue: 50.0,
        grossProfit: 2000.0,
        grossMargin: 40.0,
        lowStockProducts: [
          { id: 1, name: 'Milk', stock: 5, barcode: '8850000160004', costPrice: '1.20' },
        ],
      });
    });

    it('should handle empty data', async () => {
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{}]);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ totalCost: '0' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      const result = await service.getSummary({});

      expect(result.totalSales).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.grossProfit).toBe(0);
      expect(result.grossMargin).toBe(0);
      expect(result.lowStockProducts).toEqual([]);
    });
  });

  // ─── getSalesByCashier ──────────────────────────────────────────────────
  describe('getSalesByCashier', () => {
    it('should return sales grouped by cashier', async () => {
      const mockRaw = [
        { userId: 1, cashierName: 'Admin', totalSales: '50', totalRevenue: '3000.00' },
        { userId: 2, cashierName: 'Cashier', totalSales: '30', totalRevenue: '1500.00' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRaw);

      const result = await service.getSalesByCashier({});

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: 1,
        cashierName: 'Admin',
        totalSales: 50,
        totalRevenue: 3000.0,
      });
    });

    it('should apply date range filters', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getSalesByCashier({ from: '2025-01-01', to: '2025-01-31' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });
});
