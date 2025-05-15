import { IsOptional, IsString } from 'class-validator';

export class UpdateShipperInfoDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  phonenumber?: string;

  @IsOptional()
  @IsString()
  license_front_image?: string;

  @IsOptional()
  @IsString()
  license_back_image?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
