import { z } from "zod";

export const userRoleSchema = z.enum([
  "CUSTOMER",
  "BUSINESS",
  "DRIVER",
  "DELIVERY_COMPANY",
  "ADMIN",
]);

export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: userRoleSchema.default("CUSTOMER"),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  code: z.string().length(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
