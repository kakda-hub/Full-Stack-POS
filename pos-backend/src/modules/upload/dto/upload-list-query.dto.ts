import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

/**
 * Standard list query for file upload records. Both the upload module
 * (CLOUDINARY) and the upload-dynamic module (S3) write to the shared
 * `file_uploads` table, so `destinationStorage` lets clients filter by
 * storage backend.
 */
export class UploadListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by storage backend (e.g. S3, CLOUDINARY)',
    example: 'S3',
  })
  @IsOptional()
  @IsString()
  destinationStorage?: string;
}
