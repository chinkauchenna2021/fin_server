import { PrismaClient, AirtimePurchase as PrismaAirtimePurchase, TelecomNetwork } from '@prisma/client';
import { AirtimePurchase } from '../entities/AirtimePurchase';
import { TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class AirtimeRepository {
  /**
   * Create a new airtime purchase.
   * @param data - Airtime purchase data.
   * @returns The created AirtimePurchase entity.
   */
  async create(data: {
    network: TelecomNetwork;
    phoneNumber: string;
    amount: number;
    discount?: number;
    transaction: {
      userId: string;
      accountId: string;
      status?: TransactionStatus;
    };
  }): Promise<AirtimePurchase> {
    const airtimePurchase = await prisma.airtimePurchase.create({
      data: {
        network: data.network,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        discount: data.discount || 0,
        transaction: {
          create: {
            userId: data.transaction.userId,
            // accountId: data.transaction.accountId,
            amount: data.amount,
            type: 'AIRTIME',
            status: data.transaction.status || 'PENDING',
          },
        },
      },
      include: { transaction: true },
    });

    return new AirtimePurchase(airtimePurchase as any);
  }

  /**
   * Find an airtime purchase by its ID.
   * @param id - The ID of the airtime purchase.
   * @returns The AirtimePurchase entity or null if not found.
   */
  async findById(id: string): Promise<AirtimePurchase | null> {
    const airtimePurchase = await prisma.airtimePurchase.findUnique({
      where: { id },
      include: { transaction: true },
    });

    return airtimePurchase ? new AirtimePurchase(airtimePurchase as any) : null;
  }

  /**
   * Find all airtime purchases for a user.
   * @param userId - The ID of the user.
   * @returns An array of AirtimePurchase entities.
   */
  async findByUserId(userId: string): Promise<AirtimePurchase[]> {
    const airtimePurchases = await prisma.airtimePurchase.findMany({
      where: { transaction: { userId } },
      include: { transaction: true },
    });

    return airtimePurchases.map((ap) => new AirtimePurchase(airtimePurchases as any));
  }

  /**
   * Find all airtime purchases for a specific phone number.
   * @param phoneNumber - The phone number.
   * @returns An array of AirtimePurchase entities.
   */
  async findByPhoneNumber(phoneNumber: string): Promise<AirtimePurchase[]> {
    const airtimePurchases = await prisma.airtimePurchase.findMany({
      where: { phoneNumber },
      include: { transaction: true },
    });

    return airtimePurchases.map((ap) => new AirtimePurchase(airtimePurchases as any));
  }

  /**
   * Update the status of an airtime purchase transaction.
   * @param id - The ID of the airtime purchase.
   * @param status - The new transaction status.
   * @returns The updated AirtimePurchase entity.
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<AirtimePurchase | null> {
    const airtimePurchase = await prisma.airtimePurchase.update({
      where: { id },
      data: { transaction: { update: { status } } },
      include: { transaction: true },
    });

    return airtimePurchase ? new AirtimePurchase(airtimePurchase as any) : null;
  }

  /**
   * Delete an airtime purchase by its ID.
   * @param id - The ID of the airtime purchase.
   * @returns True if deleted, false otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const result = await prisma.airtimePurchase.delete({ where: { id } });
    return !!result;
  }
}