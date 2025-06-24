import { Global, Module } from '@nestjs/common';
import { XenditService } from './xendit.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [XenditService],
  exports: [XenditService],
})
export class XenditModule {}
