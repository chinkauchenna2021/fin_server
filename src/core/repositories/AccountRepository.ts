import { AccountType, PrismaClient } from '@prisma/client';
import { Account } from '../entities/Account';
import prisma from '../../infrastructure/prismaClient/globalPrisma';

export class AccountRepository {
  async create(account: Partial<Account>): Promise<Account> {
    const newAccount = await prisma?.account.create({
      data: {
        userId: account.userId!,
        accountNumber: account.accountNumber!,
        type: AccountType.WALLET,
        currencyCode: account.currencyCode!,
        balance: account.balance!,
        ledgerBalance: account.ledgerBalance!,
      },
    });
    return new Account(newAccount as unknown as Account);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await prisma?.account.findMany({ where: { userId } });
    return accounts?.map((account) => new Account(account as unknown as Account )) as Account[];
  }
}