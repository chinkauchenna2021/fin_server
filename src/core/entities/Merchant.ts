import { User } from './User';
import { Transaction } from './Transaction';

export class Merchant {
  "id": string;
  "userId": string;
  "user": User; // Relationship to User entity
  "businessName": string;
  "website": string | null;
  "apiKey": string;
  "webhookUrl": string | null;
  "successUrl": string | null;
  "failureUrl": string | null;
  "transactions": Transaction[]; // Relationship to Transaction entity
  "createdAt": Date;
  "updatedAt": Date;

  constructor(data: Partial<Merchant>) {
    Object.assign(this, data);
    
    // Initialize nested User entity if provided
    if (data.user) {
      this.user = new User(data.user);
    }

    // Initialize nested Transaction entities if provided
    if (data.transactions) {
      this.transactions = data.transactions.map(t => new Transaction(t));
    }
  }

  // Validate business name format
  isValidBusinessName(): boolean {
    return /^[a-zA-Z0-9\s\-&.,]{2,100}$/.test(this.businessName);
  }

  // Validate website URL format
  isValidWebsite(): boolean {
    if (!this.website) return true; // Optional field
    const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return regex.test(this.website);
  }

  // Validate webhook URL format
  isValidWebhookUrl(): boolean {
    if (!this.webhookUrl) return true; // Optional field
    const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return regex.test(this.webhookUrl);
  }

  // Validate API key format
  isValidApiKey(): boolean {
    return /^[a-f0-9]{32}$/.test(this.apiKey); // Example: 32-character hex string
  }

  // Generate a new API key
  static generateApiKey(): string {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  // Validate all fields
  validate(): string[] {
    const errors: string[] = [];

    if (!this.isValidBusinessName()) {
      errors.push('Business name must be 2-100 characters long and contain only letters, numbers, spaces, and basic punctuation.');
    }

    if (!this.isValidWebsite()) {
      errors.push('Website URL is invalid.');
    }

    if (!this.isValidWebhookUrl()) {
      errors.push('Webhook URL is invalid.');
    }

    if (!this.isValidApiKey()) {
      errors.push('API key is invalid.');
    }

    return errors;
  }

  // Check if merchant is active (has transactions in the last 30 days)
  isActive(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.transactions.some(
      (transaction) => transaction.createdAt > thirtyDaysAgo
    );
  }
}