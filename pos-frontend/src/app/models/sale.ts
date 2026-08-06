export interface SaleItem {
  id: number;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  paymentMethod: string;
  createdAt: string;
  items: { id: number; quantity: number; price: number; product?: { id: number; name: string; barcode: string } }[];
  user?: { id: number; name: string; email: string };
}