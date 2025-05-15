// review.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class ReviewService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    const supabase = this.supabaseService.getClient();

    const { data: order, error: orderError } = await supabase
      .from('order')
      .select('shipping_status')
      .eq('order_id', dto.order_id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.shipping_status !== 'Delivered') {
      throw new BadRequestException('Chỉ có thể đánh giá đơn hàng đã giao');
    }

    const { data: existingReview, error: checkError } = await supabase
      .from('review')
      .select('review_id')
      .eq('order_id', dto.order_id)
      .maybeSingle();

    if (checkError) throw new BadRequestException(checkError.message);
    if (existingReview) {
      throw new BadRequestException('Đơn hàng này đã được đánh giá');
    }

    const { error: insertError } = await supabase.from('review').insert({
      user_id: userId,
      order_id: dto.order_id,
      rating: dto.rating,
      comment: dto.comment ?? '',
      created_at: new Date().toISOString(),
    });

    if (insertError) throw new BadRequestException(insertError.message);

    return { message: 'Đánh giá thành công' };
  }

  async getReviewsByOrder(orderId: number, userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('review')
      .select(
        `
        *
      `,
      )
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return data;
  }
}
