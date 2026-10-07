import { z } from "zod";

export const createCollectionSchema = z.object({
  occasion: z
    .string()
    .min(2, "Occasion must be at least 2 characters")
    .max(100, "Occasion cannot exceed 100 characters"),
  date: z.string().min(1, "Date is required"),
  amountMajor: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format (e.g. 5000 or 5000.50)")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  fundId: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type CreateCollectionValues = z.infer<typeof createCollectionSchema>;

export const verifyCollectionSchema = z.object({
  fundId: z.string().min(1, "Target fund is required"),
  accountId: z.string().min(1, "Target account is required"),
  categoryId: z.string().optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type VerifyCollectionValues = z.infer<typeof verifyCollectionSchema>;

