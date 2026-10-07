import { z } from "zod";

export const campaignSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title cannot exceed 200 characters"),
  fundId: z.string().min(1, "Fund is required"),
  targetAmountMajor: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d{1,2})?$/.test(val),
      "Invalid target amount format"
    ),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  isPublic: z.boolean().default(true),
});

export type CampaignValues = z.infer<typeof campaignSchema>;

export const closeCampaignSchema = z.object({
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});

export type CloseCampaignValues = z.infer<typeof closeCampaignSchema>;

