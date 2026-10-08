export interface PublicFundSummaryItem {
  name: string;
  type?: string;
  isRestricted: boolean;
  totalCollected: string;
  totalDisbursed: string;
  currentBalance: string;
}

export interface PublicMosqueSummary {
  mosque: {
    name: string;
    slug: string;
    address?: string | null;
  };
  fiscalYear: {
    startDate: string;
    endDate: string;
  };
  funds: PublicFundSummaryItem[];
  totalBalance?: string;
}

export interface PublicDonationFeedItem {
  amount: string;
  fundName: string;
  categoryName?: string;
  date: string;
  donorName: string;
}

export interface PublicDonationsPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PublicDonationsFeedResponse {
  donations: PublicDonationFeedItem[];
  pagination?: PublicDonationsPagination;
}

export interface PublicCampaignFeedItem {
  id: string;
  title: string;
  description?: string | null;
  targetAmount?: string | null;
  fund?: { name: string };
  progress?: {
    raisedAmount?: string;
    progressPercent?: number;
    donorCount?: number;
  };
}

export interface PublicExpenseCategoryItem {
  categoryName?: string;
  name?: string;
  totalAmount?: string;
  amount?: string;
  total?: string;
  count?: number;
}

