import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Invoice, Xendit } from 'xendit-node';

@Injectable()
export class XenditService {
  private invoiceClient: Invoice;

  constructor(private config: ConfigService) {
    const xendit = new Xendit({
      secretKey: this.config.get<string>('XENDIT_SECRET_KEY'),
    });

    this.invoiceClient = xendit.Invoice;
  }

  get invoice() {
    return this.invoiceClient;
  }
}
