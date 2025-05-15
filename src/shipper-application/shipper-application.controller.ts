import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Body,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ShipperApplicationService } from './shipper-application.service';
import { CreateShipperApplicationDto } from './dto/shipper-application.dto';

@ApiTags('shipper-application')
@Controller('shipper-application')
export class ShipperApplicationController {
  constructor(private readonly service: ShipperApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 2))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Đăng ký tài xế (shipper)' })
  @ApiBody({
    description: 'Form đăng ký tài xế',
    type: CreateShipperApplicationDto,
  })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi gửi đơn hoặc đã gửi trước đó' })
  async apply(
    @Req() req,
    @Body() dto: CreateShipperApplicationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.user_id;
    const fileMap = {
      license_front: [files[0]],
      license_back: [files[1]],
    };
    return this.service.createApplication(userId, dto, fileMap);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem các đơn đăng ký shipper của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách các đơn đã gửi' })
  async getMyApplications(@Req() req) {
    const userId = req.user.user_id;
    return this.service.getApplicationsByUser(userId);
  }
}
