import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException('Không tìm thấy đơn hàng');
    return data;
  }
}
