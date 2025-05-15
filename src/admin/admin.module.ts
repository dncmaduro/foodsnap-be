import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { AdminApplicationController } from './admin.controller';
import { AdminApplicationService } from './admin.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AdminApplicationController],
  providers: [AdminApplicationService],
})
export class AdminApplicationModule {}
