import { Supplier } from './supplier.model';
import { PurchaseOrderItem } from './purchase-order-item.model';

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
