import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newpassword456' })
  @IsString()
  newPassword: string;
}
