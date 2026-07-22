export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  token?: string;
  avatarUrl?: string;
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
  expiryDate?: string;
  description?: string;
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
  customerId?: number;
  customerName?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  loyaltyDiscount?: number;
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

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  totalPurchases: number;
  loyaltyPoints: number;
  pointsPerDollar: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuickPickItem {
  id: number;
  label: string;
  labelKh?: string;
  price: number;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplier?: Supplier;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  notes?: string;
  orderedBy: number;
  orderedByUser?: any;
  receivedBy?: number;
  receivedAt?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}
