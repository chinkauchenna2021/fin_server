import { Request, Response } from 'express';
import { MerchantRepository } from '../core/repositories/MerchantRepository';
// import { MerchantStatus } from '../core/entities/Merchant';

const merchantRepository = new MerchantRepository();

export class MerchantController {

  static async createMerchant(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { businessName, address, phone, email } = req.body;

      const merchant = await merchantRepository.createMerchant({
        userId,
        businessName,
      });

      res.status(201).json(merchant);
    } catch (error) {
      console.error('Create merchant error:', error);
      res.status(400).json({ error: 'Failed to create merchant profile' });
    }
  }

  /**
   * Get merchant profile by ID
   */
  static async getMerchantById(req: Request, res: Response) {
    try {
      const merchantId = req.params.id;
      const merchant = await merchantRepository.findById(merchantId);

      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      // Verify ownership or admin access
      if (merchant.user.id !== req.userId && !req.userIsAdmin) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(merchant);
    } catch (error) {
      console.error('Get merchant error:', error);
      res.status(500).json({ error: 'Failed to retrieve merchant' });
    }
  }

  /**
   * Update merchant profile details
   */
  static async updateMerchant(req: Request, res: Response) {
    try {
      const merchantId = req.params.id;
      const updateData = req.body;

      const merchant = await merchantRepository.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      if (merchant.user.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      const updatedMerchant = await merchantRepository.updateMerchant(
        merchantId,
        updateData
      );
      res.json(updatedMerchant);
    } catch (error) {
      console.error('Update merchant error:', error);
      res.status(400).json({ error: 'Failed to update merchant profile' });
    }
  }

  /**
   * Get all merchants (Admin only)
   */
  static async getMerchants(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const merchants = await merchantRepository.getAllMerchants(page, pageSize);
      res.json(merchants);
    } catch (error) {
      console.error('Get merchants error:', error);
      res.status(500).json({ error: 'Failed to retrieve merchants' });
    }
  }

  /**
   * Update merchant status (Admin only)
   */
  static async updateMerchantStatus(req: Request, res: Response) {
    try {
      const merchantId = req.params.id;
      const { status } = req.body;

      const updatedMerchant = await merchantRepository.updateMerchant(
        merchantId,
        status
      );
      res.json(updatedMerchant);
    } catch (error) {
      console.error('Update merchant status error:', error);
      res.status(400).json({ error: 'Failed to update merchant status' });
    }
  }

  /**
   * Get authenticated user's merchant profile
   */
  static async getMyMerchant(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const merchant = await merchantRepository.findById(userId);

      if (!merchant) {
        return res.status(404).json({ error: 'Merchant profile not found' });
      }

      res.json(merchant);
    } catch (error) {
      console.error('Get my merchant error:', error);
      res.status(500).json({ error: 'Failed to retrieve merchant profile' });
    }
  }


  static async generateApiKey(req: Request, res: Response) {
    try {
      const merchantId = req.params.id;
      const userId = req.userId!;

      // Verify merchant ownership
      const merchant = await merchantRepository.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      if (merchant.user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Generate new API key
      const updatedMerchant = await merchantRepository.regenerateApiKey(merchantId);
      
      res.json({
        message: 'API key regenerated successfully',
        apiKey: updatedMerchant?.apiKey
      });
    } catch (error) {
      console.error('API key generation error:', error);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  }

}