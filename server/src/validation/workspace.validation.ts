import { z } from "zod";

export const createWorkspaceSchema = z.object({
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
    .transform((val) => val.toLowerCase()),
});

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

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type EditWorkspaceInput = z.infer<typeof editWorkspaceSchema>;
