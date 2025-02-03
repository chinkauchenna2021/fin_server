import { UtilityType, UtilityProvider, TransactionStatus } from '@prisma/client';
import { Transaction } from './Transaction';

export class UtilityPayment {
  "id": string;
  "transactionId": string;
  "transaction": Transaction; 
  "utilityType": UtilityType;
  "provider": UtilityProvider;
  "customerId": string;
  "meterNumber": string | null;
  "amount": number;
  "servicePeriod": string | null;
  "reference": string | null;
  "createdAt": Date;

  constructor(data: Partial<UtilityPayment>) {
    Object.assign(this, data);
    
    // Initialize nested Transaction entity if provided
    if (data.transaction) {
      this.transaction = new Transaction(data.transaction);
    }
  }

  // Validate customer ID format
  isValidCustomerId(): boolean {
    return /^[A-Z0-9]{6,20}$/.test(this.customerId); // Example: Alphanumeric, 6-20 characters
  }

  // Validate meter number format (if applicable)
  isValidMeterNumber(): boolean {
    if (!this.meterNumber) return true; // Optional field
    return /^[A-Z0-9]{8,15}$/.test(this.meterNumber); // Example: Alphanumeric, 8-15 characters
  }

  // Validate service period format (e.g., "January 2024")
  isValidServicePeriod(): boolean {
    if (!this.servicePeriod) return true; // Optional field
    return /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/.test(
      this.servicePeriod
    );
  }

  // Validate reference number format
  isValidReference(): boolean {
    if (!this.reference) return true; // Optional field
    return /^[A-Z0-9]{10,20}$/.test(this.reference); // Example: Alphanumeric, 10-20 characters
  }

  // Validate all fields
  validate(): string[] {
    const errors: string[] = [];

    if (!this.isValidCustomerId()) {
      errors.push('Customer ID must be 6-20 alphanumeric characters.');
    }

    if (!this.isValidMeterNumber()) {
      errors.push('Meter number must be 8-15 alphanumeric characters.');
    }

    if (!this.isValidServicePeriod()) {
      errors.push('Service period must be in the format "Month YYYY".');
    }

    if (!this.isValidReference()) {
      errors.push('Reference number must be 10-20 alphanumeric characters.');
    }

    return errors;
  }

  // Check if payment is for electricity
  isElectricityPayment(): boolean {
    return this.utilityType === 'ELECTRICITY';
  }

  // Check if payment is for water
  isWaterPayment(): boolean {
    return this.utilityType === 'WATER';
  }

  // Check if payment is for internet
  isInternetPayment(): boolean {
    return this.utilityType === 'INTERNET';
  }

  // Generate a service period from a date
  static generateServicePeriod(date: Date): string {
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
}