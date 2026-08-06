import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard query parameters for all GET list endpoints.
 *
 *   GET /api/v1/{resource}?search=&sortBy=&sort=&offset=&max=
 *
 * - search  → optional keyword (resource-specific fields)
 * - sortBy  → field to sort by (validated against a per-resource allowlist)
 * - sort    → asc | desc (default: desc)
 * - offset  → zero-based offset (default: 0)
 * - max     → max records (default: 20, allowed 1..100)
 *
 * Defaults are applied in the pagination helper, NOT here, so the service can
 * distinguish "client explicitly passed X" from "client passed nothing".
 */
export class ListQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by (allowlist enforced server-side)' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort direction (default: desc)' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: 0, minimum: 0, description: 'Zero-based offset (default: 0)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, description: 'Max records (default: 20, max: 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  max?: number;
}
