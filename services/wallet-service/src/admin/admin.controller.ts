import { Body, Controller, Post, Get, Param, ForbiddenException, Headers } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly walletService: WalletService) {}

  @Post('wallets/:walletId/adjust')
  async adjust(
    @Param('walletId') walletId: string,
    @Body() dto: { amount: number; reason: string },
    @Headers('admin-key') adminKey: string,
  ) {
    // Basic security for MVP: require a specific key from environment
    const secretKey = process.env.ADMIN_SECRET_KEY || 'dev-admin-key-123';
    if (adminKey !== secretKey) {
      throw new ForbiddenException('Invalid admin key');
    }

    return this.walletService.adjustBalance(walletId, dto.amount, dto.reason);
  }

  @Get('stats')
  async getStats(@Headers('admin-key') adminKey: string) {
    const secretKey = process.env.ADMIN_SECRET_KEY || 'dev-admin-key-123';
    if (adminKey !== secretKey) {
      throw new ForbiddenException('Invalid admin key');
    }
    return this.walletService.getAdminStats();
  }

  @Get('transactions')
  async getTransactions(@Headers('admin-key') adminKey: string) {
    const secretKey = process.env.ADMIN_SECRET_KEY || 'dev-admin-key-123';
    if (adminKey !== secretKey) {
      throw new ForbiddenException('Invalid admin key');
    }
    return this.walletService.getAllTransactions();
  }
}
