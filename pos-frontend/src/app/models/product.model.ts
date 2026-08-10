export interface Product {
  id: string;
  name: string;
  nameKm?: string;
  price: number;
  costPrice?: number;
  barcode: string;
  category: string;
  stock: number;
  imgUrl?: string;
  imgUrls?: string[];
  lowStockThreshold?: number;
  expiryDate?: string;
  description?: string;
}
