import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiPropertyOptional({ example: '2025-01-01', description: 'YYYY-MM-DD' })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  from?: string; // YYYY-MM-DD

  @ApiPropertyOptional({ example: '2025-12-31', description: 'YYYY-MM-DD' })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  to?: string; // YYYY-MM-DD
}

export class TopProductsDto {
  @ApiPropertyOptional({ example: 5, description: 'default 5' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number; // default 5
}
