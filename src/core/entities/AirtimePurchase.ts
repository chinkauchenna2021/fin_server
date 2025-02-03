import { TelecomNetwork, TransactionStatus } from '@prisma/client';
import { Transaction } from './Transaction';

export class AirtimePurchase {
  "id": string;
  "transactionId": string;
  "transaction": Transaction; 
  "network": TelecomNetwork;
  "phoneNumber": string;
  "amount": number;
  "discount": number;
  "createdAt": Date;

  constructor(data: Partial<AirtimePurchase>) {
    Object.assign(this, data);
    
    // Initialize nested Transaction entity if provided
    if (data.transaction) {
      this.transaction = new Transaction(data.transaction);
    }
  }

  // Business logic example: Validate phone number format
  isValidPhoneNumber(): boolean {
    const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format validation
    return regex.test(this.phoneNumber);
  }

  // Business logic example: Calculate final amount after discount
  getFinalAmount(): number {
    return this.amount - this.discount;
  }

  // Business logic example: Check if purchase is recent
  isRecentPurchase(maxMinutes = 5): boolean {
    const now = new Date();
    const diffInMinutes = (now.getTime() - this.createdAt.getTime()) / (1000 * 60);
    return diffInMinutes <= maxMinutes;
  }
}