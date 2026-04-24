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

  @Column({ length: 150 })
  nameKh: string;

  @Column({ length: 255, nullable: true })
  imgUrl: string;

  @Column({ unique: true, length: 100 })
  barcode: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ name: "category_id" })
  categoryId: number;

  @Column({ name: "description" })
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
