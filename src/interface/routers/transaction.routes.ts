import express from 'express';
import {
       TransactionController
} from '../../controllers/transaction.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { transactionSchema } from '../../validations/transaction.validation';

const router = express.Router();
router.use(authMiddleware as any);

router.post('/', validate(transactionSchema), TransactionController.createTransaction);
router.get('/', TransactionController.getUserTransactions);
router.get('/merchant', TransactionController.getMerchantTransactions);
router.get('/:id', TransactionController.getTransactionById as any);
router.patch('/:id/status', TransactionController.updateTransactionStatus as any);

export default router;