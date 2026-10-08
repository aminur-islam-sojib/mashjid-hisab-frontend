import { z } from "zod";

export const reopenPeriodSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export type ReopenPeriodFormValues = z.infer<typeof reopenPeriodSchema>;

