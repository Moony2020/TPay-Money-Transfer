import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class RedisListenerService implements OnModuleInit, OnModuleDestroy {
  private redisClient!: Redis;
  private logger = new Logger('RedisListenerService');

  constructor(private notificationsGateway: NotificationsGateway) {}

  onModuleInit() {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.redisClient.subscribe('tpay_notifications', (err: any) => {
      if (err) {
        this.logger.error(`Failed to subscribe: ${err.message}`);
      } else {
        this.logger.log('Subscribed to tpay_notifications channel');
      }
    });

    this.redisClient.on('message', (channel, message) => {
      if (channel === 'tpay_notifications') {
        try {
          const data = JSON.parse(message);
          this.logger.log(`Received notification for user ${data.userId}: ${data.type}`);
          
          // Forward to WebSocket
          this.notificationsGateway.sendToUser(data.userId, 'notification', data);
        } catch (err: any) {
          this.logger.error(`Error processing Redis message: ${err.message}`);
        }
      }
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }
}
