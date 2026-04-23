import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileUpload } from './entities/upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
