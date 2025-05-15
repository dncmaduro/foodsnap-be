import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateRestaurantApplicationDto } from './dto/restaurant-application.dto';

@Injectable()
export class RestaurantApplicationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly uploadService: UploadService,
  ) {}

  async createApplication(
    userId: number,
    dto: CreateRestaurantApplicationDto,
    files: {
      cccd_front: Express.Multer.File[];
      cccd_back: Express.Multer.File[];
    },
  ) {
    if (!files?.cccd_front?.[0] || !files?.cccd_back?.[0]) {
      throw new BadRequestException('Thiếu ảnh CCCD');
    }

    const supabase = this.supabaseService.getClient();

    const frontUrl = await this.uploadService.uploadFile(files.cccd_front[0]);
    const backUrl = await this.uploadService.uploadFile(files.cccd_back[0]);

    const { error } = await supabase.from('restaurant_application').insert({
      user_id: userId,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      district: dto.district,
      cccd: dto.cccd,
      id_card_front_url: frontUrl,
      id_card_back_url: backUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã gửi đơn đăng ký nhà hàng' };
  }

  async getApplicationsByUser(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('restaurant_application')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    return data;
  }
}
