import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { User } from '../../users/entities/user.entity';
import { ReturnItem } from './return-item.entity';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_id' })
  saleId: number;

  @ManyToOne(() => Sale, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status: ReturnStatus;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'processed_by' })
  processedBy: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'processed_by' })
  processedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ReturnItem, (item) => item.returnEntity, { cascade: true })
  items: ReturnItem[];
}
