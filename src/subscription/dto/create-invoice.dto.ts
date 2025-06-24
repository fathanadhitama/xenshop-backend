import { IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  user_id: string;

  @IsString()
  package_id: string;
}
