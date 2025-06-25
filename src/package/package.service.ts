import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPackageDto: CreatePackageDto) {
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: createPackageDto.name,
        price: createPackageDto.price,
        durationMonth: createPackageDto.durationMonth,
      },
    });

    return plan;
  }

  async findAll() {
    const plans = await this.prisma.subscriptionPlan.findMany();

    return plans;
  }

  findOne(id: string) {
    const plan = this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    return plan;
  }

  remove(id: string) {
    const plan = this.prisma.subscriptionPlan.delete({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    return plan;
  }
}
