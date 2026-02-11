import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class P2PTransferDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsUUID()
  @IsNotEmpty()
  senderWalletId!: string;

  @IsUUID()
  @IsNotEmpty()
  recipientWalletId!: string;

  @IsNumber()
  @Min(0.0001)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class MerchantPaymentDto extends P2PTransferDto {
  @IsString()
  @IsOptional()
  merchantReference?: string;
}
