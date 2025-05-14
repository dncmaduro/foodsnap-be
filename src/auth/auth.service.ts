import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(loginDto: LoginDto) {
    const { data: user, error: fetchError } = await this.supabaseService
      .getClient()
      .from('user')
      .select('*')
      .eq('phonenumber', loginDto.phonenumber)
      .single();

    if (fetchError || !user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    if (user.password !== loginDto.password) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phonenumber: user.phonenumber,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    });

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
      },
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });

      const { data: user, error } = await this.supabaseService
        .getClient()
        .from('user')
        .select('id, fullname, email, phonenumber')
        .eq('id', payload.sub)
        .single();

      if (error || !user) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        phonenumber: user.phonenumber,
      };

      const access_token = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      return {
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }
}
