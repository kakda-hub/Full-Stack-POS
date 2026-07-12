import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManagementPageDto {
  @ApiProperty({ example: 'Reports' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'របាយការណ៍' })
  @IsString()
  @IsOptional()
  titleKm?: string;

  @ApiPropertyOptional({ example: 'chart' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 'page' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: '/reports' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  badge?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Parent page ID for nesting under a menu group' })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class UpdateManagementPageDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleKm?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  badge?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Parent page ID for nesting under a menu group' })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class ReorderManagementPagesDto {
  @ApiProperty({
    description: 'Array of { id, sortOrder } pairs',
    example: [{ id: 3, sortOrder: 0 }, { id: 1, sortOrder: 1 }, { id: 4, sortOrder: 2 }],
  })
  @IsArray()
  @IsNotEmpty()
  items: { id: number; sortOrder: number }[];
}
