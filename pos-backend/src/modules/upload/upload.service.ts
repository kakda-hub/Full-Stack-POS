import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { FileUpload } from './entities/upload.entity';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadListQueryDto } from './dto/upload-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';

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
}
