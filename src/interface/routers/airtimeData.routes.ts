import express from 'express';
import {
  purchaseAirtime,
  purchaseData,
  getAirtimePurchases,
  getDataPurchases
} from '../../controllers/airtime.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { airtimeSchema, dataSchema } from '../../validations/airtime.validation';

const router = express.Router();

router.use(authMiddleware);

router.post('/airtime', validate(airtimeSchema), purchaseAirtime);
router.post('/data', validate(dataSchema), purchaseData);
router.get('/airtime', getAirtimePurchases);
router.get('/data', getDataPurchases);

export default router;