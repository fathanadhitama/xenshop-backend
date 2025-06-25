import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.invoice.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return invoice;
  }

  async findByUser(userId: string, skip = 0, take = 5) {
    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({
        where: { userId },
      }),
    ]);

    if (!invoices || invoices.length === 0) {
      throw new NotFoundException(
        `No invoices found for user with id ${userId}`
      );
    }

    return {
      data: invoices,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
