import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceCallback } from 'xendit-node/invoice/models';

@Controller('subscribe')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoiceUrl =
      await this.subscriptionService.createXenditInvoice(createInvoiceDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Invoice created successfully',
      data: {
        invoiceUrl,
      },
    };
  }

  @Post('/callback')
  async callbackInvoice(@Body() body: InvoiceCallback) {
    const invoiceUrl =
      await this.subscriptionService.handleInvoiceCallback(body);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Invoice created successfully',
      data: {
        invoiceUrl,
      },
    };
  }
}
