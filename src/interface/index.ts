import express from 'express';
import authRouter from './routers/auth.routes';
import userRouter from './routers/user.routes';
import accountRouter from './routers/account.routes';
import transactionRouter from './routers/transaction.routes';
import loanRouter from './routers/loan.routes';
import merchantRouter from './routers/merchant.routes';
import utilityRouter from './routers/utility.routes';
import airtimeDataRouter from './routers/airtimeData.routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/accounts', accountRouter);
router.use('/transactions', transactionRouter);
router.use('/loans', loanRouter);
router.use('/merchants', merchantRouter);
router.use('/utilities', utilityRouter);
router.use('/services', airtimeDataRouter);

export default router;