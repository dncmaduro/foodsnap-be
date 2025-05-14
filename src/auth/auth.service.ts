import { Injectable, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    const { data: emailExists } = await this.supabaseService
      .getClient()
      .from('user')
      .select('email')
      .eq('email', registerDto.email)
      .single();

    if (emailExists) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const { data: phoneExists } = await this.supabaseService
      .getClient()
      .from('user')
      .select('phonenumber')
      .eq('phonenumber', registerDto.phonenumber)
      .single();

    if (phoneExists) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    const { data, error } = await this.supabaseService.getClient().from('user').insert(registerDto);

    if (error) throw error;
    return data;
  }
}
