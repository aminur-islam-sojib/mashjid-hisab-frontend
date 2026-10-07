import { z } from "zod";

export const rejectTransactionSchema = z.object({
  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type RejectTransactionValues = z.infer<typeof rejectTransactionSchema>;

