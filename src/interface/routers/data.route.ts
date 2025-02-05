import express from 'express';
import { DataController } from '../../controllers/data.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware as any);
router.post('/apply', DataController.purchaseData);
router.get('/', DataController.getDataPurchases);
router.get('/:id', DataController.getDataPurchaseById as any);
router.post('/:id/validatedata', DataController.validateDataPurchase);

export default router;