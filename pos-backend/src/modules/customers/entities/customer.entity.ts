import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  /** Total amount spent across all purchases */
  @Column({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  /** Total number of purchases */
  @Column({ name: 'total_purchases', type: 'int', default: 0 })
  totalPurchases: number;

  /** Current loyalty points balance */
  @Column({ name: 'loyalty_points', type: 'int', default: 0 })
  loyaltyPoints: number;

  /** Points earned per dollar (e.g. 10 points per $1) */
  @Column({ name: 'points_per_dollar', type: 'int', default: 10 })
  pointsPerDollar: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
