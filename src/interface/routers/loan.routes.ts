import express from 'express';
import {
  applyForLoan,
  getLoans,
  getLoanById,
  makeLoanPayment
} from '../controllers/loan.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loanApplicationSchema, loanPaymentSchema } from '../validations/loan.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/apply', validate(loanApplicationSchema), applyForLoan);
router.get('/', getLoans);
router.get('/:id', getLoanById);
router.post('/:id/payments', validate(loanPaymentSchema), makeLoanPayment);

export default router;