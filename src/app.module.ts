import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from './subscription/subscription.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { XenditService } from './xendit/xendit.service';
import { XenditModule } from './xendit/xendit.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PackageModule } from './package/package.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SubscriptionModule,
    PrismaModule,
    XenditModule,
    InvoiceModule,
    PackageModule,
  ],
  controllers: [AppController],
  providers: [AppService, XenditService],
})
export class AppModule {}
