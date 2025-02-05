import { Request, Response } from 'express';
import { UtilityRepository } from '../core/repositories/UtilityRepository';
import { UtilityPayment } from '../core/entities/UtilityPayment';

const utilityRepository = new UtilityRepository();

export class UtilityController {
  /**
   * Create a new utility payment
   */
  static async createUtilityPayment(req: Request, res: Response) {
    try {
      const { utilityType, provider, customerId, meterNumber, amount, servicePeriod, reference } = req.body;
      const userId = req.userId!; // Ensure userId is available from auth middleware

      const utilityPayment = await utilityRepository.createUtilityPayment({
        utilityType,
        provider,
        customerId,
        meterNumber,
        amount: Number(amount),
        servicePeriod,
        reference,
        transaction: {
          userId,
          accountId: req.body.accountId,
          status: 'PENDING',
        },
      });

      res.status(201).json(utilityPayment);
    } catch (error) {
      console.error('Utility payment creation error:', error);
      res.status(400).json({ error: 'Failed to process utility payment' });
    }
  }

  /**
   * Get all utility payments for the authenticated user
   */
  static async getUtilityPayments(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const utilityPayments = await utilityRepository.findById(userId);
      res.json(utilityPayments);
    } catch (error) {
      console.error('Get utility payments error:', error);
      res.status(500).json({ error: 'Failed to retrieve utility payments' });
    }
  }

  /**
   * Get utility payment details by ID
   */
  static async getUtilityPaymentById(req: Request, res: Response) {
    try {
      const utilityPaymentId = req.params.id;
      const utilityPayment = await utilityRepository.findById(utilityPaymentId);

      if (!utilityPayment) {
        return res.status(404).json({ error: 'Utility payment not found' });
      }

      // Verify ownership
      if (utilityPayment.transaction.user.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(utilityPayment);
    } catch (error) {
      console.error('Get utility payment error:', error);
      res.status(500).json({ error: 'Failed to retrieve utility payment details' });
    }
  }

  /**
   * Update utility payment details
   */
  static async updateUtilityPayment(req: Request, res: Response) {
    try {
      const utilityPaymentId = req.params.id;
      const updateData = req.body;

      const updatedUtilityPayment = await utilityRepository.update(utilityPaymentId, updateData);
      if (!updatedUtilityPayment) {
        return res.status(404).json({ error: 'Utility payment not found' });
      }

      res.json(updatedUtilityPayment);
    } catch (error) {
      console.error('Update utility payment error:', error);
      res.status(400).json({ error: 'Failed to update utility payment' });
    }
  }
}