import { IsOptional, IsString, IsIn, IsDateString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class SaleListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: ['cash', 'aba', 'card'], description: 'Filter by payment method' })
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'aba', 'card'])
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Start date (YYYY-MM-DD), inclusive — filters sale.createdAt >= dateFrom',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be in YYYY-MM-DD format' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD), inclusive — filters sale.createdAt <= dateTo (end of day)',
    example: '2026-08-31',
  })
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be in YYYY-MM-DD format' })
  dateTo?: string;
}
