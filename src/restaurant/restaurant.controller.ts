import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
