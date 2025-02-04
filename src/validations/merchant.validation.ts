import { z } from 'zod';

export const merchantSchema = z.object({
  businessName: z.string().min(2).max(100),
  website: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
  successUrl: z.string().url().optional(),
  failureUrl: z.string().url().optional(),
});