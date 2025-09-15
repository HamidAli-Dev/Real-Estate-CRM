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
  email: z.email("Invalid email address"),
  roleId: z.string().min(1, { message: "Role is required" }),
});

export const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, { message: "Role is required" }),
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(100, { error: "Name cannot exceed 100 characters" }),
  email: z.email({ error: "Please enter a valid email address" }),
});

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Role name is required" })
    .max(50, { message: "Role name must be less than 50 characters" }),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission must be selected" }),
});

export const updateRoleSchema = z.object({
  roleName: z
    .string()
    .trim()
    .min(1, { message: "Role name is required" })
    .max(50, { message: "Role name must be less than 50 characters" }),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission must be selected" }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type EditWorkspaceInput = z.infer<typeof editWorkspaceSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
