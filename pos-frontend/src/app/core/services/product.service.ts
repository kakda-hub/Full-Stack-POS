import { Injectable, signal, computed } from '@angular/core';
import { Product, Category } from '../models';

const MOCK_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', nameKm: 'ទាំងអស់' },
  { id: 'beverages', name: 'Beverages', nameKm: 'ភេសជ្ជៈ' },
  { id: 'food', name: 'Food', nameKm: 'អាហារ' },
  { id: 'snacks', name: 'Snacks', nameKm: 'អាហារសម្រន់' },
  { id: 'dairy', name: 'Dairy', nameKm: 'ផលិតផលទឹកដោះ' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca-Cola 330ml', nameKm: 'កូកា-កូឡា ៣៣០មល', price: 1.25, barcode: '5000112637922', category: 'beverages', stock: 150, lowStockThreshold: 20 },
  { id: '2', name: 'Water 500ml', nameKm: 'ទឹក ៥០០មល', price: 0.50, barcode: '8992388011027', category: 'beverages', stock: 200, lowStockThreshold: 30 },
  { id: '3', name: 'Green Tea', nameKm: 'តែបៃតង', price: 1.00, barcode: '4902102072144', category: 'beverages', stock: 80, lowStockThreshold: 15 },
  { id: '4', name: 'Orange Juice', nameKm: 'ទឹកក្រូច', price: 1.75, barcode: '5449000131805', category: 'beverages', stock: 60, lowStockThreshold: 10 },
  { id: '5', name: 'Fried Rice', nameKm: 'បាយឆា', price: 3.50, barcode: 'FOOD001', category: 'food', stock: 50, lowStockThreshold: 5 },
  { id: '6', name: 'Noodle Soup', nameKm: 'គុយទាវ', price: 3.00, barcode: 'FOOD002', category: 'food', stock: 40, lowStockThreshold: 5 },
  { id: '7', name: 'Spring Rolls', nameKm: 'នំបញ្ចុក', price: 2.00, barcode: 'FOOD003', category: 'food', stock: 30, lowStockThreshold: 5 },
  { id: '8', name: 'Lay\'s Chips', nameKm: 'ស្ករលីស', price: 0.75, barcode: '4800888116019', category: 'snacks', stock: 120, lowStockThreshold: 20 },
  { id: '9', name: 'Oreo Cookies', nameKm: 'ខូគីអូរ៉េអូ', price: 1.50, barcode: '7622210449283', category: 'snacks', stock: 90, lowStockThreshold: 15 },
  { id: '10', name: 'Pringles', nameKm: 'ប្រីងហ្គល', price: 2.25, barcode: '038000845260', category: 'snacks', stock: 8, lowStockThreshold: 10 },
  { id: '11', name: 'Fresh Milk 1L', nameKm: 'ទឹកដោះគោ ១លីត្រ', price: 2.50, barcode: '4902201000039', category: 'dairy', stock: 5, lowStockThreshold: 10 },
  { id: '12', name: 'Yogurt Strawberry', nameKm: 'យ៉ោហ្គឺ', price: 1.25, barcode: '3057640385775', category: 'dairy', stock: 45, lowStockThreshold: 10 },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _products = signal<Product[]>(MOCK_PRODUCTS);
  private _categories = signal<Category[]>(MOCK_CATEGORIES);
  private _searchQuery = signal<string>('');
  private _selectedCategory = signal<string>('all');

  products = this._products.asReadonly();
  categories = this._categories.asReadonly();
  searchQuery = this._searchQuery.asReadonly();
  selectedCategory = this._selectedCategory.asReadonly();

  filteredProducts = computed(() => {
    let result = this._products();
    if (this._selectedCategory() !== 'all') {
      result = result.filter(p => p.category === this._selectedCategory());
    }
    const q = this._searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.nameKm || '').includes(q)
      );
    }
    return result;
  });

  lowStockProducts = computed(() =>
    this._products().filter(p => p.stock <= (p.lowStockThreshold || 10))
  );

  setSearch(query: string): void { this._searchQuery.set(query); }
  setCategory(id: string): void { this._selectedCategory.set(id); }

  findByBarcode(barcode: string): Product | undefined {
    return this._products().find(p => p.barcode === barcode);
  }

  addProduct(product: Omit<Product, 'id'>): void {
    const id = Date.now().toString();
    this._products.update(p => [...p, { ...product, id }]);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this._products.update(p => p.map(prod => prod.id === id ? { ...prod, ...updates } : prod));
  }

  deleteProduct(id: string): void {
    this._products.update(p => p.filter(prod => prod.id !== id));
  }

  reduceStock(id: string, qty: number): void {
    this._products.update(p => p.map(prod =>
      prod.id === id ? { ...prod, stock: Math.max(0, prod.stock - qty) } : prod
    ));
  }
}
