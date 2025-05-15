import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 3, description: 'ID của món ăn' })
  @IsInt()
  menuitem_id: number;

  @ApiProperty({ example: 2, description: 'Số lượng món' })
  @IsInt()
  quantity: number;

  @ApiProperty({ example: 150000, description: 'Giá của món tại thời điểm đặt' })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'Không hành, ít cay',
    required: false,
    description: 'Ghi chú riêng cho món',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
