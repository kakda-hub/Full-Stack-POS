import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/sale.entity';

export class SaleItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Sale must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  tax?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
