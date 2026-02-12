import { IsNumber, IsString, Min } from 'class-validator';

export class FaucetDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  currency!: string;
}
