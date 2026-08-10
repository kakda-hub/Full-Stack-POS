export interface CreateSaleItemDto {
  productId: number;
  quantity: number;
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  discount?: number;
  tax?: number;
  paymentMethod?: 'cash' | 'aba' | 'card';
  customerId?: number;
  pointsRedeemed?: number;
}
