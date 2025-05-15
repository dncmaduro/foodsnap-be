import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAddressDto } from './dto/address.dto';

@ApiTags('address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateAddressDto) {
    const userId = req.user.user_id;
    return this.addressService.createAddress(userId, dto);
  }

  @Get()
  async getAll(@Req() req) {
    const userId = req.user.user_id;
    return this.addressService.getAllAddresses(userId);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() dto: CreateAddressDto,
  ) {
    const userId = req.user.user_id;
    return this.addressService.updateAddress(userId, addressId, dto);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) addressId: number) {
    const userId = req.user.user_id;
    return this.addressService.removeAddress(userId, addressId);
  }
}
