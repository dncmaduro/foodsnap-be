import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Tên nhãn cho địa chỉ (ví dụ: Nhà, Công ty)',
    example: 'Nhà riêng',
  })
  label: string;

  @ApiProperty({
    description: 'Tên quận/huyện',
    example: 'Hoàn Kiếm',
  })
  district: string;

  @ApiProperty({
    description: 'Địa chỉ chi tiết',
    example: '24 Lê Văn Hưu, Hà Nội',
  })
  address: string;

  @ApiProperty({
    description: 'Địa chỉ này có phải mặc định không',
    example: true,
    required: false,
  })
  is_default?: boolean;
}
