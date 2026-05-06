import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async signUp(body: AuthCredentialsDto) {
    const { email, password } = body ?? {};
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const { data, error } = await this.supabaseService.client.auth.signUp({ email, password });
    if (error) throw new BadRequestException(error.message);

    return { user: data.user, session: data.session };
  }

  async signIn(body: AuthCredentialsDto) {
    const { email, password } = body ?? {};
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new UnauthorizedException(error.message);

    return { user: data.user, session: data.session };
  }
}
