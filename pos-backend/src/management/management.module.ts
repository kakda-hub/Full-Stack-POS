import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { ManagementPage } from './entities/management-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManagementPage])],
  controllers: [ManagementController],
  providers: [ManagementService],
})
export class ManagementModule {}
