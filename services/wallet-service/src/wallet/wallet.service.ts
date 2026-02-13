import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Decimal } from 'decimal.js';
import { TransactionType, TransactionStatus, EntryType } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
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

    try {
      const existing = await this.prisma.wallet.findFirst({
        where: { userId },
      });
      
      if (existing) {
        return existing;
      }
      
      const created = await this.prisma.wallet.create({
        data: {
          userId,
          currency: 'SSP',
        },
      });
      return created;
    } catch (error) {
      console.error('>>> [WalletService] CRITICAL ERROR in getOrCreateWalletByUserId:', error);
      throw error;
    }
  }

  /**
   * Calculates the real-time balance by aggregating ledger entries.
   * This is the ONLY source of truth for balance.
   */
  async getBalance(walletId: string): Promise<{ available: string; currency: string }> {
    const wallet = await this.getWalletById(walletId);

    // Get the most recent ledger entry for this wallet
    const latestEntry = await this.prisma.ledgerEntry.findFirst({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });

    // If no entries exist, balance is 0
    const balance = latestEntry ? new Decimal(latestEntry.balance.toString()) : new Decimal(0);

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
        transaction: {
          include: {
            senderWallet: true,
            recipientWallet: true,
          }
        },
      },
    });

    const total = await this.prisma.ledgerEntry.count({ where: { walletId } });

    // Extract all unique user IDs involved in these transactions
    const userIds = new Set<string>();
    entries.forEach(e => {
      if (e.transaction.senderWallet?.userId) userIds.add(e.transaction.senderWallet.userId);
      if (e.transaction.recipientWallet?.userId) userIds.add(e.transaction.recipientWallet.userId);
    });

    // Fetch user details from public.users (Auth service schema)
    const userMap = await this.getEnrichedUserData(Array.from(userIds));

    // Enrich entries
    const enrichedData = entries.map(e => {
      const tx = e.transaction;
      const otherUserId = e.entryType === EntryType.DEBIT ? tx.recipientWallet?.userId : tx.senderWallet?.userId;
      const otherUser = (otherUserId && userMap[otherUserId]) ? userMap[otherUserId] : null;

      const sId = tx.senderWallet?.userId;
      const rId = tx.recipientWallet?.userId;

      return {
        ...e,
        transaction: {
          ...tx,
          senderName: (sId && userMap[sId]) ? userMap[sId].fullName : undefined,
          senderImage: (sId && userMap[sId]) ? userMap[sId].profileImageUrl : undefined,
          recipientName: (rId && userMap[rId]) ? userMap[rId].fullName : undefined,
          recipientImage: (rId && userMap[rId]) ? userMap[rId].profileImageUrl : undefined,
          counterpartyName: otherUser?.fullName,
          counterpartyImage: otherUser?.profileImageUrl,
          counterpartyPhone: otherUser?.phoneNumber,
        }
      };
    });

    return {
      data: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getEnrichedUserData(userIds: string[]) {
    try {
      if (userIds.length === 0) return {};
      // Format userIds for Raw SQL UUID array lookup
      const uuidList = userIds.map(id => `'${id}'::uuid`).join(',');
      const users: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT id, full_name as "fullName", profile_image_url as "profileImageUrl", phone_number as "phoneNumber"
        FROM public.users
        WHERE id IN (${uuidList})
      `);
      
      const map = {};
      users.forEach(u => {
        const sid = u.id.toString();
        map[sid] = u;
      });
      return map;
    } catch (err) {
      this.logger.warn('Failed to enrich user data from auth schema: ' + err.message);
      return {};
    }
  }

  async lookupUserByPhone(phoneNumber: string) {
    try {
      // Match phone number with or without prefix
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      const users: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT full_name as "fullName", profile_image_url as "profileImageUrl"
        FROM public.users
        WHERE phone_number = $1 OR phone_number = $2
        LIMIT 1
      `, cleanPhone, cleanPhone.startsWith('+211') ? cleanPhone.replace('+211', '0') : cleanPhone);
      return users[0] || null;
    } catch (err) {
      this.logger.error('Lookup failed: ' + err.message);
      return null;
    }
  }

  async faucet(userId: string, amount: number, currency: string) {
    const wallet = await this.getOrCreateWalletByUserId(userId);

    // Rate limit check: max 3 faucet transactions per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await this.prisma.transaction.count({
      where: {
        recipientWalletId: wallet.id,
        type: TransactionType.DEPOSIT,
        metadata: { path: ['type'], equals: 'faucet' },
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (count >= 3) {
      throw new BadRequestException('Faucet limit reached (max 3 per 24h)');
    }

    const amountDecimal = new Decimal(amount);
    const idempotencyKey = `faucet_${userId}_${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMMITTED,
          recipientWalletId: wallet.id,
          amount: amountDecimal.toFixed(4),
          currency,
          description: 'Dev Faucet Top-up',
          metadata: { type: 'faucet', requestedBy: userId },
          committedAt: new Date(),
        },
      });

      // 2. Get current balance
      const currentBalanceRes = await tx.ledgerEntry.aggregate({
        where: { walletId: wallet.id },
        _sum: { amount: true },
      });
      const currentBalance = currentBalanceRes._sum.amount 
        ? new Decimal(currentBalanceRes._sum.amount.toString()) 
        : new Decimal(0);

      // 3. Create Ledger Entry
      const newBalance = currentBalance.plus(amountDecimal);
      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          transactionId: transaction.id,
          entryType: EntryType.CREDIT,
          amount: amountDecimal.toFixed(4),
          balance: newBalance.toFixed(4),
        },
      });

      return {
        message: 'Faucet successful',
        transactionId: transaction.id,
        newBalance: newBalance.toFixed(4),
      };
    });
  }

  async adjustBalance(walletId: string, amount: number, reason: string) {
    const wallet = await this.getWalletById(walletId);
    const amountDecimal = new Decimal(amount);
    const idempotencyKey = `admin_adj_${walletId}_${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMMITTED,
          recipientWalletId: wallet.id,
          amount: amountDecimal.toFixed(4),
          currency: wallet.currency,
          description: `Admin Adjustment: ${reason}`,
          metadata: { type: 'admin_adjustment', reason, adjustedAt: new Date() },
          committedAt: new Date(),
        },
      });

      // 2. Get current balance
      const currentBalanceRes = await tx.ledgerEntry.aggregate({
        where: { walletId: wallet.id },
        _sum: { amount: true },
      });
      const currentBalance = currentBalanceRes._sum.amount 
        ? new Decimal(currentBalanceRes._sum.amount.toString()) 
        : new Decimal(0);

      // 3. Create Ledger Entry
      const newBalance = currentBalance.plus(amountDecimal);
      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          transactionId: transaction.id,
          entryType: amountDecimal.isPositive() ? EntryType.CREDIT : EntryType.DEBIT,
          amount: amountDecimal.abs().toFixed(4),
          balance: newBalance.toFixed(4),
        },
      });

      return {
        message: 'Adjustment successful',
        transactionId: transaction.id,
        newBalance: newBalance.toFixed(4),
      };
    });
  }

  async getAdminStats() {
    const walletsCount = await this.prisma.wallet.count();
    const wallets = await this.prisma.wallet.findMany();
    let totalLiquidity = new Decimal(0);
    
    for (const wallet of wallets) {
      const latestEntry = await this.prisma.ledgerEntry.findFirst({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
      });
      if (latestEntry) {
        totalLiquidity = totalLiquidity.plus(new Decimal(latestEntry.balance.toString()));
      }
    }

    return {
      totalAccounts: walletsCount,
      totalLiquidity: totalLiquidity.toFixed(4),
      currency: 'SSP'
    };
  }

  async getAllTransactions(limit = 10) {
    return this.prisma.transaction.findMany({
      where: { status: 'COMMITTED' },
      orderBy: { committedAt: 'desc' },
      take: limit,
    });
  }
}
