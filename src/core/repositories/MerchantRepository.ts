import { PrismaClient, Merchant as PrismaMerchant, TransactionStatus } from '@prisma/client';
import { Merchant } from '../entities/Merchant';
import { Transaction } from '../entities/Transaction';
import { User } from '../entities/User';

const prisma = new PrismaClient();

export class MerchantRepository {
  /**
   * Create a new merchant with associated user and API key
   * @param merchantData - Merchant details
   * @returns Created Merchant entity
   */
  async createMerchant(merchantData: {
    userId: string;
    businessName: string;
    website?: string;
    webhookUrl?: string;
    successUrl?: string;
    failureUrl?: string;
  }): Promise<Merchant> {
    const merchant = await prisma.merchant.create({
      data: {
        userId: merchantData.userId,
        businessName: merchantData.businessName,
        website: merchantData.website,
        webhookUrl: merchantData.webhookUrl,
        successUrl: merchantData.successUrl,
        failureUrl: merchantData.failureUrl,
        apiKey: this.generateApiKey(), // Generate a secure API key
      },
      include: { user: true, transactions: true },
    });

    return new Merchant({
      ...merchant,
      user: new User(merchant.user),
      transactions: merchant.transactions.map(t => new Transaction(t as any)),
    });
  }

  /**
   * Find a merchant by ID with full details
   * @param merchantId - Merchant ID to retrieve
   * @returns Merchant entity or null
   */
  async findById(merchantId: string): Promise<Merchant | null> {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true, transactions: true },
    });

    if (!merchant) return null;

    return new Merchant({
      ...merchant,
      user: new User(merchant.user),
      transactions: merchant.transactions.map(t => new Transaction(t as any)),
    });
  }

  /**
   * Find a merchant by API key
   * @param apiKey - API key to search for
   * @returns Merchant entity or null
   */
  async findByApiKey(apiKey: string): Promise<Merchant | null> {
    const merchant = await prisma.merchant.findUnique({
      where: { apiKey },
      include: { user: true, transactions: true },
    });

    if (!merchant) return null;

    return new Merchant({
      ...merchant,
      user: new User(merchant.user),
      transactions: merchant.transactions.map(t => new Transaction(t as any)),
    });
  }

  /**
   * Get all merchants with pagination
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of Merchant entities
   */
  async getAllMerchants(
    page: number = 1,
    pageSize: number = 10
  ): Promise<Merchant[]> {
    const merchants = await prisma.merchant.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: true, transactions: true },
      orderBy: { createdAt: 'desc' },
    });

    return merchants.map(m => new Merchant({
      ...m,
      user: new User(m.user),
      transactions: m.transactions.map(t => new Transaction(t as any)),
    }));
  }

  /**
   * Update merchant details
   * @param merchantId - Merchant ID to update
   * @param updateData - Fields to update
   * @returns Updated Merchant entity
   */
  async updateMerchant(
    merchantId: string,
    updateData: {
      businessName?: string;
      website?: string;
      webhookUrl?: string;
      successUrl?: string;
      failureUrl?: string;
    }
  ): Promise<Merchant | null> {
    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: updateData,
      include: { user: true, transactions: true },
    });

    if (!updatedMerchant) return null;

    return new Merchant({
      ...updatedMerchant,
      user: new User(updatedMerchant.user),
      transactions: updatedMerchant.transactions.map(t => new Transaction(t as any)),
    });
  }

  /**
   * Regenerate API key for a merchant
   * @param merchantId - Merchant ID to update
   * @returns Updated Merchant entity with new API key
   */
  async regenerateApiKey(merchantId: string): Promise<Merchant | null> {
    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { apiKey: this.generateApiKey() },
      include: { user: true, transactions: true },
    });

    if (!updatedMerchant) return null;

    return new Merchant({
      ...updatedMerchant,
      user: new User(updatedMerchant.user),
      transactions: updatedMerchant.transactions.map(t => new Transaction(t as any)),
    });
  }

  /**
   * Get all transactions for a merchant
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
              id: merchantId, // Use the merchantId to filter transactions
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

    return transactions.map(t => new Transaction(t as any));
  }

  /**
   * Delete a merchant and associated records
   * @param merchantId - Merchant ID to delete
   * @returns Boolean indicating success
   */
  async deleteMerchant(merchantId: string): Promise<boolean> {
    try {
      await prisma.$transaction([
        prisma.merchant.delete({ where: { id: merchantId } }),
        prisma.transaction.deleteMany({ where: {
            Merchant: {
              some: {
                id: merchantId, // Use the merchantId to filter transactions
              },
            },
          },}),
      ]);
      return true;
    } catch (error) {
      console.error('Error deleting merchant:', error);
      return false;
    }
  }

  /**
   * Generate a secure API key
   * @returns A 32-character hex string
   */
  private generateApiKey(): string {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
}