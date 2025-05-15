import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async addToCart(userId: number, dto: CartDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Lấy ra tất cả item trong cart để kiểm tra nhà hàng
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_item')
      .select('*, menuitem(restaurant_id)')
      .eq('user_id', userId);

    if (cartError) throw new BadRequestException(cartError.message);

    // 2. Lấy restaurant_id của item mới muốn thêm
    const { data: menuItem, error: menuItemError } = await supabase
      .from('menuitem')
      .select('restaurant_id')
      .eq('menuitem_id', dto.menuitem_id)
      .single();

    if (menuItemError || !menuItem) throw new BadRequestException('Không tìm thấy món ăn');

    // 3. Kiểm tra xem cart có món nào của nhà hàng khác không
    const hasDifferentRestaurant =
      cartItems &&
      cartItems.length > 0 &&
      cartItems.some(
        (item) =>
          item.menuitem &&
          item.menuitem.restaurant_id &&
          item.menuitem.restaurant_id !== menuItem.restaurant_id,
      );

    if (hasDifferentRestaurant) {
      // Clear cart nếu khác nhà hàng
      const { error: clearError } = await supabase.from('cart_item').delete().eq('user_id', userId);

      if (clearError) throw new BadRequestException(clearError.message);
    }

    // 4. Tiếp tục logic add như cũ:
    const { data: existingItem } = await supabase
      .from('cart_item')
      .select('*')
      .eq('user_id', userId)
      .eq('menuitem_id', dto.menuitem_id)
      .single();

    if (existingItem) {
      const { error } = await supabase
        .from('cart_item')
        .update({
          quantity: existingItem.quantity + dto.quantity,
          note: dto.note ?? existingItem.note,
        })
        .eq('cart_item_id', existingItem.cart_item_id);

      if (error) throw new BadRequestException(error.message);
      return { message: 'Cập nhật số lượng thành công' };
    }

    const { error } = await supabase.from('cart_item').insert([
      {
        user_id: userId,
        menuitem_id: dto.menuitem_id,
        quantity: dto.quantity,
        note: dto.note ?? '',
      },
    ]);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Thêm vào giỏ hàng thành công' };
  }

  async getCart(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_item')
      .select('*, menuitem(*, restaurant(*))')
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return data;
  }

  async updateItemQuantity(userId: number, cartItemId: number, quantity: number) {
    const supabase = this.supabaseService.getClient();

    if (quantity <= 0) throw new BadRequestException('Số lượng phải lớn hơn 0');

    const { error } = await supabase
      .from('cart_item')
      .update({ quantity })
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Cập nhật thành công' };
  }

  async removeItem(userId: number, cartItemId: number) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('cart_item')
      .delete()
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Xoá khỏi giỏ hàng thành công' };
  }

  async clearCart(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('cart_item').delete().eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã xoá toàn bộ giỏ hàng' };
  }
}
