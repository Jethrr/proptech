import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(jwt: string, userId: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    return { profile: data };
  }

  async updateProfile(jwt: string, user: { id: string; email?: string }, body: UpdateProfileDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const payload = {
      id: user.id,
      email: user.email,
      first_name: body?.first_name ?? null,
      last_name: body?.last_name ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return { profile: data };
  }
}
