import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class UserListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: ['admin', 'cashier'], description: 'Filter by role' })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'cashier'])
  role?: string;
}
