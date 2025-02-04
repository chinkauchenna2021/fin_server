import { Request, Response } from 'express';
import { LoanRepository } from '../core/repositories/LoanRepository';
import { LoanPayment } from '../core/entities/Loan';

const loanRepository = new LoanRepository();

export class LoanController {
  /**
   * Apply for a new loan
   */
  static async applyForLoan(req: Request, res: Response) {
    try {
      const { principal, interestRate, termMonths, dueDate, paymentSchedule } = req.body;
      const userId = req.userId!; // Ensure userId is available from auth middleware
      const accountId = req.body.accountId;

      const loan = await loanRepository.createLoan(
        {
          userId,
          accountId,
          principal: Number(principal),
          interestRate: Number(interestRate),
          termMonths: Number(termMonths),
          dueDate: new Date(dueDate),
        },
        paymentSchedule.map((p: any) => ({
          dueDate: new Date(p.dueDate),
          amount: Number(p.amount),
        }))
      );

      res.status(201).json(loan);
    } catch (error) {
      console.error('Loan application error:', error);
      res.status(400).json({ error: 'Failed to process loan application' });
    }
  }

  /**
   * Get all loans for the authenticated user
   */
  static async getLoans(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const loans = await loanRepository.getUserLoans(userId, page, pageSize);
      res.json(loans);
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({ error: 'Failed to retrieve loans' });
    }
  }

  /**
   * Get loan details by ID
   */
  static async getLoanById(req: Request, res: Response) {
    try {
      const loanId = req.params.id;
      const loan = await loanRepository.getLoanById(loanId);

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      // Verify ownership
      if (loan.user.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(loan);
    } catch (error) {
      console.error('Get loan error:', error);
      res.status(500).json({ error: 'Failed to retrieve loan details' });
    }
  }

  /**
   * Make a loan payment
   */
  static async makeLoanPayment(req: Request, res: Response) {
    try {
      const loanId = req.params.id;
      const paymentData: Partial<LoanPayment> = {
        amount: Number(req.body.amount),
        principalPaid: Number(req.body.principalPaid),
        interestPaid: Number(req.body.interestPaid),
        reference: req.body.reference,
        paymentDate: new Date(),
      };

      const updatedLoan = await loanRepository.recordPayment(loanId, paymentData as any);
      
      res.status(201).json(updatedLoan);
    } catch (error) {
      console.error('Loan payment error:', error);
      res.status(400).json({ error: 'Failed to process loan payment' });
    }
  }
}