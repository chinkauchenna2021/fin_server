import express from 'express';
import { UtilityController } from '../../controllers/utility.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { utilityPaymentSchema } from '../../validations/utility.validation';

const router = express.Router();

router.use(authMiddleware as any);
router.post('/', validate(utilityPaymentSchema), UtilityController.createUtilityPayment);
router.get('/', UtilityController.getUtilityPayments);
router.get('/:id', UtilityController.getUtilityPaymentById as any);
router.put('/:id', validate(utilityPaymentSchema), UtilityController.updateUtilityPayment as any);

export default router;