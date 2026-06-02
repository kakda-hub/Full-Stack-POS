import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadCloudinaryService {
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
    return cloudinary.api.resources({ max_results: 100 });
  }

  async getResource(publicId: string): Promise<any> {
    return cloudinary.api.resource(publicId);
  }

  async renameResource(oldPublicId: string, newPublicId: string): Promise<any> {
    return cloudinary.uploader.rename(oldPublicId, newPublicId);
  }
}