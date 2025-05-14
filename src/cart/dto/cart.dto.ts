import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class CartDto {
  @ApiProperty({
    description: 'ID của món ăn',
    example: 42,
    required: true,
  })
  @IsInt()
  menuitem_id: number;

  @ApiProperty({
    description: 'Số lượng món ăn',
    example: 2,
    required: true,
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Ghi chú thêm cho món ăn (nếu có)',
    example: 'Không hành, ít cay',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateCartQuantityDto {
  @ApiProperty({ example: 2 })
  quantity: number;
}
