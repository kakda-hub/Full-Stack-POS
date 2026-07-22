import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { SaleItem } from "../../sales/entities/sale-item.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'name_kh', length: 150 })
  nameKh: string;

  @Column({ name: 'img_url', length: 255, nullable: true })
  imgUrl: string;

  @Column({ unique: true, length: 100 })
  barcode: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  /** Cost price (from supplier) for profit tracking */
  @Column({ name: "cost_price", type: "decimal", precision: 10, scale: 2, nullable: true })
  costPrice: number;

  /** Minimum stock threshold before triggering low-stock alerts */
  @Column({ name: "low_stock_threshold", type: "int", default: 10 })
  lowStockThreshold: number;

  /** Expiry date (for perishable goods) */
  @Column({ name: "expiry_date", type: "date", nullable: true })
  expiryDate: string;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ name: "category_id" })
  categoryId: number;

  @Column({ name: "description", nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => SaleItem, (item) => item.product)
  saleItems: SaleItem[];
}
