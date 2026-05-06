import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;
  private readonly url: string;
  private readonly key: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in environment.');
    }

    this.url = supabaseUrl;
    this.key = supabasePublishableKey;
    this.client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false },
    });
  }

  createUserClient(jwt: string): SupabaseClient {
    return createClient(this.url, this.key, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
  }
}
