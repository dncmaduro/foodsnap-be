import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getById(restaurantId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Get restaurant info
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurant')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (restaurantError) throw restaurantError;
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // Get menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menuitem')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (menuError) throw menuError;

    // Get reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('review')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (reviewError) throw reviewError;

    return {
      ...restaurant,
      menuItems: menuItems || [],
      reviews: reviews || [],
    };
  }
}
