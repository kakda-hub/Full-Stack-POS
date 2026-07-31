import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { databaseConfig } from './config/database.config';
import { validateEnv } from './config/env.validation';
import { UploadDynamicModule } from './modules/upload-dynamic/upload-dynamic.module';
import appConfig from './config/app.config';
import { UploadCloudinaryModule } from './modules/upload-cloudinary/upload-cloudinary.module';
import { ManagementModule } from './modules/management/management.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { HealthModule } from './modules/health/health.module';
import { QuickPicksModule } from './modules/quick-picks/quick-picks.module';
import { CustomersModule } from './modules/customers/customers.module';
import { KhqrModule } from './modules/khqr/khqr.module';

@Module({
  imports: [
    // ─── Global Config ────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
      // Fail startup when required environment variables are missing.
      validate: validateEnv,
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
    QuickPicksModule,
    CustomersModule,
    KhqrModule,
    HealthModule,
  ],
})
export class AppModule {}
