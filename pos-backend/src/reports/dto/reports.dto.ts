import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  from?: string; // YYYY-MM-DD

  @IsDateString()
  @IsOptional()
  to?: string; // YYYY-MM-DD
}

export class TopProductsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number; // default 5
}
