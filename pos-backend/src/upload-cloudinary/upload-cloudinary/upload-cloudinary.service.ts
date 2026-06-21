import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadCloudinaryService {
  private readonly logger = new Logger(UploadCloudinaryService.name);

  constructor() { }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'pos-general',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);

          resolve({
            originalFileName: file.originalname,
            fileName: `${result.public_id}.${result.format}`,
            filePath: result.folder,
            fileUrl: result.secure_url,
            fileExtension: result.format,
            fileSize: file.size,
            uploadBy: "admin",
            destinationStorage: "CLOUDINARY",
            width: result.width,
            height: result.height,
            id: result.asset_id,
            uploadType: "file-upload-type-general",
            isDeleted: false,
            uploadDate: new Date().toISOString(),
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async listResources(): Promise<any> {
    try {
      return await cloudinary.api.resources({ max_results: 100 });
    } catch (error) {
      this.logger.error('Failed to list Cloudinary resources', error);
      throw new HttpException(
        error?.error?.message || 'Cloudinary service unavailable',
        error?.error?.http_code || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getResource(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      this.logger.error(`Failed to get Cloudinary resource: ${publicId}`, error);
      throw new HttpException(
        error?.error?.message || 'Cloudinary service unavailable',
        error?.error?.http_code || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async renameResource(oldPublicId: string, newPublicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.rename(oldPublicId, newPublicId);
    } catch (error) {
      this.logger.error(`Failed to rename Cloudinary resource: ${oldPublicId}`, error);
      throw new HttpException(
        error?.error?.message || 'Cloudinary service unavailable',
        error?.error?.http_code || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async deleteResource(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Failed to delete Cloudinary resource: ${publicId}`, error);
      throw new HttpException(
        error?.error?.message || 'Cloudinary service unavailable',
        error?.error?.http_code || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}