import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum StockMovementType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DAMAGED = 'damaged',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number; // positive = stock in, negative = stock out

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType: string; // e.g. 'sale', 'purchase_order', 'return'

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number; // ID of the sale, purchase order, or return

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number; // Snapshot of cost at time of movement

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // Snapshot of selling price at time of movement

  /** Expiry date of this batch (for perishable goods) */
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'performed_by' })
  performedBy: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'performed_by' })
  performedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
