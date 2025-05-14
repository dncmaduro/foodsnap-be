import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Họ và tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
    required: true,
  })
  fullname: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0912345678',
  })
  phonenumber: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'Password123',
    minLength: 6,
  })
  password: string;
}
