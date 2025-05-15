import { Module } from '@nestjs/common';
import { RestaurantApplicationService } from './restaurant-application.service';
import { RestaurantApplicationController } from './restaurant-application.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [SupabaseModule],
  controllers: [RestaurantApplicationController],
  providers: [RestaurantApplicationService, UploadService],
})
export class RestaurantApplicationModule {}
