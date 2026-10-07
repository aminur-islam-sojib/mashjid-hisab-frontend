import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
  fundId: z.string().optional().or(z.literal("")),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

