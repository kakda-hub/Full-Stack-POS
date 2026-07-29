import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class LowStockQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Override threshold (default: uses per-product lowStockThreshold)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  threshold?: number;
}
