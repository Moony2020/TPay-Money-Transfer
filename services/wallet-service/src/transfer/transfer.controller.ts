import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { P2PTransferDto, MerchantPaymentDto } from './dto/transfer.dto';

@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('p2p')
  executeP2P(@Body() dto: P2PTransferDto) {
    return this.transferService.executeP2PTransfer(dto);
  }

  @Post('merchant')
  executeMerchantPayment(@Body() dto: MerchantPaymentDto) {
    return this.transferService.executeMerchantPayment(dto);
  }

  @Get(':id/receipt')
  getReceipt(@Param('id') id: string) {
    return this.transferService.getTransactionReceipt(id);
  }
}
