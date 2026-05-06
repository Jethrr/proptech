import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signUp(@Body() body: AuthCredentialsDto) {
    return this.authService.signUp(body);
  }

  @Public()
  @Post('signin')
  signIn(@Body() body: AuthCredentialsDto) {
    return this.authService.signIn(body);
  }

  @Get('me')
  me(@CurrentUser() user: { id: string; email?: string }) {
    return { user };
  }
}
