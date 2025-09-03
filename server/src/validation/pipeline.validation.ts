import { z } from "zod";

export const createPipelineStageSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  color: z.string().min(3, "Color must be at least 3 characters").max(100),
});

export const updatePipelineStageSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  color: z
    .string()
    .min(3, "Color must be at least 3 characters")
    .max(100)
    .optional(),
});

export const reorderPipelineStagesSchema = z.object({
  stageOrders: z.array(z.object({ id: z.string(), order: z.number() })),
});
