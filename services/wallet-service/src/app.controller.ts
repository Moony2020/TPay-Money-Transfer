import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'success',
      message: 'tPay Wallet & Ledger Service is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
