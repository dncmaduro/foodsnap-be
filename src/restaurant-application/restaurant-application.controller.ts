import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RestaurantApplicationService } from './restaurant-application.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRestaurantApplicationDto } from './dto/restaurant-application.dto';

@ApiTags('Restaurant Application')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('restaurant-application')
export class RestaurantApplicationController {
  constructor(private readonly service: RestaurantApplicationService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tạo đơn đăng ký nhà hàng. Gửi kèm 2 ảnh CCCD theo thứ tự: mặt trước, mặt sau.',
    type: CreateRestaurantApplicationDto as any,
  })
  async create(
    @Request() req,
    @Body() dto: CreateRestaurantApplicationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const [cccd_front, cccd_back] = files;
    return this.service.createApplication(req.user.user_id, dto, {
      cccd_front: [cccd_front],
      cccd_back: [cccd_back],
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all restaurant applications submitted by current user' })
  @ApiResponse({
    status: 200,
    description: 'Return list of applications by user',
  })
  async getMyApplications(@Req() req) {
    const userId = req.user.user_id;
    return this.service.getApplicationsByUser(userId);
  }
}
