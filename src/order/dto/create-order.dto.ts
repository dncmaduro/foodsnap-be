import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID của địa chỉ giao hàng' })
  @IsInt()
  address_id: number;

  @ApiProperty({ example: 1, description: 'ID nhà hàng' })
  @IsInt()
  restaurant_id: number;

  @ApiProperty({
    example: 'Vui lòng gọi khi đến nơi',
    description: 'Ghi chú cho tài xế',
    required: false,
  })
  @IsString()
  @IsOptional()
  delivery_note?: string;

  @ApiProperty({ example: 300000, description: 'Tổng phụ (subtotal)' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 2.99, description: 'Phí giao hàng' })
  @IsNumber()
  shipping_fee: number;

  @ApiProperty({ example: 302990, description: 'Tổng cộng (total)' })
  @IsNumber()
  total_price: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Danh sách món ăn trong đơn' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
