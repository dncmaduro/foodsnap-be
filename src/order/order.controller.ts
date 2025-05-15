import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.user_id;
    return this.orderService.createOrder(userId, dto);
  }

  @Get()
  async getUserOrders(@Req() req) {
    const userId = req.user.user_id;
    return this.orderService.getOrdersByUser(userId);
  }

  @Get(':id')
  async getDetail(@Req() req, @Param('id', ParseIntPipe) orderId: number) {
    const userId = req.user.user_id;
    return this.orderService.getDetailOrder(orderId, userId);
  }
}
