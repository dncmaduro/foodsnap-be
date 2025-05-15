import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'ID nhà hàng', example: 'restaurant-uuid' })
  @IsString()
  restaurant_id: number;

  @ApiProperty({ description: 'Tên món ăn', example: 'Phở bò' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mô tả món ăn', example: 'Phở bò truyền thống', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Giá món ăn', example: 35000 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'URL ảnh món ăn',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ description: 'Tên món ăn', example: 'Phở bò' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả món ăn', example: 'Phở bò truyền thống' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Giá món ăn', example: 35000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'URL ảnh món ăn', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
