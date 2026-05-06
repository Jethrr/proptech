import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentToken } from '../common/decorators/current-token.decorator';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpsertPropertyDto } from './dto/upsert-property.dto';
import { PropertiesService } from './properties.service';

@Controller('api/properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
  ) {
    return this.propertiesService.list(user.id, token);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Body() body: UpsertPropertyDto,
  ) {
    return this.propertiesService.create(user.id, token, body);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Body() body: UpsertPropertyDto,
  ) {
    return this.propertiesService.update(user.id, token, id, body);
  }

  @Post(':id/units')
  createUnit(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Body() body: CreateUnitDto,
  ) {
    return this.propertiesService.createUnit(user.id, token, id, body);
  }

  @Put(':id/units/:unitId')
  updateUnit(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Param('unitId') unitId: string,
    @Body() body: CreateUnitDto,
  ) {
    return this.propertiesService.updateUnit(user.id, token, id, unitId, body);
  }

  @Delete(':id/units/:unitId')
  removeUnit(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Param('unitId') unitId: string,
  ) {
    return this.propertiesService.deleteUnit(user.id, token, id, unitId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
  ) {
    return this.propertiesService.remove(user.id, token, id);
  }
}
