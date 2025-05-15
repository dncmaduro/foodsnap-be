import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ShipperOrderStatus, UpdateShippingStatusDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    const supabase = this.supabaseService.getClient();

    const { data: order, error: orderError } = await supabase
      .from('order')
      .insert({
        user_id: userId,
        address_id: dto.address_id,
        restaurant_id: dto.restaurant_id,
        delivery_note: dto.delivery_note,
        subtotal: dto.subtotal,
        shipping_fee: dto.shipping_fee,
        total_price: dto.total_price,
        order_at: new Date().toISOString(),
        shipping_status: 'Pending',
      })
      .select('order_id')
      .single();

    if (orderError) {
      throw new BadRequestException(orderError.message);
    }

    const orderId = order.order_id;

    const orderItems = dto.items.map((item) => ({
      order_id: orderId,
      menuitem_id: item.menuitem_id,
      quantity: item.quantity,
      price: item.price,
      note: item.note ?? '',
    }));

    const { error: itemError } = await supabase.from('order_item').insert(orderItems);

    if (itemError) {
      throw new BadRequestException(itemError.message);
    }

    return {
      message: 'Tạo đơn hàng thành công',
      order_id: orderId,
    };
  }

  async getOrdersByUser(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('order')
      .select(
        `
        *,
        order_item (
          *,
          menuitem (
            *,
            restaurant (*)
          )
        )
      `,
      )
      .eq('user_id', userId)
      .order('order_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    return data;
  }

  async getDetailOrder(orderId: number, userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('order')
      .select('*, order_item(*, menuitem(*, restaurant(*)))')
      .eq('order_id', orderId)
      .or(`user_id.eq.${userId},shipper_id.eq.${userId}`)
      .single();

    if (error) throw new NotFoundException('Không tìm thấy đơn hàng');
    return data;
  }

  async getPendingOrders(district?: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('order')
      .select(
        `
        *,
        order_item (
          *,
          menuitem (
            *,
            restaurant (
              *
            )
          )
        )
      `,
      )
      .eq('shipping_status', 'Pending');

    if (error) throw new BadRequestException(error.message);

    // Nếu có filter theo district
    if (district) {
      return data.filter((order) =>
        order.order_item?.some((item) => item.menuitem?.restaurant?.district === district),
      );
    }

    return data;
  }

  async assignOrderToShipper(orderId: number, userId: number) {
    const supabase = this.supabaseService.getClient();

    // 1. Kiểm tra shipper có tồn tại không
    const { data: shipperInfo, error: shipperError } = await supabase
      .from('shipper_info')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (shipperError || !shipperInfo) {
      throw new BadRequestException('Tài xế không tồn tại');
    }

    // 2. Kiểm tra tài xế có đang có đơn chưa hoàn thành không
    const { data: existingOrder, error: existingError } = await supabase
      .from('order')
      .select('order_id')
      .eq('shipper_id', userId)
      .in('shipping_status', ['Assigned', 'In Transit'])
      .maybeSingle();

    if (existingError) throw new BadRequestException(existingError.message);
    if (existingOrder) {
      throw new BadRequestException('Bạn đang có đơn hàng chưa hoàn thành');
    }

    // 3. Gán đơn hàng cho shipper
    const { error: updateError } = await supabase
      .from('order')
      .update({
        shipper_id: userId,
        shipping_status: 'Assigned',
      })
      .eq('order_id', orderId)
      .eq('shipping_status', 'Pending'); // chỉ cho nhận nếu đang là Pending

    if (updateError) throw new BadRequestException(updateError.message);

    return { message: 'Nhận đơn hàng thành công' };
  }

  async updateOrderShippingStatusByShipper(
    orderId: number,
    userId: number,
    dto: UpdateShippingStatusDto,
  ) {
    const supabase = this.supabaseService.getClient();

    const { status: newStatus } = dto;

    // 1. Lấy đơn hàng
    const { data: order, error: fetchError } = await supabase
      .from('order')
      .select('shipper_id, shipping_status')
      .eq('order_id', orderId)
      .single();

    if (fetchError) throw new BadRequestException(fetchError.message);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // 2. Kiểm tra quyền
    if (order.shipper_id !== userId) {
      throw new BadRequestException('Bạn không có quyền cập nhật đơn hàng này');
    }

    // 3. Kiểm tra transition hợp lệ
    const allowedTransitions: Record<string, ShipperOrderStatus[]> = {
      Assigned: [ShipperOrderStatus.InTransit],
      [ShipperOrderStatus.InTransit]: [ShipperOrderStatus.Delivered, ShipperOrderStatus.Canceled],
    };

    const allowed = allowedTransitions[order.shipping_status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException('Không thể chuyển sang trạng thái này');
    }

    // 4. Cập nhật
    const { error: updateError } = await supabase
      .from('order')
      .update({
        shipping_status: newStatus,
        delivered_at: newStatus === ShipperOrderStatus.Delivered ? new Date().toISOString() : null,
      })
      .eq('order_id', orderId);

    if (updateError) throw new BadRequestException(updateError.message);

    return { message: 'Cập nhật trạng thái đơn hàng thành công' };
  }

  async cancelOrderByUser(orderId: number, userId: number) {
    const supabase = this.supabaseService.getClient();

    // 1. Lấy đơn hàng và kiểm tra quyền
    const { data: order, error } = await supabase
      .from('order')
      .select('user_id, shipping_status')
      .eq('order_id', orderId)
      .single();

    if (error) throw new BadRequestException(error.message);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền huỷ đơn hàng này');
    }

    if (order.shipping_status !== 'Pending') {
      throw new BadRequestException('Chỉ có thể huỷ đơn khi đang ở trạng thái chờ xử lý');
    }

    // 2. Cập nhật trạng thái
    const { error: updateError } = await supabase
      .from('order')
      .update({
        shipping_status: 'Canceled',
      })
      .eq('order_id', orderId);

    if (updateError) throw new BadRequestException(updateError.message);

    return { message: 'Huỷ đơn hàng thành công' };
  }

  async getDeliveredOrdersByShipper(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('order')
      .select(
        `
        *,
        order_item (
          *,
          menuitem (
            *,
            restaurant (*)
          )
        )
      `,
      )
      .eq('shipper_id', userId)
      .eq('shipping_status', 'Delivered')
      .order('delivered_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    return data;
  }

  async getCurrentAssignedOrderByShipper(userId: number) {
    const supabase = this.supabaseService.getClient();

    // Tìm đơn hàng shipper đang nhận (Assigned hoặc In Transit)
    const { data, error } = await supabase
      .from('order')
      .select(
        `
        *,
        order_item (
          *,
          menuitem (
            *,
            restaurant (*)
          )
        )
      `,
      )
      .eq('shipper_id', userId)
      .in('shipping_status', ['Assigned', 'In Transit'])
      .order('order_at', { ascending: false })
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);

    // Nếu không có đơn nào thì trả về null
    return data;
  }
}
