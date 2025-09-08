import { z } from "zod";

// Validation schema for accepting invitation
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    )
    .optional(),
});

// Validation schema for canceling invitation
export const cancelInvitationSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
});

// Type exports
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type CancelInvitationInput = z.infer<typeof cancelInvitationSchema>;
