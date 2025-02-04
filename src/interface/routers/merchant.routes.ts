import express from 'express';
import {
    MerchantController
} from '../../controllers/merchant.controller';
import { authMiddleware} from '../../middleware/auth.middleware';
import { merchantMiddleware } from '../../middleware/merchant.middleware';
import { validate } from '../../middleware/validation.middleware';
import { merchantSchema } from '../../validations/merchant.validation';

const router = express.Router();

router.use(authMiddleware as any);

router.post('/register', merchantMiddleware as any, validate(merchantSchema),MerchantController.createMerchant);
router.get('/',  MerchantController.getMerchants);
router.get('/:id', MerchantController.getMerchantById as any);
router.put('/:id', merchantMiddleware as any ,MerchantController.updateMerchant as any);
router.post('/:id/regenerate-key', merchantMiddleware as any, MerchantController.generateApiKey as any);

export default router;