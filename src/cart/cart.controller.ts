import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto, UpdateCartQuantityDto } from './dto/cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm món vào giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Thêm thành công hoặc cập nhật số lượng' })
  async addToCart(@Req() req: any, @Body() dto: CartDto) {
    const userId = req.user.user_id;
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ giỏ hàng của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách món trong giỏ hàng' })
  async getCart(@Req() req: any) {
    const userId = req.user.user_id;
    return this.cartService.getCart(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật số lượng của 1 món trong giỏ hàng' })
  @ApiParam({ name: 'id', description: 'ID của cart_item' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateItemQuantity(
    @Req() req: any,
    @Param('id') cartItemId: number,
    @Body() body: UpdateCartQuantityDto,
  ) {
    const userId = req.user.user_id;
    return this.cartService.updateItemQuantity(userId, +cartItemId, body.quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá 1 món khỏi giỏ hàng' })
  @ApiParam({ name: 'id', description: 'ID của cart_item' })
  @ApiResponse({ status: 200, description: 'Xoá thành công' })
  async removeItem(@Req() req: any, @Param('id') cartItemId: number) {
    const userId = req.user.user_id;
    return this.cartService.removeItem(userId, +cartItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Xoá toàn bộ giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xoá thành công' })
  async clearCart(@Req() req: any) {
    const userId = req.user.user_id;
    return this.cartService.clearCart(userId);
  }
}
