import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SystemService } from './system.service';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('health')
  health() {
    return this.systemService.health();
  }

  @Get('api/protected')
  protected(@CurrentUser() user: { id: string; email?: string }) {
    return this.systemService.protected(user.id);
  }
}
