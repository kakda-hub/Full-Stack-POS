export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  token?: string;
  profile?: string;
}

export interface Product {
  id: string;
  name: string;
  nameKm?: string;
  price: number;
  barcode: string;
  category: string;
  stock: number;
  imgUrl?: string;
  lowStockThreshold?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // percentage
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'aba' | 'card';
  cashReceived?: number;
  change?: number;
  cashier: string;
  timestamp: Date;
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: { product: Product; quantity: number }[];
  paymentBreakdown: { method: string; amount: number; count: number }[];
}

export interface Category {
  id: string;
  name: string;
  nameKm?: string;
  icon?: string;
}
