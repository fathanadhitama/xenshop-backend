import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from './subscription/subscription.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { XenditService } from './xendit/xendit.service';
import { XenditModule } from './xendit/xendit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SubscriptionModule,
    PrismaModule,
    XenditModule,
  ],
  controllers: [AppController],
  providers: [AppService, XenditService],
})
export class AppModule {}
