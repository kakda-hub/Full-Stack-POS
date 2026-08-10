export interface SaleItemDisplay {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleDetail {
  id: number;
  date: Date;
  cashierName: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: SaleItemDisplay[];
}

export interface SaleDisplay {
  id: number;
  date: Date;
  cashierName: string;
  itemsCount: number;
  itemsList: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
