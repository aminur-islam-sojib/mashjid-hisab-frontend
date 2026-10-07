import { CategoryType } from "@/types/api";

export interface CategoryItem {
  id: string;
  mosqueId: string;
  name: string;
  type: CategoryType;
  fundId?: string | null;
  fund?: { id: string; name: string } | null;
  isArchived: boolean;
  createdAt?: string;
}

