import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ShipperInfoService } from './shipper.service';
import { UpdateShipperInfoDto } from './dto/shipper.dto';

@ApiTags('shipper-info')
@Controller('shipper-info')
export class ShipperInfoController {
  constructor(private readonly shipperInfoService: ShipperInfoService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's shipper info" })
  @ApiResponse({ status: 200, description: 'Return shipper info of current user' })
  @ApiResponse({ status: 404, description: 'Shipper info not found' })
  async getMyShipperInfo(@Req() req) {
    const userId = req.user.user_id;
    return this.shipperInfoService.getInfoByUser(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current user's shipper info" })
  @ApiResponse({ status: 200, description: 'Shipper info updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or update failed' })
  @ApiResponse({ status: 404, description: 'Shipper info not found' })
  async updateMyShipperInfo(@Req() req, @Body() dto: UpdateShipperInfoDto) {
    const userId = req.user.user_id;
    return this.shipperInfoService.updateInfo(userId, dto);
  }
}
