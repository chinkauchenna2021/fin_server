import express from 'express';
import { LoanController } from '../../controllers/loan.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware as any);
router.post('/apply', LoanController.applyForLoan);
router.get('/', LoanController.getLoans);
router.get('/:id', LoanController.getLoanById as any);
router.post('/:id/payments', LoanController.makeLoanPayment);

export default router;