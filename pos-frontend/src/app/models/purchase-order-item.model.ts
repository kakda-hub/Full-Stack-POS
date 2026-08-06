import { Product } from './product.model';

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  total: number;
}
