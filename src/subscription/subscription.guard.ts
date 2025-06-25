import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Ambil userId dari header (simulasi karena belum ada auth)
    const userId = req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string') {
      throw new ForbiddenException('Missing user ID in request header');
    }

    const now = new Date();
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeSubscription) {
      throw new ForbiddenException('Active subscription required');
    }

    return true;
  }
}
