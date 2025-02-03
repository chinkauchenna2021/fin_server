import { AccountType, PrismaClient } from '@prisma/client';
import { Account } from '../entities/Account';
import prisma from '../../infrastructure/prismaClient/globalPrisma';

export class AccountRepository {
  /**
   * Create a new account
   * @param account - Partial account data
   * @returns Created Account entity
   */
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

  /**
   * Find all accounts
   * @returns Array of Account entities
   */
  async findAll(): Promise<Account[]> {
    const accounts = await prisma?.account.findMany();
    return accounts?.map((account) => new Account(account as unknown as Account)) as Account[];
  }

  /**
   * Find an account by ID
   * @param id - Account ID
   * @returns Account entity or null
   */
  async findById(id: string): Promise<Account | null> {
    const account = await prisma?.account.findUnique({ where: { id } });
    return account ? new Account(account as unknown as Account) : null;
  }

  /**
   * Find accounts by user ID
   * @param userId - User ID
   * @returns Array of Account entities
   */
  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await prisma?.account.findMany({ where: { userId } });
    return accounts?.map((account) => new Account(account as unknown as Account)) as Account[];
  }

  /**
   * Update account status
   * @param id - Account ID
   * @param status - New status (e.g., 'ACTIVE', 'INACTIVE')
   * @returns Updated Account entity
   */
  async updateStatus(id: string, status: string): Promise<Account | null> {
    const updatedAccount = await prisma?.account.update({
      where: { id },
      data: { isActive: status === 'ACTIVE' },
    });
    return updatedAccount ? new Account(updatedAccount as unknown as Account) : null;
  }
}