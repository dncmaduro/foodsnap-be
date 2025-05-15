import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UpdateShipperInfoDto } from './dto/shipper.dto';

@Injectable()
export class ShipperInfoService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getInfoByUser(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shipper_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException('Không tìm thấy thông tin shipper');

    return data;
  }

  async updateInfo(userId: number, dto: UpdateShipperInfoDto) {
    const supabase = this.supabaseService.getClient();

    // Check if the shipper exists
    const { data: existing, error: fetchError } = await supabase
      .from('shipper_info')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw new BadRequestException(fetchError.message);
    if (!existing) throw new NotFoundException('Không tìm thấy shipper');

    // Update record
    const { error: updateError } = await supabase
      .from('shipper_info')
      .update({
        ...dto,
      })
      .eq('user_id', userId);

    if (updateError) throw new BadRequestException(updateError.message);

    return { message: 'Cập nhật thông tin shipper thành công' };
  }
}
