import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('user')
      .select('user_id, phonenumber, email, fullname')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const supabase = this.supabaseService.getClient();

    // Kiểm tra user tồn tại
    const { data: user, error } = await supabase
      .from('user')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Cập nhật thông tin
    const { error: updateError } = await supabase.from('user').update(dto).eq('user_id', userId);

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    return { message: 'Cập nhật thông tin thành công' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const supabase = this.supabaseService.getClient();

    // Lấy mật khẩu cũ
    const { data: user, error } = await supabase
      .from('user')
      .select('user_id, password')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu cũ
    // (Giả sử bạn lưu plain text, nếu đã hash thì phải dùng bcrypt.compare)
    if (user.password !== dto.oldPassword) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Cập nhật mật khẩu mới
    const { error: updateError } = await supabase
      .from('user')
      .update({ password: dto.newPassword })
      .eq('user_id', userId);

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    return { message: 'Đổi mật khẩu thành công' };
  }
}
