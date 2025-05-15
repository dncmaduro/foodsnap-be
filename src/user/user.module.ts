import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { UploadService } from 'src/upload/upload.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UserController],
  providers: [UserService, UploadService],
})
export class UserModule {}
