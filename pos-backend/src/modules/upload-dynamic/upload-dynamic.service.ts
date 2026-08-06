import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { FileUpload } from '../upload/entities/upload.entity';
import { UploadListQueryDto } from '../upload/dto/upload-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';

@Injectable()
export class UploadDynamicService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(FileUpload)
    private readonly uploadRepository: Repository<FileUpload>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      },
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      forcePathStyle: true,
    });
    this.bucketName = this.configService.get<string>('S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, customPath?: string, uploadBy: string = 'admin') {
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();
    const fileName = `${randomUUID()}.${fileExtension}`;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePath = `${year}/${month}/${day}`;

    const filePath = customPath ? `${customPath}/${datePath}` : `uploads/${datePath}`;
    const fullKey = `${filePath}/${fileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const baseUrl = this.configService.get<string>('S3_PUBLIC_URL') || this.configService.get<string>('S3_ENDPOINT');
      const fileUrl = `${baseUrl}/${this.bucketName}/${fullKey}`;

      const fileUpload = this.uploadRepository.create({
        originalFileName: file.originalname,
        fileName: fileName,
        filePath: filePath,
        fileUrl: fileUrl,
        fileExtension: fileExtension,
        fileSize: file.size,
        uploadBy: uploadBy,
        destinationStorage: 'S3',
      });

      return await this.uploadRepository.save(fileUpload);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  /**
   * Server-side paginated list of uploaded file records.
   * Search matches originalFileName / fileName / fileUrl (case-insensitive).
   */
  async findAll(query?: UploadListQueryDto): Promise<PaginatedResult<FileUpload>> {
    const q = query?.search?.trim().toLowerCase();
    const base: FindOptionsWhere<FileUpload> = { isDeleted: false };
    if (query?.destinationStorage) {
      base.destinationStorage = query.destinationStorage;
    }

    const where: FindOptionsWhere<FileUpload>[] = q
      ? [
          { ...base, originalFileName: Like(`%${q}%`) },
          { ...base, fileName: Like(`%${q}%`) },
          { ...base, fileUrl: Like(`%${q}%`) },
        ]
      : [base];

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['uploadDate', 'originalFileName', 'fileName', 'fileSize', 'id'],
      'uploadDate',
      'DESC',
    );

    return paginate(this.uploadRepository, query, {
      where,
      order: { [sortBy]: sortDirection },
    });
  }

  async findOne(id: number) {
    const file = await this.uploadRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async remove(id: number) {
    const file = await this.findOne(id);

    // 1. Delete from S3
    const fullKey = `${file.filePath}/${file.fileName}`;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
        }),
      );
    } catch (error) {
      console.error('Error deleting from S3:', error);
      // We might want to continue even if S3 delete fails, or throw error
    }

    // 2. Soft delete from DB (or hard delete if preferred)
    file.isDeleted = true;
    return await this.uploadRepository.save(file);
    // Alternatively: return await this.uploadRepository.remove(file);
  }

  async update(id: number, file?: Express.Multer.File, updateData?: any) {
    const existingFile = await this.findOne(id);

    if (file) {
      // 1. Delete old file from S3
      const oldKey = `${existingFile.filePath}/${existingFile.fileName}`;
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: oldKey,
          }),
        );
      } catch (error) {
        console.error('Error deleting old file from S3 during update:', error);
      }

      // 2. Upload new file to S3
      const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();
      const fileName = `${randomUUID()}.${fileExtension}`;
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const filePath = updateData.path ? `${updateData.path}/${datePath}` : existingFile.filePath;
      const fullKey = `${filePath}/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const baseUrl = this.configService.get<string>('S3_PUBLIC_URL') || this.configService.get<string>('S3_ENDPOINT');
      const fileUrl = `${baseUrl}/${this.bucketName}/${fullKey}`;

      existingFile.originalFileName = file.originalname;
      existingFile.fileName = fileName;
      existingFile.filePath = filePath;
      existingFile.fileUrl = fileUrl;
      existingFile.fileExtension = fileExtension;
      existingFile.fileSize = file.size;
    }

    // 3. Update other metadata
    if (updateData.uploadBy) existingFile.uploadBy = updateData.uploadBy;
    if (updateData.description) existingFile.description = updateData.description;
    if (updateData.uploadType) existingFile.uploadType = updateData.uploadType;
    if (updateData.groupID) existingFile.groupID = updateData.groupID;

    return await this.uploadRepository.save(existingFile);
  }
}
