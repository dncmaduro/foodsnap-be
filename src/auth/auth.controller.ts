import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới với thông tin đầy đủ' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đăng ký tài khoản thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email hoặc số điện thoại đã được sử dụng',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Thiếu thông tin bắt buộc',
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Đăng ký tài khoản thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else if (error.code === '23505') {
        throw new ConflictException('Email hoặc số điện thoại đã được sử dụng');
      } else if (error.code === '23502') {
        throw new BadRequestException('Thiếu thông tin bắt buộc');
      } else {
        console.error('Registration error:', error);
        throw new InternalServerErrorException('Đã xảy ra lỗi khi đăng ký tài khoản');
      }
    }
  }
}
