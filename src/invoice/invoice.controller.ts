import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
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
    @Query('page') page = '1',
    @Query('limit') limit = '5'
  ) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Page must be a positive number');
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
      throw new BadRequestException('Limit must be a positive number');
    }

    const invoices = await this.invoiceService.findByUser(
      userId,
      pageNumber,
      limitNumber
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoices retrieved successfully',
      data: invoices,
    };
  }
}
