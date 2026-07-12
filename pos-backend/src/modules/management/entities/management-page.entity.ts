import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('management_pages')
export class ManagementPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ name: 'title_km', length: 150, nullable: true })
  titleKm: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ length: 20, default: 'page' })
  type: string; // 'menu' | 'page'

  @Column({ length: 255, nullable: true })
  url: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ nullable: true })
  badge: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number;

  @ManyToOne(() => ManagementPage, (page) => page.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: ManagementPage;

  @OneToMany(() => ManagementPage, (page) => page.parent)
  children: ManagementPage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
