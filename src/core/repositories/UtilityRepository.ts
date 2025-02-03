import { PrismaClient, UtilityPayment as PrismaUtilityPayment, UtilityType, UtilityProvider, TransactionStatus } from '@prisma/client';
import { UtilityPayment } from '../entities/UtilityPayment';
import { Transaction } from '../entities/Transaction';
import prisma from "../../infrastructure/prismaClient/globalPrisma"

export class UtilityRepository {
  /**
   * Create a utility payment with associated transaction
   * @param data - Utility payment details and transaction context
   * @returns Created UtilityPayment entity
   */
  async createUtilityPayment(data: {
    utilityType: UtilityType;
    provider: UtilityProvider;
    customerId: string;
    meterNumber?: string;
    amount: number;
    servicePeriod?: string;
    reference?: string;
    transaction: {
      userId: string;
      accountId: string;
      status?: TransactionStatus;
    };
  }): Promise<UtilityPayment> {
    const utilityPayment = await prisma?.$transaction(async (tx) => {
      // Create transaction first
      const transaction = await tx.transaction.create({
        data: {
          userId: data.transaction.userId,
        //   accountId: data.transaction.accountId,
          amount: data.amount,
          type: 'UTILITY_BILL',
          status: data.transaction.status || 'PENDING',
          serviceProvider: data.provider,
          customerReference: data.customerId,
          beneficiary: data.meterNumber,
        }
      });

      // Create utility payment
      return tx.utilityPayment.create({
        data: {
          transactionId: transaction.id,
          utilityType: data.utilityType,
          provider: data.provider,
          customerId: data.customerId,
          meterNumber: data.meterNumber,
          amount: data.amount,
          servicePeriod: data.servicePeriod,
          reference: data.reference,
        },
        include: { transaction: true }
      });
    });

    return new UtilityPayment({
      ...utilityPayment,
      transaction: new Transaction(utilityPayment?.transaction as any)
    } as any);
  }

  /**
   * Find utility payment by ID
   * @param id - Utility payment ID
   * @returns UtilityPayment entity or null
   */
  async findById(id: string): Promise<UtilityPayment | null> {
    const utilityPayment = await prisma?.utilityPayment.findUnique({
      where: { id },
      include: { transaction: true }
    });

    return utilityPayment ? new UtilityPayment({
      ...utilityPayment,
      transaction: new Transaction(utilityPayment?.transaction as any)
    } as any) : null;
  }

  /**
   * Get utility payments by customer ID
   * @param customerId - Customer ID with utility provider
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of UtilityPayment entities
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<UtilityPayment[]> {
    const payments = await prisma?.utilityPayment.findMany({
      where: { customerId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { transaction: true },
      orderBy: { createdAt: 'desc' }
    });

    return payments?.map(p => new UtilityPayment({
      ...p,
      transaction: new Transaction(p.transaction as any)
    } as any)) as UtilityPayment[];
  }

  /**
   * Update utility payment details
   * @param id - Utility payment ID
   * @param updateData - Fields to update
   * @returns Updated UtilityPayment entity
   */
  async update(
    id: string,
    updateData: {
      meterNumber?: string;
      servicePeriod?: string;
      reference?: string;
    }
  ): Promise<UtilityPayment | null> {
    const updatedPayment = await prisma?.utilityPayment.update({
      where: { id },
      data: updateData,
      include: { transaction: true }
    });

    return updatedPayment ? new UtilityPayment({
      ...updatedPayment,
      transaction: new Transaction(updatedPayment.transaction as any)
    } as any) : null;
  }

  /**
   * Get utility payments by provider
   * @param provider - Utility provider
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of UtilityPayment entities
   */
  async findByProvider(
    provider: UtilityProvider,
    page: number = 1,
    pageSize: number = 10
  ): Promise<UtilityPayment[]> {
    const payments = await prisma?.utilityPayment.findMany({
      where: { provider },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { transaction: true },
      orderBy: { createdAt: 'desc' }
    });

    return payments?.map(p => new UtilityPayment({
      ...p,
      transaction: new Transaction(p.transaction as any)
    } as any)) as UtilityPayment[];
  }

  /**
   * Check if payment exists for service period
   * @param customerId - Customer ID with utility provider
   * @param servicePeriod - Service period (e.g., "January 2024")
   * @returns Boolean indicating if payment exists
   */
  async paymentExistsForPeriod(
    customerId: string,
    servicePeriod: string
  ): Promise<boolean> {
    const count = await prisma?.utilityPayment.count({
      where: {
        customerId,
        servicePeriod
      }
    });
    return Number(count) > 0;
  }

  /**
   * Delete utility payment and associated transaction
   * @param id - Utility payment ID
   * @returns Boolean indicating success
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma?.$transaction([
        prisma.utilityPayment.delete({ where: { id } }),
        prisma.transaction.deleteMany({
            where: {
              UtilityPayment: {
                some: { id }
              }
            }
          })
      ]);
      return true;
    } catch (error) {
      console.error('Error deleting utility payment:', error);
      return false;
    }
  }
}