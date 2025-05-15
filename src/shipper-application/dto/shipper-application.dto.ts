import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateShipperApplicationDto {
  @ApiProperty({ example: '0912345678' })
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ example: 'Vietcombank' })
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: '123456789012' })
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  accountHolder: string;
}
