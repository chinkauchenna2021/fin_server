import { TelecomNetwork, TransactionStatus } from '@prisma/client';
import { Transaction } from './Transaction';

export class DataPurchase {
  "id": string;
  "transactionId": string;
  "transaction": Transaction; // Relationship to Transaction entity
  "network": TelecomNetwork;
  "phoneNumber": string;
  "dataPlan": string;
  "validityDays": number;
  "amount": number;
  "createdAt": Date;

  constructor(data: Partial<DataPurchase>) {
    Object.assign(this, data);
    
    // Initialize nested Transaction entity if provided
    if (data.transaction) {
      this.transaction = new Transaction(data.transaction);
    }
  }

  // Validate phone number format
  isValidPhoneNumber(): boolean {
    const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format validation
    return regex.test(this.phoneNumber);
  }

  // Parse data plan size from plan string (e.g., "2GB 30-day")
  parseDataPlanSize(): number | null {
    const match = this.dataPlan.match(/(\d+(\.\d+)?)\s?(GB|MB)/i);
    if (!match) return null;
    return parseFloat(match[1]);
  }

  // Calculate cost per GB (if applicable)
  getCostPerGb(): number | null {
    const sizeGb = this.parseDataPlanSize();
    if (!sizeGb || sizeGb <= 0) return null;
    return this.amount / sizeGb;
  }

  // Check if data plan is still valid
  isPlanValid(): boolean {
    const expirationDate = new Date(this.createdAt);
    expirationDate.setDate(expirationDate.getDate() + this.validityDays);
    return new Date() < expirationDate;
  }

  // Validate data plan format
  isValidDataPlanFormat(): boolean {
    return /^\d+(\.\d+)?\s?(GB|MB)\s.+/.test(this.dataPlan);
  }
}