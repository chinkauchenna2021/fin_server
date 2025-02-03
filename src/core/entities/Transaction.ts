import { AirtimePurchase } from "@prisma/client";
import { AirtimePurchase as Airtime } from "./AirtimePurchase";
import { Decimal } from "@prisma/client/runtime/library";
import { DataPurchase } from "./DataPurchase";

export class Transaction {
    "id": string;
    "fromAccountId": string | null;
    "toAccountId": string | null;
    "amount": number;
    "currencyCode": string;
    "exchangeRate": number | null;
    "type": string;
    "status": string;
    "description": string | null;
    "reference": string | null;
    "metadata": any;
    "createdAt": Date;
    "updatedAt": Date;
  
    airtimePurchase?: AirtimePurchase; // Add this relationship
    dataPurchase?: DataPurchase;

  constructor(data: Partial<Transaction>) {
    Object.assign(this, data);
    
    if (data.airtimePurchase) {
      this.airtimePurchase = new Airtime(data.airtimePurchase as any) as any;
    }
    if (data.dataPurchase) {
        this.dataPurchase = new DataPurchase(data.dataPurchase as unknown as DataPurchase);
      }
  }
  }