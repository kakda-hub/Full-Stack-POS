import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product, Customer])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
