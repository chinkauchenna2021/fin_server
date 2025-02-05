import { z } from 'zod';
import { DataPurchaseValidation } from '../types/data.types';

// Base schema for data purchase validation
export const dataPurchaseSchema = z.object({
  phoneNumber: z.string()
    .min(10)
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
  
  planId: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid plan ID format'),
    
  provider: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/, 'Invalid provider name format'),
    
  amount: z.number()
    .positive()
    .max(1000000, 'Amount too high'),
    
  userId: z.string().uuid().optional(), // Optional as it will come from auth
  status: z.enum(['pending', 'success', 'failed']).optional(), // Optional as it will be set by system
  reference: z.string().uuid().optional() // Optional as it will be generated
});

// Schema for purchase validation request
export const validateDataPurchaseSchema = z.object({
  phoneNumber: dataPurchaseSchema.shape.phoneNumber,
  planId: dataPurchaseSchema.shape.planId,
  provider: dataPurchaseSchema.shape.provider
});

// Type inference from schemas
export type DataPurchaseInput = z.infer<typeof dataPurchaseSchema>;
export type ValidateDataPurchaseInput = z.infer<typeof validateDataPurchaseSchema>;

// Validation function for DataPurchaseValidation response
export const dataPurchaseValidationResponseSchema = z.object({
  isValid: z.boolean(),
  validationMessage: z.string(),
  estimatedDelivery: z.string().datetime().optional(),
  planDetails: z.object({
    name: z.string(),
    dataAmount: z.string(),
    validity: z.string(),
    price: z.number()
  }).optional()
}) satisfies z.ZodType<DataPurchaseValidation>;