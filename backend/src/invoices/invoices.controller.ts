import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentToken } from '../common/decorators/current-token.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
  ) {
    return this.invoicesService.list(user.id, token);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Body() body: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(user.id, token, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
    @Body() body: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(user.id, token, id, body);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string; email?: string },
    @CurrentToken() token: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.remove(user.id, token, id);
  }
}
