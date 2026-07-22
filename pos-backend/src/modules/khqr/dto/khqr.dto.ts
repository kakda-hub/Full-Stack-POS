import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateKhqrDto {
  @ApiProperty({ example: 10.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'INV-001' })
  @IsString()
  @IsOptional()
  billNumber?: string;
}
