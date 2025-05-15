import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UploadService } from 'src/upload/upload.service';
import { ShipperApplicationController } from './shipper-application.controller';
import { ShipperApplicationService } from './shipper-application.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ShipperApplicationController],
  providers: [ShipperApplicationService, UploadService],
})
export class ShipperApplicationModule {}
