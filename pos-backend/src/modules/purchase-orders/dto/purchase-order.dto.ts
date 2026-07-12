import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class PurchaseOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 0.8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'PO-2025-001' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  supplierId: number;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 5.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({ enum: PurchaseOrderStatus })
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}

export class ReceivePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'The user ID receiving the goods' })
  @IsInt()
  receivedBy: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
