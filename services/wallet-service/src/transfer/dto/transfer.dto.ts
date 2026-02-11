import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class P2PTransferDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsUUID()
  @IsNotEmpty()
  senderWalletId!: string;

  @IsUUID()
  @IsOptional()
  recipientWalletId?: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

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
