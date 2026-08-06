import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class SupplierListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Include inactive suppliers ("true")' })
  @IsOptional()
  @IsString()
  includeInactive?: string;
}
