import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Return, ReturnItem, Sale, SaleItem, Product, StockMovement]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
