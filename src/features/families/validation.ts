import { z } from "zod";

export const familySchema = z.object({
  name: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(100, "Family name cannot exceed 100 characters"),
  address: z.string().max(200, "Address cannot exceed 200 characters").optional(),
});

export type FamilyValues = z.infer<typeof familySchema>;

export const familyMemberSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  relation: z.enum([
    "SPOUSE",
    "SON",
    "DAUGHTER",
    "FATHER",
    "MOTHER",
    "SIBLING",
    "GRANDPARENT",
    "OTHER",
  ]),
  dateOfBirth: z.string().optional(),
  gender: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  occupation: z.string().max(100).optional(),
  bloodGroup: z.string().max(10).optional(),
});

export type FamilyMemberValues = z.infer<typeof familyMemberSchema>;

