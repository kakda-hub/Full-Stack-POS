import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as sharp from 'sharp';
import { FileUpload } from './entities/upload.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(FileUpload)
    private readonly uploadRepository: Repository<FileUpload>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      },
      forcePathStyle: true, // Required for Minio
    });
    this.bucketName = this.configService.get<string>('S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, user: string = 'admin'): Promise<FileUpload> {
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();
    const fileName = `${randomUUID()}.${fileExtension}`;

    // Generate date-based path: document/general/YYYY/MM/DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filePath = `document/general/${year}/${month}/${day}`;

    const fullPath = `${filePath}/${fileName}`;

    // Upload to S3/Minio
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fullPath,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      console.error('S3 Upload Error Details:', {
        message: error.message,
        code: error.code,
        endpoint: this.configService.get('S3_ENDPOINT'),
        bucket: this.bucketName,
      });
      throw error;
    }

    const baseUrl = this.configService.get<string>('S3_PUBLIC_URL') || this.configService.get<string>('S3_ENDPOINT');
    const fileUrl = `${baseUrl}/${this.bucketName}/${fullPath}`;

    let width = null;
    let height = null;

    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(file.buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (e) {
        console.error('Error getting image metadata:', e);
      }
    }

    // Save metadata to DB
    const fileUpload = this.uploadRepository.create({
      originalFileName: file.originalname,
      fileName: fileName,
      filePath: filePath,
      fileUrl: fileUrl,
      fileExtension: fileExtension,
      fileSize: file.size,
      uploadBy: user,
      destinationStorage: 'MINIO',
      width,
      height,
    });

    return this.uploadRepository.save(fileUpload);
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
