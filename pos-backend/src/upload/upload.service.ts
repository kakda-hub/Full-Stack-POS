import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/upload.entity';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly uploadRepository: Repository<FileUpload>,
  ) {}

  async uploadFile(file: Express.Multer.File, user: string = 'admin'): Promise<FileUpload> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'pos-general',
          resource_type: 'auto'
        },
        async (error, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary Upload Error Details:', error);
            return reject(error);
          }

          // Save metadata to DB
          const fileUpload = this.uploadRepository.create({
            originalFileName: file.originalname,
            fileName: `${result.public_id}.${result.format}`,
            filePath: result.folder,
            fileUrl: result.secure_url,
            fileExtension: result.format,
            fileSize: file.size,
            uploadBy: user,
            destinationStorage: 'CLOUDINARY',
            width: result.width,
            height: result.height,
          });

          try {
            const savedFile = await this.uploadRepository.save(fileUpload);
            resolve(savedFile);
          } catch (dbError) {
            console.error('Database Save Error:', dbError);
            reject(dbError);
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  formatResponse(file: FileUpload) {
    return {
      PID: null,
      data: [
        {
          isDeleted: file.isDeleted,
          height: file.height,
          fileExtension: file.fileExtension,
          width: file.width,
          originalFileName: file.originalFileName,
          uploadBy: file.uploadBy,
          filePath: file.filePath,
          fileName: file.fileName,
          destinationStorage: file.destinationStorage,
          uploadType: file.uploadType,
          fileUrl: file.fileUrl,
          fileSize: Number(file.fileSize),
          description: file.description,
          uploadDate: file.uploadDate,
          groupID: file.groupID,
          imageSize: {},
          id: file.id,
        },
      ],
      error: null,
      message: 'File have been upload successfully.',
      statusCode: '1',
      total: null,
    };
  }
}
