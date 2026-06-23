import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    // ─── Config 
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // ─── Database 
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [],
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
  ],
})
export class AppModule { }
