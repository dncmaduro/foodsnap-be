import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({ description: 'Tên nhà hàng', example: 'Bún Chả Hương Liên' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả nhà hàng',
    example: 'Nhà hàng bán bún chả Huế ngon nhất thành phố',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Quận/huyện', example: 'Hoàn Kiếm' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ cụ thể', example: '24 Lê Văn Hưu, Hà Nội' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại nhà hàng', example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện nhà hàng',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ description: 'Giờ mở cửa (định dạng HH:mm:ss)', example: '08:00:00' })
  @IsOptional()
  @IsString()
  open_time?: string;

  @ApiPropertyOptional({ description: 'Giờ đóng cửa (định dạng HH:mm:ss)', example: '22:00:00' })
  @IsOptional()
  @IsString()
  close_time?: string;
}
