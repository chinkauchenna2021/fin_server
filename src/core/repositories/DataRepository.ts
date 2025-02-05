import { PrismaClient, DataPurchase as PrismaDataPurchase, TransactionStatus } from '@prisma/client';
import { DataPurchase } from '../entities/DataPurchase';
import { TelecomNetwork } from '@prisma/client';
import { DataPurchaseValidation } from '../../types/data.types';
import { isValid } from 'zod';

const prisma = new PrismaClient();

export class DataRepository {
  /**
   * Create a new data purchase with associated transaction
   * @param data - Data purchase details and transaction context
   * @returns Newly created DataPurchase entity
   */
  async create(data: {
    network: TelecomNetwork;
    phoneNumber: string;
    dataPlan: string;
    validityDays: number;
    amount: number;
    transaction: {
      userId: string;
      accountId: string;
      status?: TransactionStatus;
    };
  }): Promise<DataPurchase> {
    const dataPurchase = await prisma.dataPurchase.create({
      data: {
        network: data.network,
        phoneNumber: data.phoneNumber,
        dataPlan: data.dataPlan,
        validityDays: data.validityDays,
        amount: data.amount,
        transaction: {
          create: {
            userId: data.transaction.userId,
            // accountId: data.transaction.accountId,
            amount: data.amount,
            type: 'DATA',
            status: data.transaction.status || 'PENDING',
          }
        }
      },
      include: { transaction: true }
    });

    return new DataPurchase(dataPurchase as any);
  }

  /**
   * Find data purchase by ID with associated transaction
   * @param id - Data purchase ID
   * @returns DataPurchase entity or null
   */
  async findById(id: string): Promise<DataPurchase | null> {
    const dataPurchase = await prisma.dataPurchase.findUnique({
      where: { id },
      include: { transaction: true }
    });

    return dataPurchase ? new DataPurchase(dataPurchase as any) : null;
  }

  /**
   * Get all data purchases for a specific user
   * @param userId - User ID to filter by
   * @returns Array of DataPurchase entities
   */
  async findByUserId(userId: string): Promise<DataPurchase[]> {
    const dataPurchases = await prisma.dataPurchase.findMany({
      where: { transaction: { userId } },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' }
    });

    return dataPurchases.map(dp => new DataPurchase(dataPurchases as any));
  }

  /**
   * Get data purchases by phone number
   * @param phoneNumber - Phone number to filter by
   * @returns Array of DataPurchase entities
   */
  async findByPhoneNumber(phoneNumber: string): Promise<DataPurchase[]> {
    const dataPurchases = await prisma.dataPurchase.findMany({
      where: { phoneNumber },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' }
    });

    return dataPurchases.map(dp => new DataPurchase(dataPurchases as any));
  }

  /**
   * Update transaction status for a data purchase
   * @param id - Data purchase ID
   * @param status - New transaction status
   * @returns Updated DataPurchase entity or null
   */
  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<DataPurchase | null> {
    const dataPurchase = await prisma.dataPurchase.update({
      where: { id },
      data: { transaction: { update: { status } } },
      include: { transaction: true }
    });

    return dataPurchase ? new DataPurchase(dataPurchase as any) : null;
  }

  /**
   * Delete a data purchase and its associated transaction
   * @param id - Data purchase ID
   * @returns True if successful deletion
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.dataPurchase.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Failed to delete data purchase:', error);
      return false;
    }
  }

  /**
   * Get data purchases by network provider
   * @param network - Telecom network to filter by
   * @returns Array of DataPurchase entities
   */
  async findByNetwork(network: TelecomNetwork): Promise<DataPurchase[]> {
    const dataPurchases = await prisma.dataPurchase.findMany({
      where: { network },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' }
    });

    return dataPurchases.map(dp => new DataPurchase(dataPurchases as any));
  }

  /**
   * Get active data plans (not expired)
   * @param userId - User ID to filter by
   * @returns Array of active DataPurchase entities
   */
  async findActivePurchases(userId: string, page: number, pageSize: number): Promise<DataPurchase[]> {
    const dataPurchases = await this.findByUserId(userId);
    return dataPurchases.filter(dp => 
      new Date(dp.createdAt.getTime() + dp.validityDays * 86400000) > new Date()
    );
  }

  // phoneNumber,
  // planId,
  // provider


    // export interface DataPurchaseValidation {
    //   isValid: boolean;            // Whether the purchase is valid
    //   validationMessage: string;   // Message describing the validation result
    //   planDetails?: PlanDetails;   // Optional details about the plan
    //   estimatedDelivery?: string;  // Optional estimated delivery time (ISO format)
    // }
    // planData
    // name: string;        // Name of the data plan (e.g., "2GB Daily Plan")
    // dataAmount: string;  // Amount of data (e.g., "2GB")
    // validity: string;    // Validity period (e.g., "24 hours")
    // price: number;       


  async validatePurchase(phoneNumber: string, planId: string, provider: string): Promise<DataPurchaseValidation | any> {
    const dataPurchases = await this.findById(phoneNumber);
    // DataPurchaseValidation
    // return dataPurchases.filter(dp => 
    //   new Date(dp.createdAt.getTime() + dp.validityDays * 86400000) > new Date()
    // );

    if(dataPurchases?.id == undefined || dataPurchases.id == null){
       return {
         isValid:false,
         validationMessage:" Data Purchase is not valid",
    }
  }else{

    return {
      isValid:true,
      validationMessage:" Data Purchase is valid",
      planDetails:{
           name: dataPurchases?.dataPlan,       
           dataAmount: dataPurchases?.parseDataPlanSize,
           validity: dataPurchases?.isPlanValid,
           price: dataPurchases?.amount,
         },
         estimatedDelivery:dataPurchases?.createdAt
       }
      }
  }
}