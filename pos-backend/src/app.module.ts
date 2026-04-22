import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { databaseConfig } from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // ─── Database ────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [],
    }),

    // ─── Feature Modules ─────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SalesModule,
    ReportsModule,
  ],
})
export class AppModule {}
