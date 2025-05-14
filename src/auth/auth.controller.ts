import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Thông tin đăng nhập không chính xác',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi hệ thống',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Đăng nhập thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        console.error('Login error:', error);
        throw new InternalServerErrorException('Đã xảy ra lỗi khi đăng nhập');
      }
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Làm mới token thành công',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
      return {
        statusCode: HttpStatus.OK,
        message: 'Làm mới token thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        console.error('Refresh token error:', error);
        throw new InternalServerErrorException('Đã xảy ra lỗi khi làm mới token');
      }
    }
  }
}
