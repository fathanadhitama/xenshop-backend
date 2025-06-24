import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  CreateInvoiceRequest,
  // InvoiceCallback,
  InvoiceStatus,
} from 'xendit-node/invoice/models';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { XenditService } from 'src/xendit/xendit.service';
import { ConfigService } from '@nestjs/config';
import { InvoiceStatusEnum } from './enums/subscription.enums';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xendit: XenditService,
    private config: ConfigService
  ) {}
  async createXenditInvoice(createInvoiceDto: CreateInvoiceDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: createInvoiceDto.package_id },
    });
    const baseUrl = this.config.get<string>('BASE_URL');

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const data: CreateInvoiceRequest = {
      externalId: plan.name + '-' + uuidv4(),
      amount: plan.price,
      currency: 'IDR',
      invoiceDuration: 86400, // 1 day in seconds
      description: `Subscription for ${plan.name} by user ${createInvoiceDto.user_id}`,
      successRedirectUrl: `${baseUrl}/success`,
      failureRedirectUrl: `${baseUrl}/failed`,
    };

    const response = await this.xendit.invoice.createInvoice({
      data,
    });

    if (!response || !response.invoiceUrl) {
      throw new InternalServerErrorException('Failed to create invoice');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        externalId: response.externalId,
        invoiceUrl: response.invoiceUrl,
        userId: createInvoiceDto.user_id,
        planId: plan.id,
        amount: plan.price,
        status: InvoiceStatusEnum.PENDING,
      },
    });

    if (!invoice) {
      throw new InternalServerErrorException(
        'Failed to save invoice to database'
      );
    }

    return response.invoiceUrl;
  }

  async handleInvoiceCallback(body: any) {
    // using any type for body as InvoiceCallback model is not consistently
    // defined in the SDK

    const invoiceId = body.external_id;
    const invoice = await this.prisma.invoice.findUnique({
      where: { externalId: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: invoice.planId },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    if (body.status === InvoiceStatus.Paid) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatusEnum.PAID, paidAt: new Date() },
      });

      await this.prisma.userSubscription.create({
        data: {
          userId: invoice.userId,
          planId: invoice.planId,
          startDate: new Date(),
          endDate: new Date(
            Date.now() + plan.durationMonth * 30 * 24 * 60 * 60 * 1000
          ),
        },
      });
    } else if (body.status === InvoiceStatus.Expired) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatusEnum.EXPIRED },
      });
    } else {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatusEnum.FAILED },
      });
    }
    return invoice.invoiceUrl;
  }
}
