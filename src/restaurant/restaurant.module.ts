import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [SupabaseModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, UploadService],
})
export class RestaurantModule {}
