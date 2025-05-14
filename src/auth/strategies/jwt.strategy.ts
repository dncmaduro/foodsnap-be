import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('user')
      .select('user_id, fullname, email, phonenumber')
      .eq('email', payload.email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc token không hợp lệ');
    }

    return user;
  }
}
