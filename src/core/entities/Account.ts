export class Account {
    "id": string;
    "userId": string;
    "accountNumber": string;
    "type": string;
    "currencyCode": string;
    "balance": number;
    "ledgerBalance": number;
    "isActive": boolean;
    "createdAt": Date;
    "updatedAt": Date;
  
    constructor(data: Partial<Account>) {
      Object.assign(this, data);
    }
  }