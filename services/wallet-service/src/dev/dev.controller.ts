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
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_TOOLS !== 'true') {
      throw new ForbiddenException('Dev tools not available in production');
    }

    return this.walletService.faucet(user.sub, dto.amount, dto.currency);
  }
}
