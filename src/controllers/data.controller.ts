import { Request, Response } from 'express';
import { DataRepository } from '../core/repositories/DataRepository';
import { DataPurchaseValidation } from '../types/data.types';

const dataRepository = new DataRepository();

export class DataController {
  /**
   * Purchase data bundle
   */
  static async purchaseData(req: Request, res: Response) {
    try {
      const { phoneNumber, planId, amount, provider } = req.body;
      const userId = req.userId!;

      const purchase = await dataRepository.create({
          phoneNumber,
          amount: Number(amount),
          network: provider,
          dataPlan: planId,
          validityDays: 0,
          transaction: {
              userId: userId,
              accountId: userId,
              status: undefined
          }
      });

      res.status(201).json(purchase);
    } catch (error) {
      console.error('Data purchase error:', error);
      res.status(400).json({ error: 'Failed to process data purchase' });
    }
  }

  /**
   * Get user's data purchase history
   */
  static async getDataPurchases(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const purchases = await dataRepository.findActivePurchases(userId, page, pageSize);
      res.json(purchases);
    } catch (error) {
      console.error('Get data purchases error:', error);
      res.status(500).json({ error: 'Failed to retrieve data purchases' });
    }
  }

  /**
   * Get specific data purchase details
   */
  static async getDataPurchaseById(req: Request, res: Response) {
    try {
      const purchaseId = req.params.id;
      const purchase = await dataRepository.findById(purchaseId);

      if (!purchase) {
        return res.status(404).json({ error: 'Data purchase not found' });
      }

      if (purchase.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(purchase);
    } catch (error) {
      console.error('Get data purchase error:', error);
      res.status(500).json({ error: 'Failed to retrieve data purchase details' });
    }
  }

  /**
   * Validate data purchase (pre-check)
   */
  static async validateDataPurchase(req: Request, res: Response) {
    try {
      const { phoneNumber, planId, provider } = req.body;
      
      const validation: DataPurchaseValidation = await dataRepository.validatePurchase(
        phoneNumber,
        planId,
        provider
      );

      res.json(validation);
    } catch (error) {
      console.error('Validation error:', error);
      res.status(400).json({ error: 'Failed to validate data purchase' });
    }
  }
}