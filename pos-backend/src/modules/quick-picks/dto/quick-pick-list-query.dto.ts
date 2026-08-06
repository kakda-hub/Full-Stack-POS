import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

export class QuickPickListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Include inactive items ("true")' })
  @IsOptional()
  @IsString()
  includeInactive?: string;
}
