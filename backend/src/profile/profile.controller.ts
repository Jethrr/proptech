import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentToken } from '../common/decorators/current-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(
    @CurrentToken() token: string,
    @CurrentUser() user: { id: string; email?: string },
  ) {
    return this.profileService.getProfile(token, user.id);
  }

  @Put()
  updateProfile(
    @CurrentToken() token: string,
    @CurrentUser() user: { id: string; email?: string },
    @Body() body: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(token, user, body);
  }
}
