import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async addToCart(userId: number, dto: CartDto) {
    const supabase = this.supabaseService.getClient();

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
}
