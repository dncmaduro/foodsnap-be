import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreateRestaurantApplicationDto {
  @ApiProperty({ example: 'Bún Chả Hương Liên' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '0912345678' })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({ example: '24 Lê Văn Hưu, Hà Nội' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Hoàn Kiếm' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: '012345678912' })
  @IsNotEmpty()
  @IsString()
  cccd: string;
}
