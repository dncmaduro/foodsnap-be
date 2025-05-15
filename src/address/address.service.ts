import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createAddress(userId: number, dto: CreateAddressDto) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('address').insert([
      {
        user_id: userId,
        label: dto.label,
        district: dto.district,
        address: dto.address,
        is_default: dto.is_default ?? false,
      },
    ]);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã tạo địa chỉ thành công' };
  }

  async getAllAddresses(userId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('address').select('*').eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return data;
  }

  async updateAddress(userId: number, addressId: number, dto: CreateAddressDto) {
    const supabase = this.supabaseService.getClient();

    const { data: existing, error: checkError } = await supabase
      .from('address')
      .select('address_id')
      .eq('address_id', addressId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ để cập nhật');
    }

    const { error } = await supabase
      .from('address')
      .update({
        label: dto.label,
        district: dto.district,
        address: dto.address,
        is_default: dto.is_default ?? false,
      })
      .eq('address_id', addressId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã cập nhật địa chỉ thành công' };
  }

  async removeAddress(userId: number, addressId: number) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('address')
      .delete()
      .eq('address_id', addressId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Đã xoá địa chỉ' };
  }
}
