import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateShippingStatusDto } from './dto/update-order.dto';

@ApiTags('order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiResponse({ status: 201, description: 'Đơn hàng đã được tạo' })
  async create(@Req() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.user_id;
    return this.orderService.createOrder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả đơn hàng của người dùng hiện tại' })
  async getUserOrders(@Req() req) {
    const userId = req.user.user_id;
    return this.orderService.getOrdersByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng cụ thể' })
  async getDetail(@Req() req, @Param('id', ParseIntPipe) orderId: number) {
    const userId = req.user.user_id;
    return this.orderService.getDetailOrder(orderId, userId);
  }

  @Get('/pending/list')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng đang chờ xử lý' })
  @ApiQuery({ name: 'district', required: false, description: 'Lọc theo quận/huyện của nhà hàng' })
  async getPendingOrders(@Query('district') district?: string) {
    return this.orderService.getPendingOrders(district);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Shipper nhận đơn hàng' })
  @ApiResponse({ status: 200, description: 'Đơn hàng đã được nhận' })
  @ApiResponse({ status: 400, description: 'Không thể nhận đơn' })
  async assignOrder(@Param('id', ParseIntPipe) orderId: number, @Req() req) {
    const userId = req.user.user_id;
    return this.orderService.assignOrderToShipper(orderId, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Shipper cập nhật trạng thái đơn hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 400, description: 'Không hợp lệ hoặc không có quyền' })
  async updateShippingStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() req,
    @Body() dto: UpdateShippingStatusDto,
  ) {
    const userId = req.user.user_id;
    return this.orderService.updateOrderShippingStatusByShipper(orderId, userId, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Người dùng huỷ đơn hàng nếu đang chờ xử lý' })
  @ApiResponse({ status: 200, description: 'Đã huỷ đơn hàng' })
  @ApiResponse({ status: 400, description: 'Không thể huỷ đơn hàng này' })
  async cancelOrder(@Param('id', ParseIntPipe) orderId: number, @Req() req) {
    const userId = req.user.user_id;
    return this.orderService.cancelOrderByUser(orderId, userId);
  }
}
