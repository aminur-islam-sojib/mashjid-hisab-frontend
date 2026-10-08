"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { PublicDonationFeedItem, PublicDonationsFeedResponse } from "./types";

interface DonationsFeedProps {
  slug: string;
}

export function DonationsFeed({ slug }: DonationsFeedProps) {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery<PublicDonationsFeedResponse>({
    queryKey: ["public-donations", slug, page],
    queryFn: async () => {
      return apiClient.get<PublicDonationsFeedResponse>(
        `/public/mosques/${slug}/donations?page=${page}&limit=${limit}`
      );
    },
    enabled: Boolean(slug),
  });

  const donations: PublicDonationFeedItem[] =
    data?.donations || (Array.isArray(data) ? (data as unknown as PublicDonationFeedItem[]) : []);
  const pagination = data?.pagination;

  return (
    <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900">Recent Contributions</h3>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
          <span className="text-xs text-gray-400">Live feed</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-xs text-gray-400">Loading contributions...</p>
        </div>
      ) : donations.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">
          No recent public donations recorded.
        </p>
      ) : (
        <div className="space-y-3">
          {donations.map((d, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
            >
              <div>
                <span className="font-semibold text-gray-900 block">
                  {d.donorName || "Generous Donor"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(d.date).toLocaleDateString()} • {d.fundName || "General Fund"}
                </span>
              </div>
              <span className="font-bold text-emerald-700">
                +{formatCurrency(d.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || isFetching}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isFetching}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

