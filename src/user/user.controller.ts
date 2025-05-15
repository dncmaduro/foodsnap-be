import { Controller, Get, Patch, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  async getProfile(@Req() req) {
    const userId = req.user.user_id;
    return this.userService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin profile' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi dữ liệu' })
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const userId = req.user.user_id;
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu (cần nhập mật khẩu cũ)' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Sai mật khẩu cũ hoặc lỗi khác' })
  @HttpCode(200)
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.user_id;
    return this.userService.changePassword(userId, dto);
  }
}
