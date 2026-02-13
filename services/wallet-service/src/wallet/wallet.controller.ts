import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser() user: any) {
    try {
      return await this.walletService.getOrCreateWalletByUserId(user?.sub);
    } catch (error) {
      console.error('>>> [WalletController] CRITICAL ERROR IN getMe:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletService.getWalletById(id);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  @Get(':id/history')
  getHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactionHistory(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('lookup/:phone')
  async lookup(@Param('phone') phone: string) {
    return this.walletService.lookupUserByPhone(phone);
  }
}
