import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0912345678',
    required: true,
  })
  phonenumber: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'Password123',
    required: true,
  })
  password: string;
}
