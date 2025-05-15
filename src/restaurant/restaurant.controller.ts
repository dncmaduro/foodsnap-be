import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant detail by ID' })
  @ApiResponse({ status: 200, description: 'Return restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getById(@Param('id') id: string) {
    return this.restaurantService.getById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // field name 'image' FE gửi lên
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin nhà hàng của người dùng hiện tại' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi dữ liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà hàng' })
  async updateRestaurant(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @UploadedFile() file?: Express.Multer.File, // file ảnh truyền lên FE
  ) {
    const userId = req.user.user_id;
    // id là string, cast về số nếu bạn để DB là number, hoặc giữ string nếu là varchar
    return this.restaurantService.updateRestaurantInfo(userId, id, dto, file);
  }

  @Get(':id/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders by restaurant ID' })
  @ApiResponse({ status: 200, description: 'Return list of orders' })
  @ApiResponse({ status: 404, description: 'Restaurant not found or no orders found' })
  async getOrdersByRestaurantId(@Req() req, @Param('id') id: string) {
    const userId = req.user.user_id;
    return this.restaurantService.getOrdersByRestaurantId(userId, id);
  }

  @Get('app/:restaurantAppId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant detail by restaurantAppId' })
  @ApiResponse({ status: 200, description: 'Return restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getByRestaurantAppId(@Param('restaurantAppId') restaurantAppId: string) {
    return this.restaurantService.getByRestaurantAppId(restaurantAppId);
  }

  @Post('/menuitem')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới menu item cho nhà hàng' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi dữ liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà hàng' })
  async createMenuItem(
    @Req() req,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile() file: Express.Multer.File, // <-- lấy file ảnh (image)
  ) {
    const userId = req.user.user_id;
    return this.restaurantService.createMenuItem(userId, dto, file);
  }

  @Patch('menuitem/:menuItemId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật menu item' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi dữ liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy món ăn hoặc không có quyền' })
  async updateMenuItem(
    @Req() req,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile() file: Express.Multer.File, // <-- lấy file mới (nếu có)
  ) {
    const userId = req.user.user_id;
    return this.restaurantService.updateMenuItem(userId, menuItemId, dto, file);
  }

  @Delete('menuitem/:menuItemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá menu item' })
  @ApiResponse({ status: 200, description: 'Xoá thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy món ăn hoặc không có quyền' })
  async deleteMenuItem(@Req() req, @Param('menuItemId') menuItemId: string) {
    const userId = req.user.user_id;
    return this.restaurantService.deleteMenuItem(userId, menuItemId);
  }

  @Get('/greet/random')
  @ApiOperation({ summary: 'Lấy 6 nhà hàng ngẫu nhiên' })
  @ApiResponse({ status: 200, description: 'Danh sách nhà hàng ngẫu nhiên' })
  async getRandomRestaurants() {
    return this.restaurantService.getRandomRestaurants();
  }
}
