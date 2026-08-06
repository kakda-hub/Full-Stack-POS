import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class ProductListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Include inactive products ("true")' })
  @IsOptional()
  @IsString()
  includeInactive?: string;

  @ApiPropertyOptional({ type: Number, description: 'Filter by category id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}
