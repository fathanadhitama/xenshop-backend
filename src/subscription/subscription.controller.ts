import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceCallback } from 'xendit-node/invoice/models';
import { SubscriptionGuard } from './subscription.guard';

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

  @Get('/history')
  @UseGuards(SubscriptionGuard)
  async getUserHistory(
    @Headers('x-user-id') userId: string,
    @Query('skip') skip = '0',
    @Query('take') take = '5'
  ) {
    const history = await this.subscriptionService.getUserSubscriptionHistory(
      userId,
      Number(skip),
      Number(take)
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User subscription history retrieved successfully',
      data: history,
    };
  }

  @Patch('cancel')
  @UseGuards(SubscriptionGuard)
  async cancelSubscription(@Headers('x-user-id') userId: string) {
    const result =
      await this.subscriptionService.cancelUserSubscription(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription cancelled successfully',
      data: result,
    };
  }
}
