import {
  BadRequestException,
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

  @Get('/me')
  async getUserActiveSubscription(@Headers('x-user-id') userId: string) {
    const subscription =
      await this.subscriptionService.getUserActiveSubscription(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User active subscription retrieved successfully',
      data: subscription,
    };
  }

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
    @Query('page') page = '0',
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

    const history = await this.subscriptionService.getUserSubscriptionHistory(
      userId,
      pageNumber,
      limitNumber
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
