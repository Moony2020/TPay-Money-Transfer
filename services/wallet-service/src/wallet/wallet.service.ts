import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async createWallet(dto: CreateWalletDto) {
    // Check if user already has a wallet
    const existing = await this.prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User already has a wallet');
    }

    return this.prisma.wallet.create({
      data: {
        userId: dto.userId,
        currency: dto.currency || 'SSP',
      },
    });
  }

  async getWalletById(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });
    if (!wallet) {
      throw new NotFoundException('DEBUG: Wallet not found by ID (getWalletById)');
    }
    return wallet;
  }

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      throw new NotFoundException('DEBUG: Wallet not found for this user ID (getWalletByUserId)');
    }
    return wallet;
  }

  async getOrCreateWalletByUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('Missing user id in token');
    }

    return this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currency: 'SSP',
      },
    });
  }

  /**
   * Calculates the real-time balance by aggregating ledger entries.
   * This is the ONLY source of truth for balance.
   */
  async getBalance(walletId: string): Promise<{ available: string; currency: string }> {
    const wallet = await this.getWalletById(walletId);

    const result = await this.prisma.ledgerEntry.aggregate({
      where: { walletId },
      _sum: {
        amount: true,
      },
    });

    // For debits, amount is stored as negative. For credits, positive.
    // The sum directly gives us the balance.
    const balance = result._sum.amount ? new Decimal(result._sum.amount.toString()) : new Decimal(0);

    return {
      available: balance.toFixed(4),
      currency: wallet.currency,
    };
  }

  async getTransactionHistory(walletId: string, page = 1, limit = 20) {
    await this.getWalletById(walletId); // Validate wallet exists

    const skip = (page - 1) * limit;
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        transaction: true,
      },
    });

    const total = await this.prisma.ledgerEntry.count({ where: { walletId } });

    return {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
