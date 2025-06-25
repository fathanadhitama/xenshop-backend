import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll() {
    const invoices = await this.invoiceService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoices retrieved successfully',
      data: invoices,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoiceService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice retrieved successfully',
      data: invoice,
    };
  }

  @Get('/user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('skip') skip = '0',
    @Query('take') take = '5'
  ) {
    const invoices = await this.invoiceService.findByUser(
      userId,
      Number(skip),
      Number(take)
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoices retrieved successfully',
      data: invoices,
    };
  }
}
