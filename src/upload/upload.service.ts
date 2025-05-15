import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(file: Express.Multer.File, folder: string = 'id-cards'): Promise<string> {
    const supabase = this.supabaseService.getClient();

    if (!file) {
      throw new BadRequestException('Không có file nào được upload');
    }

    const filename = `${folder}/${uuid()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from('id-cards') // tên bucket trong Supabase
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException('Upload thất bại: ' + error.message);
    }

    const a = await supabase.storage.from('id-cards').getPublicUrl(data.path);

    return a.data.publicUrl;
  }
}
