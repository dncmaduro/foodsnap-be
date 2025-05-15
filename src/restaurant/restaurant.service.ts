import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateShipperInfoDto } from 'src/shipper/dto/shipper.dto';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/item.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly uploadService: UploadService,
  ) {}

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
      .select('*, order(order_id, restaurant_id)')
      .eq('order.restaurant_id', restaurantId);

    if (reviewError) throw reviewError;

    return {
      ...restaurant,
      menuItems: menuItems || [],
      reviews: reviews || [],
    };
  }

  async updateRestaurantInfo(
    userId: number,
    restaurantId: string,
    dto: UpdateRestaurantDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // 1. Kiểm tra nhà hàng có tồn tại và thuộc về user không
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurant')
      .select('restaurant_id, user_id, image_url')
      .eq('restaurant_id', restaurantId)
      .single();

    if (fetchError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    if (restaurant.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền sửa nhà hàng này');
    }

    // 2. Nếu có file ảnh mới, upload và lấy url
    let imageUrl = dto.image_url ?? restaurant.image_url;
    if (file) {
      imageUrl = await this.uploadService.uploadFile(file);
    }

    // 3. Tiến hành cập nhật thông tin
    const updateData = { ...dto, image_url: imageUrl };

    const { error: updateError } = await supabase
      .from('restaurant')
      .update(updateData)
      .eq('restaurant_id', restaurantId);

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    return { message: 'Cập nhật thông tin nhà hàng thành công' };
  }

  async getOrdersByRestaurantId(userId: number, restaurantId: string): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    // Kiểm tra nhà hàng có thuộc về người dùng không
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurant')
      .select('restaurant_id, user_id')
      .eq('restaurant_id', restaurantId)
      .single();

    if (fetchError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }

    if (restaurant.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền xem đơn hàng của nhà hàng này');
    }

    // Lấy danh sách order
    const { data: orders, error: orderError } = await supabase
      .from('order')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (orderError) throw orderError;

    return orders || [];
  }

  async getByRestaurantAppId(restaurantAppId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurant')
      .select('*')
      .eq('restaurantapp_id', restaurantAppId)
      .single();

    if (fetchError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng với restaurantAppId này');
    }

    return restaurant;
  }

  async createMenuItem(
    userId: number,
    dto: CreateMenuItemDto,
    file?: Express.Multer.File, // file ảnh truyền kèm khi tạo món
  ): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Kiểm tra quyền sở hữu nhà hàng
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurant')
      .select('restaurant_id, user_id')
      .eq('restaurant_id', dto.restaurant_id)
      .single();

    if (fetchError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    if (restaurant.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền thêm món ăn cho nhà hàng này');
    }

    // Nếu có file thì upload, lấy url
    let imageUrl = dto.image_url;
    if (file) {
      imageUrl = await this.uploadService.uploadFile(file);
    }

    const { data: newMenuItem, error: createError } = await supabase
      .from('menuitem')
      .insert({
        restaurant_id: dto.restaurant_id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image_url: imageUrl,
        active: dto.active,
      })
      .select()
      .single();

    if (createError) {
      throw new BadRequestException(createError.message);
    }
    return newMenuItem;
  }

  async updateMenuItem(
    userId: number,
    menuItemId: string,
    dto: UpdateMenuItemDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Kiểm tra menu item và quyền sở hữu
    const { data: menuItem, error: fetchError } = await supabase
      .from('menuitem')
      .select('menuitem_id, restaurant_id')
      .eq('menuitem_id', menuItemId)
      .single();

    if (fetchError || !menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurant')
      .select('restaurant_id, user_id')
      .eq('restaurant_id', menuItem.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    if (restaurant.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền sửa món ăn này');
    }

    let imageUrl = dto.image_url;
    if (file) {
      imageUrl = await this.uploadService.uploadFile(file);
    }

    const { data: updatedMenuItem, error: updateError } = await supabase
      .from('menuitem')
      .update({
        ...dto,
        image_url: imageUrl,
      })
      .eq('menuitem_id', menuItemId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }
    return updatedMenuItem;
  }

  async deleteMenuItem(userId: number, menuItemId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Kiểm tra menu item và quyền sở hữu
    const { data: menuItem, error: fetchError } = await supabase
      .from('menuitem')
      .select('menuitem_id, restaurant_id')
      .eq('menuitem_id', menuItemId)
      .single();

    if (fetchError || !menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurant')
      .select('restaurant_id, user_id')
      .eq('restaurant_id', menuItem.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    if (restaurant.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa món ăn này');
    }

    const { error: deleteError } = await supabase
      .from('menuitem')
      .delete()
      .eq('menuitem_id', menuItemId);

    if (deleteError) {
      throw new BadRequestException(deleteError.message);
    }
    return { message: 'Xóa món ăn thành công' };
  }

  async getRandomRestaurants(): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('random_restaurants', { limit_count: 6 });

    if (error) throw new BadRequestException(error.message);

    return data || [];
  }
}
