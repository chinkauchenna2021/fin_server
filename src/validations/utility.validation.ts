import { z } from 'zod';

export const utilityPaymentSchema = z.object({
  utilityType: z.string().min(2).max(50),
  provider: z.string().min(2).max(50),
  customerId: z.string().min(2).max(50),
  meterNumber: z.string().optional(),
  amount: z.number().positive(),
  servicePeriod: z.string().optional(),
  reference: z.string().optional(),
  accountId: z.string().min(1),
});