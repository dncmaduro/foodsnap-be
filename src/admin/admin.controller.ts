import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminApplicationService } from './admin.service';

@ApiTags('admin-applications')
@Controller('admin-applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminApplicationController {
  constructor(private readonly service: AdminApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications for admin (shipper + restaurant)' })
  @ApiQuery({ name: 'type', required: true, enum: ['shipper', 'restaurant'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'searchText', required: false })
  @ApiResponse({ status: 200, description: 'List of filtered applications' })
  async getAll(
    @Req() req,
    @Query('type') type: 'shipper' | 'restaurant',
    @Query('status') status?: string,
    @Query('searchText') searchText?: string,
  ) {
    return this.service.getAllApplications({ type, status, searchText, userId: req.user.user_id });
  }

  @Patch('shipper/:id/status')
  @ApiOperation({ summary: 'Update status of a shipper application' })
  @ApiResponse({ status: 200, description: 'Updated shipper application status' })
  async updateShipperStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.service.updateShipperStatus(req.user.user_id, id, status);
  }

  @Patch('restaurant/:id/status')
  @ApiOperation({ summary: 'Update status of a restaurant application' })
  @ApiResponse({ status: 200, description: 'Updated restaurant application status' })
  async updateRestaurantStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.service.updateRestaurantStatus(req.user.user_id, id, status);
  }
}
