import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  durationMonth: number;
}
