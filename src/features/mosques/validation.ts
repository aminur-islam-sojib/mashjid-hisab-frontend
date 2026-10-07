import { z } from "zod";

export const createMosqueSchema = z.object({
  name: z.string().min(2, "Mosque name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60, "Slug cannot exceed 60 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  address: z.string().max(255, "Address cannot exceed 255 characters").optional().or(z.literal("")),
  timezone: z.string().default("Asia/Dhaka"),
  fiscalYearStart: z.coerce.number().int().min(1).max(12).default(1),
});

export type CreateMosqueFormData = z.infer<typeof createMosqueSchema>;

