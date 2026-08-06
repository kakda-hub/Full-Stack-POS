import { Product } from './product.model';

export interface DailySummary {
  date: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: { product: Product; quantity: number }[];
  paymentBreakdown: { method: string; amount: number; count: number }[];
}
