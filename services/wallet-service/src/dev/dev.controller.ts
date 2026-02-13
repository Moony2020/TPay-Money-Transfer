import { Body, Controller, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { FaucetDto } from '../wallet/dto/faucet.dto';

@Controller('dev')
export class DevController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post('faucet')
  async faucet(@GetUser() user: any, @Body() dto: FaucetDto) {
    const isDevEnabled = process.env.ENABLE_DEV_TOOLS === 'true' || 
                         process.env.ENABLE_DEV_TOOLS === 'TRUE' ||
                         process.env.ENABLE_DEV_TOOLS === '1';

    if (process.env.NODE_ENV === 'production' && !isDevEnabled) {
      throw new ForbiddenException('Dev tools not available in production');
    }

    return this.walletService.faucet(user.sub, dto.amount, dto.currency);
  }
}
