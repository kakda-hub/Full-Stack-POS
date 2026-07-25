import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Sok San' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '012345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'sok.san@email.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Phnom Penh, Cambodia' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 10, description: 'Points earned per dollar spent' })
  @IsInt()
  @Min(1)
  @IsOptional()
  pointsPerDollar?: number;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  pointsPerDollar?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddPointsDto {
  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  points: number;
}

export class RedeemPointsDto {
  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  points: number;
}
