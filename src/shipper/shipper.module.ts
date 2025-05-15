import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ShipperInfoController } from './shipper.controller';
import { ShipperInfoService } from './shipper.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ShipperInfoController],
  providers: [ShipperInfoService],
})
export class ShipperInfoModule {}
