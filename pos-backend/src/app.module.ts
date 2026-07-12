import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { databaseConfig } from './config/database.config';
import { UploadDynamicModule } from './upload-dynamic/upload-dynamic.module';
import appConfig from './config/app.config';
import { UploadCloudinaryModule } from './upload-cloudinary/upload-cloudinary.module';
import { ManagementModule } from './management/management.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [
    // ─── Global Config ────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // ─── Database (TiDB Cloud via MySQL) ──────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => databaseConfig(configService),
      inject: [ConfigService],
    }),

    // ─── Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SalesModule,
    ReportsModule,
    UploadModule,
    UploadDynamicModule,
    UploadCloudinaryModule,
    ManagementModule,
    SuppliersModule,
    StockMovementsModule,
    PurchaseOrdersModule,
    ReturnsModule,
  ],
})
export class AppModule {}
