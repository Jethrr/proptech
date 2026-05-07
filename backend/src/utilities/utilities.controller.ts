import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentToken } from '../common/decorators/current-token.decorator';
import { CreateUtilityBillingCycleDto } from './dto/create-utility-billing-cycle.dto';
import { UtilitiesService } from './utilities.service';

@Controller('api/utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get('billing-cycles')
  list(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
  ) {
    return this.utilitiesService.list(user.id, token);
  }

  @Post('billing-cycles')
  create(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Body() body: CreateUtilityBillingCycleDto,
  ) {
    return this.utilitiesService.create(user.id, token, body);
  }
}
