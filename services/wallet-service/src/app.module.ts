import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';
import { TransferModule } from './transfer/transfer.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-tpay-identity-key-2026',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    WalletModule,
    TransferModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
