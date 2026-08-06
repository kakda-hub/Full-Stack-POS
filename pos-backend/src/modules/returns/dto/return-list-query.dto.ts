import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class ReturnListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: ['pending', 'approved', 'rejected'],
    description: 'Filter by status',
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;
}
