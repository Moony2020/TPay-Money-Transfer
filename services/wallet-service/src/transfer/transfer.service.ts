import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { P2PTransferDto, MerchantPaymentDto } from './dto/transfer.dto';
import { Decimal } from 'decimal.js';
import { Prisma, TransactionType, TransactionStatus, EntryType } from '@prisma/client';

@Injectable()
export class TransferService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  /**
   * Executes a P2P Transfer using Double-Entry Accounting.
   * This method is ATOMIC and IDEMPOTENT.
   *
   * 1. Validates sender has sufficient funds.
   * 2. Creates a PENDING transaction (journal) record.
   * 3. Creates two LedgerEntries: DEBIT from sender, CREDIT to recipient.
   * 4. Marks transaction as COMMITTED.
   *
   * All steps are wrapped in a single Prisma Interactive Transaction
   * with the highest isolation level (Serializable).
   */
  async executeP2PTransfer(dto: P2PTransferDto) {
    // --- Idempotency Check ---
    const existingTx = await this.prisma.transaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingTx) {
      if (existingTx.status === TransactionStatus.COMMITTED) {
        return { message: 'Transaction already processed', transaction: existingTx };
      }
      throw new ConflictException('Transaction with this idempotency key is already in progress or failed');
    }

    // --- Phone Number Resolution ---
    let finalRecipientWalletId = dto.recipientWalletId;

    if (!finalRecipientWalletId && dto.recipientPhone) {
      // Cross-schema query to resolve phone to user ID
      const users: any[] = await this.prisma.$queryRaw`
        SELECT id FROM public.users WHERE phone_number = ${dto.recipientPhone} LIMIT 1
      `;
      
      const userId = users[0]?.id;
      if (!userId) {
        throw new BadRequestException('Recipient phone number not found');
      }

      // Find or create wallet for this user
      const recipientWallet = await this.walletService.getOrCreateWalletByUserId(userId);
      finalRecipientWalletId = recipientWallet.id;
    }

    if (!finalRecipientWalletId) {
      throw new BadRequestException('Recipient wallet or phone number is required');
    }

    const amount = new Decimal(dto.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be positive');
    }

    // --- Business Validation ---
    if (dto.senderWalletId === finalRecipientWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // --- PIN Verification ---
    const senderWallet = await this.prisma.wallet.findUnique({
      where: { id: dto.senderWalletId },
      select: { userId: true },
    });

    if (!senderWallet) {
      throw new BadRequestException('Sender wallet not found');
    }

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001';
      const response = await fetch(`${authServiceUrl}/auth/internal/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: senderWallet.userId,
          pin: dto.pin,
        }),
      });

      if (!response.ok) {
        throw new UnauthorizedException('Security check failed: Invalid PIN');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Security verification service unavailable');
    }

    // --- Execute Atomic Transaction ---
    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          // 1. Get current balances (with lock for serializable)
          const senderBalance = await this.calculateBalanceInTx(tx, dto.senderWalletId);
          if (senderBalance.lessThan(amount)) {
            throw new BadRequestException(`Insufficient funds. Available: ${senderBalance.toFixed(4)}`);
          }

          // 2. Create the Transaction (Journal Entry)
          const transaction = await tx.transaction.create({
            data: {
              idempotencyKey: dto.idempotencyKey,
              type: TransactionType.P2P_TRANSFER,
              status: TransactionStatus.PENDING,
              senderWalletId: dto.senderWalletId,
              recipientWalletId: finalRecipientWalletId,
              amount: amount.toFixed(4),
              description: dto.description,
            },
          });

          // 3. Create Ledger Entries (Double-Entry)
          // DEBIT: Decrease sender balance (stored as negative)
          const senderNewBalance = senderBalance.minus(amount);
          await tx.ledgerEntry.create({
            data: {
              walletId: dto.senderWalletId,
              transactionId: transaction.id,
              entryType: EntryType.DEBIT,
              amount: amount.negated().toFixed(4), // Negative for debit
              balance: senderNewBalance.toFixed(4),
            },
          });

          // CREDIT: Increase recipient balance (stored as positive)
          const recipientBalance = await this.calculateBalanceInTx(tx, finalRecipientWalletId!);
          const recipientNewBalance = recipientBalance.plus(amount);
          await tx.ledgerEntry.create({
            data: {
              walletId: finalRecipientWalletId!,
              transactionId: transaction.id,
              entryType: EntryType.CREDIT,
              amount: amount.toFixed(4), // Positive for credit
              balance: recipientNewBalance.toFixed(4),
            },
          });

          // 4. Commit the Transaction
          const committedTx = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.COMMITTED,
              committedAt: new Date(),
            },
          });

          return committedTx;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 15000, // 15 seconds
        },
      );

      return {
        message: 'Transfer successful',
        transaction: result,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      // Log and rethrow for unexpected errors
      console.error('Transfer failed:', error);
      throw new InternalServerErrorException('Transaction failed. Please try again.');
    }
  }

  /**
   * Merchant Payment is identical to P2P but with a different type.
   */
  async executeMerchantPayment(dto: MerchantPaymentDto) {
    // Reuse P2P logic but label it differently
    const result = await this.executeP2PTransfer(dto);
    
    // Update transaction type if newly created
    if (result.transaction && result.message === 'Transfer successful') {
      await this.prisma.transaction.update({
        where: { id: result.transaction.id },
        data: { 
          type: TransactionType.MERCHANT_PAYMENT,
          metadata: { merchantReference: dto.merchantReference },
        },
      });
      result.transaction.type = TransactionType.MERCHANT_PAYMENT;
    }
    return result;
  }

  /**
   * Helper: Calculate balance within an active transaction context.
   */
  private async calculateBalanceInTx(
    tx: Prisma.TransactionClient,
    walletId: string,
  ): Promise<Decimal> {
    const result = await tx.ledgerEntry.aggregate({
      where: { walletId },
      _sum: { amount: true },
    });
    return result._sum.amount ? new Decimal(result._sum.amount.toString()) : new Decimal(0);
  }

  /**
   * Get transaction receipt for audit.
   */
  async getTransactionReceipt(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ledgerEntries: true,
        senderWallet: true,
        recipientWallet: true,
      },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    return {
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      sender: transaction.senderWallet?.userId,
      recipient: transaction.recipientWallet?.userId,
      description: transaction.description,
      createdAt: transaction.createdAt,
      committedAt: transaction.committedAt,
      ledgerEntries: transaction.ledgerEntries.map((e) => ({
        walletId: e.walletId,
        type: e.entryType,
        amount: e.amount.toString(),
        runningBalance: e.balance.toString(),
      })),
    };
  }
}
