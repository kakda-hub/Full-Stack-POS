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

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @IsPositive()
  categoryId: number;
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  categoryId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AdjustStockDto {
  @IsInt()
  @IsNotEmpty()
  quantity: number; // positive = add, negative = subtract
}
