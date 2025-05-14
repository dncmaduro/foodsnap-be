import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getById(restaurantId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('restaurant')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single(); // lấy 1 object thay vì array

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Restaurant not found');
    }

    return data;
  }
}
