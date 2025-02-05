// src/validations/user.validation.ts

import { z } from 'zod';

// Common reusable schemas
const emailSchema = z.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters");
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password cannot exceed 50 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number cannot exceed 15 digits")
  .regex(/^\+?[0-9]+$/, "Invalid phone number format");

// Schema for updating user profile
export const updateUserSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z]+$/, "First name can only contain letters")
    .optional(),

  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z]+$/, "Last name can only contain letters")
    .optional(),

  email: emailSchema.optional(),

  phone: phoneSchema.optional(),

  password: passwordSchema.optional(),

  profilePicture: z.string()
    .url("Invalid URL format for profile picture")
    .optional(),

  address: z.object({
    street: z.string().max(100).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    postalCode: z.string().max(20).optional()
  }).optional(),

  preferences: z.object({
    newsletter: z.boolean().optional(),
    notifications: z.boolean().optional()
  }).optional()
}).strict(); // Disallow unknown fields

// Type inference for TypeScript
export type UpdateUserInput = z.infer<typeof updateUserSchema>;