import express from 'express';
import {
  createUtilityPayment,
  getUtilityPayments,
  getUtilityPaymentById
} from '../controllers/utility.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { utilityPaymentSchema } from '../validations/utility.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(utilityPaymentSchema), createUtilityPayment);
router.get('/', getUtilityPayments);
router.get('/:id', getUtilityPaymentById);

export default router;