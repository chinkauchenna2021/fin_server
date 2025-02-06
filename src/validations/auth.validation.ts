// src/validations/auth.validation.ts

import { z } from 'zod';

// Reusable schemas
const emailSchema = z.string()
  .email("Invalid email address")
  .max(100, "Email cannot exceed 100 characters");

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password cannot exceed 50 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Schema for user registration
export const registerSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z]+$/, "First name can only contain letters"),

  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z]+$/, "Last name can only contain letters"),

  email: emailSchema,

  password: passwordSchema,

  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"] // Attach the error to the confirmPassword field
})

// Schema for user login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
}).strict(); // Disallow unknown fields

// Type inference for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;