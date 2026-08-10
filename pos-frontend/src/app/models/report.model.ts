export interface ReportSummary {
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  lowStockProducts: { id: number; name: string; stock: number; barcode: string }[];
}

export interface PaymentSummaryEntry {
  paymentMethod: string;
  totalTransactions: number;
  totalRevenue: number;
}

export interface DailyRevenueEntry {
  date: string;
  totalSales: number;
  revenue: number;
  totalDiscount: number;
  totalTax: number;
}

export interface TopProductEntry {
  productId: number;
  productName: string;
  barcode: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface SalesByCashierEntry {
  userId: number;
  cashierName: string;
  totalSales: number;
  totalRevenue: number;
}
