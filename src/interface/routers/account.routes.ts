import express from 'express';
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccountStatus
} from '../controllers/account.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createAccountSchema } from '../validations/account.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createAccountSchema), createAccount);
router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.patch('/:id/status', updateAccountStatus);

export default router;