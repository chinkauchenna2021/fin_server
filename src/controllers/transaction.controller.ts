import { Request, Response } from 'express';
import { TransactionRepository } from '../core/repositories/TransactionRepository';
import { TransactionStatus, TransactionType } from '@prisma/client';

const transactionRepository = new TransactionRepository();

export class TransactionController {
  /**
   * Create a new transaction
   */
  static async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const transactionData = {
        ...req.body,
        userId,
        amount: Number(req.body.amount),
        type: req.body.type as TransactionType,
        currencyCode: req.body.currencyCode || 'USD'
      };

      const transaction = await transactionRepository.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(400).json({ error: 'Failed to create transaction' });
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(req: Request, res: Response) {
    try {
      const transaction = await transactionRepository.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Authorization check
      if (transaction.user.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to retrieve transaction' });
    }
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const transactions = await transactionRepository.getUserTransactions(userId, page, pageSize);
      res.json(transactions);
    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  }

  /**
   * Get merchant transactions
   */
  static async getMerchantTransactions(req: Request, res: Response) {
    try {
      const merchantId = req.params.merchantId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const transactions = await transactionRepository.getMerchantTransactions(
        merchantId,
        page,
        pageSize
      );
      res.json(transactions);
    } catch (error) {
      console.error('Get merchant transactions error:', error);
      res.status(500).json({ error: 'Failed to retrieve merchant transactions' });
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(req: Request, res: Response) {
    try {
      const transactionId = req.params.id;
      const status = req.body.status as TransactionStatus;

      const updatedTransaction = await transactionRepository.updateTransactionStatus(
        transactionId,
        status
      );

      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(updatedTransaction);
    } catch (error) {
      console.error('Update transaction status error:', error);
      res.status(400).json({ error: 'Failed to update transaction status' });
    }
  }

  /**
   * Delete transaction
   */
  static async deleteTransaction(req: Request, res: Response) {
    try {
      const success = await transactionRepository.deleteTransaction(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}