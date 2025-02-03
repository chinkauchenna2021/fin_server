import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus
} from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { transactionSchema } from '../validations/transaction.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(transactionSchema), createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id/status', updateTransactionStatus);

export default router;