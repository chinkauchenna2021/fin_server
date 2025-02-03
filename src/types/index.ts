import { TelecomNetwork, TransactionStatus } from "@prisma/client";

export type DataPurchaseCreateInput = {
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
  };