import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Menuitem } from './interfaces/search.interface';

@Injectable()
export class SearchService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async search(query: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data: menuItems, error: menuItemError } = await supabase
      .from('menuitem')
      .select('*')
      .ilike('name', `%${query}%`);
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurant')
      .select('*')
      .ilike('name', `%${query}%`);

    if (menuItemError || restaurantError) {
      throw menuItemError || restaurantError;
    }

    const results = {
      menuItems: menuItems || [],
      restaurants: restaurants || [],
    };

    return results;
  }
}
