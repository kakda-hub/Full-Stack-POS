import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class SaleListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: ['cash', 'aba', 'card'], description: 'Filter by payment method' })
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'aba', 'card'])
  paymentMethod?: string;
}
