import { PrismaClient, Loan as PrismaLoan, LoanPayment, TransactionStatus } from '@prisma/client';
import { Loan } from '../entities/Loan';
import { LoanPayment as LoanPaymentEntity } from '../entities/Loan';
import { Account } from '../entities/Account';
import { User } from '../entities/User';

const prisma = new PrismaClient();

export class LoanRepository {
  /**
   * Create a new loan with initial payment schedule
   * @param loanData - Loan details
   * @param paymentSchedule - Array of payment amounts and dates
   * @returns Created Loan entity with nested relationships
   */
  async createLoan(
    loanData: {
      userId: string;
      accountId: string;
      principal: number;
      interestRate: number;
      termMonths: number;
      dueDate: Date;
    },
    paymentSchedule: Array<{ dueDate: Date; amount: number }>
  ): Promise<Loan> {
    return prisma.$transaction(async (tx) => {
      // Create main loan record
      const loan = await tx.loan.create({
        data: {
          userId: loanData.userId,
          accountId: loanData.accountId,
          principal: loanData.principal,
          interestRate: loanData.interestRate,
          termMonths: loanData.termMonths,
          amountDue: loanData.principal * (1 + loanData.interestRate / 100),
          dueDate: loanData.dueDate,
          status: 'ACTIVE',
        },
        include: { user: true, account: true }
      });

      // Create scheduled payments
      const payments = await Promise.all(
        paymentSchedule.map((schedule) =>
          tx.loanPayment.create({
            data: {
              loanId: loan.id,
              amount: schedule.amount,
              principalPaid: 0,
              interestPaid: 0,
              paymentDate: schedule.dueDate,
            //   status: 'PENDING',
            }
          })
        )
      );

      return new Loan({
        ...loan,
        user: new User(loan.user),
        account: new Account(loan.account as any),
        payments: payments.map(p => new LoanPaymentEntity(p as any)),
      } as any);
    });
  }

  /**
   * Get loan by ID with full details
   * @param loanId - Loan ID to retrieve
   * @returns Loan entity with all relationships
   */
  async getLoanById(loanId: string): Promise<Loan | null> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: true,
        account: true,
        payments: true,
      }
    });

    if (!loan) return null;

    return new Loan({
      ...loan,
      user: new User(loan.user),
      account: new Account(loan.account as any),
      payments: loan.payments.map(p => new LoanPaymentEntity(p as any)),
    } as any);
  }

  /**
   * Get all loans for a user with pagination
   * @param userId - User ID to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of Loan entities
   */
  async getUserLoans(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Loan[]> {
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: { user: true, account: true, payments: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dueDate: 'asc' }
    });

    return loans.map(loan => new Loan({
      ...loan,
      user: new User(loan.user),
      account: new Account(loan.account as any),
      payments: loan.payments.map(p => new LoanPaymentEntity(p as any)),
    } as any));
  }

  /**
   * Record a loan payment and update loan status
   * @param loanId - Loan ID to update
   * @param paymentData - Payment details
   * @returns Updated Loan entity
   */
  async recordPayment(
    loanId: string,
    paymentData: {
      amount: number;
      principalPaid: number;
      interestPaid: number;
      reference: string;
    }
  ): Promise<Loan> {
    return prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.loanPayment.create({
        data: {
          loanId,
          amount: paymentData.amount,
          principalPaid: paymentData.principalPaid,
          interestPaid: paymentData.interestPaid,
          paymentDate: new Date(),
          reference: paymentData.reference,
        //   status: 'COMPLETED',
        }
      });

      // Update loan status and amounts
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          amountDue: { decrement: payment.amount },
          status: await this.calculateLoanStatus(loanId, tx),
        },
        include: { payments: true, user: true, account: true }
      });

      return new Loan({
        ...updatedLoan,
        user: new User(updatedLoan.user),
        account: new Account(updatedLoan.account as any),
        payments: updatedLoan.payments.map(p => new LoanPaymentEntity(p as any)),
      } as any);
    });
  }

  /**
   * Update loan status based on payments and due date
   * @param loanId - Loan ID to update
   * @returns Updated Loan entity
   */
  async updateLoanStatus(loanId: string): Promise<Loan> {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { payments: true }
      });

      if (!loan) throw new Error('Loan not found');

      const newStatus = await this.calculateLoanStatus(loanId, tx);
      
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: { status: newStatus },
        include: { payments: true, user: true, account: true }
      });

      return new Loan({
        ...updatedLoan,
        user: new User(updatedLoan.user),
        account: new Account(updatedLoan.account as any),
        payments: updatedLoan.payments.map(p => new LoanPaymentEntity(p as any)),
      } as any);
    });
  }

  private async calculateLoanStatus(loanId: string, tx: any) {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
      include: { payments: true }
    });

    if (!loan) return 'CLOSED';

    const totalPaid = loan.payments.reduce(
      (sum: number, p: LoanPayment) => sum + Number(p.amount),
      0
    );

    if (totalPaid >= loan.amountDue) return 'PAID';
    if (new Date() > loan.dueDate) return 'OVERDUE';
    if (totalPaid > 0) return 'PARTIALLY_PAID';
    return 'ACTIVE';
  }

  /**
   * Get all overdue loans
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Array of Loan entities
   */
  async getOverdueLoans(
    page: number = 1,
    pageSize: number = 10
  ): Promise<Loan[]> {
    const loans = await prisma.loan.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'PAID' }
      },
      include: { user: true, account: true, payments: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dueDate: 'asc' }
    });

    return loans.map(loan => new Loan({
      ...loan,
      user: new User(loan.user),
      account: new Account(loan.account as any),
      payments: loan.payments.map(p => new LoanPaymentEntity(p as any)),
    } as any) );
  }
}