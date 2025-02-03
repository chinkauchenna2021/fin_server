import express from 'express';
import {
  registerMerchant,
  getMerchants,
  getMerchantById,
  updateMerchant,
  regenerateApiKey
} from '../controllers/merchant.controller';
import { authMiddleware, merchantMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { merchantSchema } from '../validations/merchant.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/register', merchantMiddleware, validate(merchantSchema), registerMerchant);
router.get('/', getMerchants);
router.get('/:id', getMerchantById);
router.put('/:id', merchantMiddleware, updateMerchant);
router.post('/:id/regenerate-key', merchantMiddleware, regenerateApiKey);

export default router;