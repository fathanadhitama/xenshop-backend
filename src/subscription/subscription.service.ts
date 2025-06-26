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
      successRedirectUrl: `${baseUrl}/subscription`,
      failureRedirectUrl: `${baseUrl}/subscription`,
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

      const now = new Date();
      const latestSub = await this.prisma.userSubscription.findFirst({
        where: {
          userId: invoice.userId,
          endDate: { gte: now }, // aktif atau future
        },
        orderBy: {
          endDate: 'desc',
        },
      });

      const startDate =
        latestSub && latestSub.endDate > now ? latestSub.endDate : now;
      const endDate = new Date(
        startDate.getTime() + plan.durationMonth * 30 * 24 * 60 * 60 * 1000
      );

      await this.prisma.userSubscription.create({
        data: {
          userId: invoice.userId,
          planId: invoice.planId,
          startDate,
          endDate,
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

  async getUserSubscriptionHistory(userId: string, page = 0, limit = 5) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await this.prisma.$transaction([
      this.prisma.userSubscription.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
        },
      }),
      this.prisma.invoice.count({
        where: { userId },
      }),
    ]);

    return {
      data: subscriptions,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async cancelUserSubscription(userId: string) {
    const now = new Date();

    const futureSubs = await this.prisma.userSubscription.findMany({
      where: {
        userId,
        endDate: { gte: now },
      },
    });

    if (futureSubs.length === 0) {
      throw new NotFoundException('No subscription to cancel');
    }

    await this.prisma.userSubscription.updateMany({
      where: {
        userId,
        endDate: { gte: now },
      },
      data: {
        endDate: now,
      },
    });

    return futureSubs;
  }

  async getUserActiveSubscription(userId: string) {
    const now = new Date();
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        endDate: { gte: now },
      },
      orderBy: {
        endDate: 'desc',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return subscription;
  }
}
