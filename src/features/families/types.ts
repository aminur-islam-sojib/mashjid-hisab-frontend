export type FamilyRelation =
  | "SPOUSE"
  | "SON"
  | "DAUGHTER"
  | "FATHER"
  | "MOTHER"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export interface FamilyMemberItem {
  id: string;
  familyId: string;
  name: string;
  relation: FamilyRelation;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  occupation?: string | null;
  bloodGroup?: string | null;
  createdAt: string;
}

export interface FamilyRecord {
  id: string;
  mosqueId: string;
  name: string;
  address?: string | null;
  headMembershipId: string;
  head?: {
    id: string;
    user?: { name: string; email?: string | null; phone?: string | null };
  } | null;
  members?: FamilyMemberItem[];
  _count?: {
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

