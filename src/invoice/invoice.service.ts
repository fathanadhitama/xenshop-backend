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

  async findByUser(userId: string, page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
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
