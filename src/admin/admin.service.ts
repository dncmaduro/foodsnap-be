import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AdminApplicationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllApplications({
    type,
    status,
    searchText,
  }: {
    type: 'shipper' | 'restaurant';
    status?: string;
    searchText?: string;
  }) {
    const supabase = this.supabaseService.getClient();
    const table = type === 'shipper' ? 'shipper_application' : 'restaurant_application';

    let query = supabase.from(table).select('*');

    if (status) query = query.eq('status', status);
    if (searchText) {
      query = query.or(`phone.ilike.%${searchText}%,name.ilike.%${searchText}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new BadRequestException(error.message);

    return data;
  }

  async updateShipperStatus(applicationId: number, status: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('shipper_application')
      .update({ status })
      .eq('shipperapp_id', applicationId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Cập nhật trạng thái đơn shipper thành công' };
  }

  async updateRestaurantStatus(applicationId: number, status: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('restaurant_application')
      .update({ status })
      .eq('restaurantapp_id', applicationId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Cập nhật trạng thái đơn nhà hàng thành công' };
  }
}
