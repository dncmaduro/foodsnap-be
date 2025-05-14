import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );
  }

  getClient() {
    return this.supabase;
  }

  async fetchData(table: string) {
    const { data, error } = await this.supabase.from(table).select();

    if (error) throw error;
    return data;
  }
}
