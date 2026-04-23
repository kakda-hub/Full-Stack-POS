import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadCloudinaryService } from './upload-cloudinary/upload-cloudinary.service';
import { UploadCloudinaryController } from './upload-cloudinary/upload-cloudinary.controller';

@Module({
  controllers: [UploadCloudinaryController],
  providers: [CloudinaryProvider, UploadCloudinaryService],
  exports: [CloudinaryProvider, UploadCloudinaryService],
})
export class UploadCloudinaryModule {}

