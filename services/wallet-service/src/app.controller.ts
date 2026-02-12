import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  home() {
    return { 
      status: 'success', 
      service: 'tPay Wallet & Ledger Service', 
      status_code: 'running' 
    };
  }

  @Get('health')
  health() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
