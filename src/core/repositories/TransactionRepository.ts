import { PrismaClient, Transaction as PrismaTransaction, TransactionType, TransactionStatus } from '@prisma/client';
import { Transaction } from '../entities/Transaction';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { Merchant } from '../entities/Merchant';
import { UtilityPayment } from '../entities/UtilityPayment';
import { AirtimePurchase } from '../entities/AirtimePurchase';
import { DataPurchase } from '../entities/DataPurchase';

const prisma = new PrismaClient();

export class TransactionRepository {
  /**
   * Create a new transaction
   * @param transactionData - Transaction details
   * @returns Created Transaction entity
   */
  async createTransaction(transactionData: {
    userId: string;
    fromAccountId?: string;
    toAccountId?: string;
    amount: number;
    currencyCode?: string;
    type: TransactionType;
    status?: TransactionStatus;
    description?: string;
    reference?: string;
    metadata?: any;
    serviceProvider?: string;
    customerReference?: string;
    beneficiary?: string;
  }): Promise<Transaction> {
    const transaction = await prisma.transaction.create({
      data: {
        userId: transactionData.userId,
        fromAccountId: transactionData.fromAccountId,
        toAccountId: transactionData.toAccountId,
        amount: transactionData.amount,
        currencyCode: transactionData.currencyCode || 'USD',
        type: transactionData.type,
        status: transactionData.status || 'PENDING',
        description: transactionData.description,
        reference: transactionData.reference,
        metadata: transactionData.metadata,
        serviceProvider: transactionData.serviceProvider,
        customerReference: transactionData.customerReference,
        beneficiary: transactionData.beneficiary,
      },
      include: {
        fromAccount: true,
        toAccount: true,
        user: true,
        Merchant: true,
        UtilityPayment: true,
        AirtimePurchase: true,
        DataPurchase: true,
      },
    });

    return this.mapToTransactionEntity(transaction);
  }

  /**
   * Find a transaction by ID with full details
   * @param transactionId - Transaction ID to retrieve
   * @returns Transaction entity or null
   */
  async findById(transactionId: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        fromAccount: true,
        toAccount: true,
        user: true,
        Merchant: true,
        UtilityPayment: true,
        AirtimePurchase: true,
        DataPurchase: true,
      },
    });

    if (!transaction) return null;

    return this.mapToTransactionEntity(transaction);
  }

  /**
   * Get all transactions for a user with pagination
   * @param userId - User ID to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of Transaction entities
   */
  async getUserTransactions(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        fromAccount: true,
        toAccount: true,
        user: true,
        Merchant: true,
        UtilityPayment: true,
        AirtimePurchase: true,
        DataPurchase: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map(t => this.mapToTransactionEntity(t));
  }

  /**
   * Get all transactions for a merchant with pagination
   * @param merchantId - Merchant ID to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of Transaction entities
   */
  async getMerchantTransactions(
    merchantId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        Merchant: {
          some: {
            id: merchantId,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        fromAccount: true,
        toAccount: true,
        user: true,
        Merchant: true,
        UtilityPayment: true,
        AirtimePurchase: true,
        DataPurchase: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map(t => this.mapToTransactionEntity(t));
  }

  /**
   * Update transaction status
   * @param transactionId - Transaction ID to update
   * @param status - New transaction status
   * @returns Updated Transaction entity
   */
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
  ): Promise<Transaction | null> {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
      include: {
        fromAccount: true,
        toAccount: true,
        user: true,
        Merchant: true,
        UtilityPayment: true,
        AirtimePurchase: true,
        DataPurchase: true,
      },
    });

    if (!transaction) return null;

    return this.mapToTransactionEntity(transaction);
  }

  /**
   * Delete a transaction by ID
   * @param transactionId - Transaction ID to delete
   * @returns Boolean indicating success
   */
  async deleteTransaction(transactionId: string): Promise<boolean> {
    try {
      await prisma.transaction.delete({ where: { id: transactionId } });
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  /**
   * Map Prisma transaction model to Transaction entity
   * @param transaction - Prisma transaction model
   * @returns Transaction entity
   */
  private mapToTransactionEntity(transaction: PrismaTransaction & {
    fromAccount?: any;
    toAccount?: any;
    user: any;
    Merchant: any[];
    UtilityPayment?: any;
    AirtimePurchase?: any;
    DataPurchase?: any;
  }): Transaction {
    return new Transaction({
      ...transaction,
      fromAccount: transaction.fromAccount ? new Account(transaction.fromAccount) : null,
      toAccount: transaction.toAccount ? new Account(transaction.toAccount) : null,
      user: new User(transaction.user),
      Merchant: transaction.Merchant.map(m => new Merchant(m)),
      UtilityPayment: transaction.UtilityPayment ? new UtilityPayment(transaction.UtilityPayment) : undefined,
      AirtimePurchase: transaction.AirtimePurchase ? new AirtimePurchase(transaction.AirtimePurchase) : undefined,
      DataPurchase: transaction.DataPurchase ? new DataPurchase(transaction.DataPurchase) : undefined,
    } as any);
  }
}