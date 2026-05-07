import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentToken } from '../common/decorators/current-token.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
  ) {
    return this.tenantsService.list(user.id, token);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Body() body: CreateTenantDto,
  ) {
    return this.tenantsService.create(user.id, token, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Body() body: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user.id, token, id, body);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
  ) {
    return this.tenantsService.remove(user.id, token, id);
  }
}
