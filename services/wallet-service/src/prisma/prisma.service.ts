import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const DEFAULT_CONNECT_RETRIES = 20;
const DEFAULT_RETRY_DELAY_MS = 2000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry() {
    const maxAttempts = this.getPositiveInt(
      process.env.PRISMA_CONNECT_RETRIES,
      DEFAULT_CONNECT_RETRIES,
    );
    const retryDelayMs = this.getPositiveInt(
      process.env.PRISMA_CONNECT_RETRY_DELAY_MS,
      DEFAULT_RETRY_DELAY_MS,
    );

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log(`Connected to database (attempt ${attempt}/${maxAttempts}).`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxAttempts} failed: ${errorMessage}`,
        );

        if (attempt === maxAttempts) {
          this.logger.error('Exhausted database connection retries.');
          throw error;
        }

        await this.sleep(retryDelayMs);
      }
    }
  }

  private getPositiveInt(value: string | undefined, fallback: number): number {
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return fallback;
    }
    return parsedValue;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
