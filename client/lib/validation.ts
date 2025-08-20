import { z } from "zod";

export const editWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Business name must be at least 3 characters" })
    .max(100, { message: "Business name cannot exceed 100 characters" }),
  domain: z
    .string()
    .trim()
    .min(3, { message: "Domain must be at least 3 characters" })
    .max(50, { message: "Domain cannot exceed 50 characters" })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Domain can only contain letters, numbers, and hyphens",
    })
    .transform((val) => val.toLowerCase())
    .optional(), // Domain is optional for editing
});

// export const loginSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters" }),
//   workspaceDomain: z.string().optional(),
// });

// export const registerSchema = z
//   .object({
//     name: z
//       .string()
//       .trim()
//       .min(2, { message: "Name must be at least 2 characters" })
//       .max(100, { message: "Name cannot exceed 100 characters" }),
//     email: z.string().email({ message: "Please enter a valid email address" }),
//     password: z
//       .string()
//       .min(6, { message: "Password must be at least 6 characters" }),
//     confirmPassword: z
//       .string()
//       .min(6, { message: "Password must be at least 6 characters" }),
//     workspaceDomain: z.string().optional(),
//     role: z.string().optional(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

export type EditWorkspaceInput = z.infer<typeof editWorkspaceSchema>;
// export type LoginInput = z.infer<typeof loginSchema>;
// export type RegisterInput = z.infer<typeof registerSchema>;
