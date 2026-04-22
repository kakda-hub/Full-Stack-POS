import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto, TopProductsDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DAILY REVENUE  –  SUM(total) + COUNT(id) grouped by date
  // ─────────────────────────────────────────────────────────────────────────────
  async getDailyRevenue(query: DateRangeDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('DATE(sale.created_at)', 'date')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'revenue')
      .addSelect('SUM(sale.discount)', 'totalDiscount')
      .addSelect('SUM(sale.tax)', 'totalTax')
      .from('sales', 'sale');

    if (query.from) {
      qb.andWhere('sale.created_at >= :from', {
        from: `${query.from} 00:00:00`,
      });
    }
    if (query.to) {
      qb.andWhere('sale.created_at <= :to', {
        to: `${query.to} 23:59:59`,
      });
    }

    const rows = await qb
      .groupBy('DATE(sale.created_at)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      totalSales: parseInt(r.totalSales, 10),
      revenue: parseFloat(r.revenue ?? '0'),
      totalDiscount: parseFloat(r.totalDiscount ?? '0'),
      totalTax: parseFloat(r.totalTax ?? '0'),
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOP PRODUCTS  –  SUM(quantity) per product, ordered DESC, limited
  // ─────────────────────────────────────────────────────────────────────────────
  async getTopProducts(query: TopProductsDto & DateRangeDto) {
    const limit = query.limit ?? 5;

    const qb = this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.barcode', 'barcode')
      .addSelect('SUM(si.quantity)', 'totalQuantitySold')
      .addSelect('SUM(si.quantity * si.price)', 'totalRevenue')
      .from('sale_items', 'si')
      .innerJoin('products', 'p', 'p.id = si.product_id')
      .innerJoin('sales', 's', 's.id = si.sale_id');

    if (query.from) {
      qb.andWhere('s.created_at >= :from', { from: `${query.from} 00:00:00` });
    }
    if (query.to) {
      qb.andWhere('s.created_at <= :to', { to: `${query.to} 23:59:59` });
    }

    const rows = await qb
      .groupBy('p.id')
      .orderBy('totalQuantitySold', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      barcode: r.barcode,
      totalQuantitySold: parseInt(r.totalQuantitySold, 10),
      totalRevenue: parseFloat(r.totalRevenue ?? '0'),
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYMENT SUMMARY  –  SUM(total) grouped by payment_method
  // ─────────────────────────────────────────────────────────────────────────────
  async getPaymentSummary(query: DateRangeDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('sale.payment_method', 'paymentMethod')
      .addSelect('COUNT(sale.id)', 'totalTransactions')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .from('sales', 'sale');

    if (query.from) {
      qb.andWhere('sale.created_at >= :from', {
        from: `${query.from} 00:00:00`,
      });
    }
    if (query.to) {
      qb.andWhere('sale.created_at <= :to', {
        to: `${query.to} 23:59:59`,
      });
    }

    const rows = await qb
      .groupBy('sale.payment_method')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      paymentMethod: r.paymentMethod,
      totalTransactions: parseInt(r.totalTransactions, 10),
      totalRevenue: parseFloat(r.totalRevenue ?? '0'),
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY DASHBOARD  –  Single overview card
  // ─────────────────────────────────────────────────────────────────────────────
  async getSummary(query: DateRangeDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .addSelect('SUM(sale.discount)', 'totalDiscount')
      .addSelect('AVG(sale.total)', 'averageOrderValue')
      .from('sales', 'sale');

    if (query.from) {
      qb.andWhere('sale.created_at >= :from', {
        from: `${query.from} 00:00:00`,
      });
    }
    if (query.to) {
      qb.andWhere('sale.created_at <= :to', {
        to: `${query.to} 23:59:59`,
      });
    }

    const [summary] = await qb.getRawMany();

    // Low-stock products (stock <= 10)
    const lowStockProducts = await this.dataSource
      .createQueryBuilder()
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('p.stock', 'stock')
      .addSelect('p.barcode', 'barcode')
      .from('products', 'p')
      .where('p.stock <= 10')
      .andWhere('p.is_active = 1')
      .orderBy('p.stock', 'ASC')
      .getRawMany();

    return {
      totalSales: parseInt(summary?.totalSales ?? '0', 10),
      totalRevenue: parseFloat(summary?.totalRevenue ?? '0'),
      totalDiscount: parseFloat(summary?.totalDiscount ?? '0'),
      averageOrderValue: parseFloat(summary?.averageOrderValue ?? '0'),
      lowStockProducts,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES BY CASHIER
  // ─────────────────────────────────────────────────────────────────────────────
  async getSalesByCashier(query: DateRangeDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('u.id', 'userId')
      .addSelect('u.name', 'cashierName')
      .addSelect('COUNT(s.id)', 'totalSales')
      .addSelect('SUM(s.total)', 'totalRevenue')
      .from('sales', 's')
      .innerJoin('users', 'u', 'u.id = s.user_id');

    if (query.from) {
      qb.andWhere('s.created_at >= :from', { from: `${query.from} 00:00:00` });
    }
    if (query.to) {
      qb.andWhere('s.created_at <= :to', { to: `${query.to} 23:59:59` });
    }

    const rows = await qb
      .groupBy('u.id')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      userId: r.userId,
      cashierName: r.cashierName,
      totalSales: parseInt(r.totalSales, 10),
      totalRevenue: parseFloat(r.totalRevenue ?? '0'),
    }));
  }
}
