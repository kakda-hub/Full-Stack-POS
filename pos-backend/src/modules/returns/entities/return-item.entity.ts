import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Return } from './return.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'return_id' })
  returnId: number;

  @ManyToOne(() => Return, (ret) => ret.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  returnEntity: Return;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Price at time of original sale

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;
}
