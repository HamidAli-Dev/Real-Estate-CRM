import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  contactInfo: z
    .string()
    .min(3, "Contact info must be at least 3 characters")
    .max(100),
  phone: z.string().max(20).optional(),
  pipelineStageId: z.string(),
  assignedToId: z.string(),
  notes: z
    .string()
    .min(3, "Notes must be at least 3 characters")
    .max(1000)
    .optional(),
  source: z.enum(["Website", "Referral", "Social", "Cold"]).optional(),
  priority: z.enum(["Hot", "Warm", "Cold"]).optional(),
  budget: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  propertyIds: z.array(z.string()).optional(),
});

export const updateLeadSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100)
    .optional(),
  contactInfo: z
    .string()
    .min(3, "Contact info must be at least 3 characters")
    .max(100)
    .optional(),
  phone: z.string().max(20).optional(),
  pipelineStageId: z.string().optional(),
  assignedToId: z.string().optional(),
  notes: z
    .string()
    .min(3, "Notes must be at least 3 characters")
    .max(1000)
    .optional(),
  source: z.enum(["Website", "Referral", "Social", "Cold"]).optional(),
  priority: z.enum(["Hot", "Warm", "Cold"]).optional(),
  budget: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  propertyIds: z.array(z.string()).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.string().min(3, "Status must be at least 3 characters").max(100),
});

export const updateLeadStageSchema = z.object({
  pipelineStageId: z.string(),
});

export const deleteLeadSchema = z.object({
  leadId: z.string(),
});
