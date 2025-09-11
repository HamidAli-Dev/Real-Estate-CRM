import { z } from "zod";

export const emailSchema = z
  .email("Invalid email address")
  .trim()
  .min(1)
  .max(255);

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(50, "Password must not exceed 50 characters");

export const registerOwnerSchema = z.object({
  name: z.string().trim().min(3, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});
