import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'success',
      message: 'tPay Identity Core API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
