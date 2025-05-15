import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateShipperApplicationDto } from './dto/shipper-application.dto';

@Injectable()
export class ShipperApplicationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly uploadService: UploadService,
  ) {}

  async createApplication(
    userId: number,
    dto: CreateShipperApplicationDto,
    files: {
      license_front: Express.Multer.File[];
      license_back: Express.Multer.File[];
    },
  ) {
    const supabase = this.supabaseService.getClient();

    // 🚨 Kiểm tra đã có đơn chưa
    const { data: existing, error: checkError } = await supabase
      .from('shipper_application')
      .select('shipperapp_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw new BadRequestException(checkError.message);
    if (existing) throw new BadRequestException('Bạn đã gửi đơn đăng ký shipper trước đó.');

    // ✅ Validate file ảnh
    if (!files?.license_front?.[0] || !files?.license_back?.[0]) {
      throw new BadRequestException('Thiếu ảnh bằng lái xe');
    }

    const frontUrl = await this.uploadService.uploadFile(files.license_front[0]);
    const backUrl = await this.uploadService.uploadFile(files.license_back[0]);

    const { error } = await supabase.from('shipper_application').insert({
      user_id: userId,
      phone: dto.phone,
      license_image_front: frontUrl,
      license_image_back: backUrl,
      fullname: dto.fullname,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã gửi đơn đăng ký shipper' };
  }

  async getApplicationsByUser(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shipper_application')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return data;
  }
}
