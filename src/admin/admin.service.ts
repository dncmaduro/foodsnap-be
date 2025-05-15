import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AdminApplicationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllApplications({
    type,
    status,
    searchText,
    userId,
  }: {
    type: 'shipper' | 'restaurant';
    status?: string;
    searchText?: string;
    userId: number;
  }) {
    // Chỉ user_id == 0 mới được phép
    if (userId !== 0) throw new ForbiddenException('Bạn không có quyền truy cập');

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

  // --- SHIPPER ---
  async updateShipperStatus(userId: number, applicationId: number, status: string) {
    if (userId !== 0) throw new ForbiddenException('Bạn không có quyền cập nhật trạng thái');

    const supabase = this.supabaseService.getClient();

    // Lấy thông tin đơn ứng tuyển
    const { data: app, error: appErr } = await supabase
      .from('shipper_application')
      .select('*')
      .eq('shipperapp_id', applicationId)
      .single();
    if (appErr || !app) throw new BadRequestException('Không tìm thấy đơn shipper');

    // Cập nhật trạng thái
    const { error } = await supabase
      .from('shipper_application')
      .update({ status })
      .eq('shipperapp_id', applicationId);

    if (error) throw new BadRequestException(error.message);

    // Nếu status là "approved", tạo mới shipper_info nếu chưa có
    if (status === 'approved') {
      // Check đã có info chưa
      const { data: existed } = await supabase
        .from('shipper_info')
        .select('user_id')
        .eq('user_id', app.user_id)
        .single();

      if (!existed) {
        const { error: createErr } = await supabase.from('shipper_info').insert({
          user_id: app.user_id,
          fullname: app.fullname,
          phonenumber: app.phone,
          license_front_image: app.license_front_image || app.id_card_front_url,
          license_back_image: app.license_back_image || app.id_card_back_url,
          status: 'active',
          created_at: new Date().toISOString(),
        });
        if (createErr) throw new BadRequestException(createErr.message);
      }
    }

    return { message: 'Cập nhật trạng thái đơn shipper thành công' };
  }

  // --- RESTAURANT ---
  async updateRestaurantStatus(userId: number, applicationId: number, status: string) {
    if (userId !== 0) throw new ForbiddenException('Bạn không có quyền cập nhật trạng thái');

    const supabase = this.supabaseService.getClient();

    // Lấy thông tin đơn ứng tuyển
    const { data: app, error: appErr } = await supabase
      .from('restaurant_application')
      .select('*')
      .eq('restaurantapp_id', applicationId)
      .single();
    if (appErr || !app) throw new BadRequestException('Không tìm thấy đơn nhà hàng');

    // Cập nhật trạng thái
    const { error } = await supabase
      .from('restaurant_application')
      .update({ status })
      .eq('restaurantapp_id', applicationId);

    if (error) throw new BadRequestException(error.message);

    // Nếu status là "approved", tạo mới restaurant nếu chưa có
    if (status === 'approved') {
      // Check đã có nhà hàng chưa
      const { data: existed } = await supabase
        .from('restaurant')
        .select('restaurantapp_id')
        .eq('restaurantapp_id', applicationId)
        .single();

      if (!existed) {
        const { error: createErr } = await supabase.from('restaurant').insert({
          user_id: app.user_id,
          restaurantapp_id: app.restaurantapp_id,
          name: app.name,
          district: app.district,
          address: app.address,
          phone: app.phone,
          description: app.description,
          image_url: app.image_url,
          approved_at: new Date().toISOString(),
        });
        if (createErr) throw new BadRequestException(createErr.message);
      }
    }

    return { message: 'Cập nhật trạng thái đơn nhà hàng thành công' };
  }
}
