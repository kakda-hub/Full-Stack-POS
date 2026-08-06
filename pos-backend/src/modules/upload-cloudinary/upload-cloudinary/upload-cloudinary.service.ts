import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadCloudinaryService {
  private readonly logger = new Logger(UploadCloudinaryService.name);

  constructor() {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'pos-general',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
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
            uploadBy: 'admin',
            destinationStorage: 'CLOUDINARY',
            width: result.width,
            height: result.height,
            id: result.asset_id,
            uploadType: 'file-upload-type-general',
            isDeleted: false,
            uploadDate: new Date().toISOString(),
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async listResources(options: {
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
    offset?: number;
    max?: number;
  } = {}): Promise<any> {
    try {
      // Fetch the maximum page size Cloudinary allows so search filtering
      // covers as many resources as possible in a single request.
      const cloudinaryResult = await cloudinary.api.resources({ max_results: 500 });
      let resources = cloudinaryResult.resources || [];

      // Optional search filter: matches public_id or format (case-insensitive).
      // Empty/undefined search returns all records without filtering.
      const q = options.search?.trim().toLowerCase();
      if (q) {
        resources = resources.filter(
          (r) =>
            r.public_id?.toLowerCase().includes(q) ||
            r.format?.toLowerCase().includes(q),
        );
      }

      // Server-side sort (allowlist enforced so raw input is never trusted as
      // a sort key). Defaults to newest-first.
      const ALLOWED_SORT_FIELDS = ['public_id', 'format', 'bytes', 'created_at'];
      const sortBy = ALLOWED_SORT_FIELDS.includes(options.sortBy ?? '')
        ? (options.sortBy as string)
        : 'created_at';
      const dir = options.sort === 'asc' ? 1 : -1;
      resources = [...resources].sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'public_id':
            cmp = String(a.public_id ?? '').localeCompare(String(b.public_id ?? ''));
            break;
          case 'format':
            cmp = String(a.format ?? '').localeCompare(String(b.format ?? ''));
            break;
          case 'bytes':
            cmp = (a.bytes || 0) - (b.bytes || 0);
            break;
          default:
            cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return cmp * dir;
      });

      // Offset/max slice. total_count is the full (filtered + sorted) count so
      // the client can paginate correctly; Cloudinary caps a single call at 500.
      const total_count = resources.length;
      const offset = Math.max(0, Math.floor(options.offset ?? 0));
      const max = Math.min(500, Math.max(1, Math.floor(options.max ?? 10)));
      const page = resources.slice(offset, offset + max);

      return {
        resources: page.map((r) => this.mapCloudinaryResourceToContract(r)),
        total_count,
      };
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
      this.logger.error(
        `Failed to rename Cloudinary resource: ${oldPublicId}`,
        error,
      );
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

  private mapCloudinaryResourceToContract(resource: any): any {
    return {
      asset_id: resource.asset_id,
      public_id: resource.public_id,
      format: resource.format,
      version: resource.version,
      resource_type: resource.resource_type,
      type: resource.type,
      created_at: resource.created_at,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      asset_folder: resource.asset_folder,
      display_name: resource.public_id?.split('/').pop(), // Extract display_name
      url: resource.url,
      secure_url: resource.secure_url,
    };
  }
}
