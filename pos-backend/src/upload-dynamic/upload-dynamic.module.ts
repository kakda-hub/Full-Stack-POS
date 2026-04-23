import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadDynamicController } from './upload-dynamic.controller';
import { UploadDynamicService } from './upload-dynamic.service';
import { FileUpload } from '../upload/entities/upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload])],
  controllers: [UploadDynamicController],
  providers: [UploadDynamicService],
  exports: [UploadDynamicService],
})
export class UploadDynamicModule {}
