import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class PurchaseOrderListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'],
    description: 'Filter by status',
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'ordered', 'partially_received', 'received', 'cancelled'])
  status?: string;
}
