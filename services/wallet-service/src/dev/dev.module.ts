import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [DevController],
})
export class DevModule {}
