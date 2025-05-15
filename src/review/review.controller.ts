// review.controller.ts
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
  BadRequestException,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Review')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo đánh giá cho đơn hàng' })
  @ApiResponse({ status: 201, description: 'Tạo đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi request hoặc đơn hàng chưa giao' })
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    const userId = req.user.user_id;
    return this.reviewService.createReview(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ description: 'Chi tiết đơn hàng và đánh giá theo từng nhà hàng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getDetail(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.user_id;
    const order = await this.reviewService.getReviewsByOrder(id, userId);

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    return order;
  }
}
