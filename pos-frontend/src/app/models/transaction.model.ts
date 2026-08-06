import { CartItem } from './cart-item.model';

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
