import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Business name must be at least 3 characters" })
    .max(100, { message: "Business name cannot exceed 100 characters" }),
});

export const editWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Business name must be at least 3 characters" })
    .max(100, { message: "Business name cannot exceed 100 characters" }),
});

export const inviteUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["Admin", "Manager", "Agent"]),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission is required" }),
});

export const inviteUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["Admin", "Manager", "Agent"]),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission is required" }),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Agent"]),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission is required" }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type EditWorkspaceInput = z.infer<typeof editWorkspaceSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type InviteUserFormInput = z.infer<typeof inviteUserFormSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
