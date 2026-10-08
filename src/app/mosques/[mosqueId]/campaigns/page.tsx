"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Users,
  Search,
  Globe,
  Lock,
  Calendar,
  Ban,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { ADMIN_ONLY_ROLES } from "@/lib/roles";
import { CampaignItem } from "@/features/campaigns/types";
import { CampaignDialog } from "@/features/campaigns/campaign-dialog";
import { CloseCampaignDialog } from "@/features/campaigns/close-campaign-dialog";
import { CampaignDonorsModal } from "@/features/campaigns/campaign-donors-modal";

export default function CampaignsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { canAccess } = useMosque();

  // State
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [campaignToClose, setCampaignToClose] = React.useState<CampaignItem | null>(null);
  const [campaignForDonors, setCampaignForDonors] = React.useState<CampaignItem | null>(null);

  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery<{ data: CampaignItem[] }>({
    queryKey: ["campaigns", mosqueId, statusFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      p.append("limit", "50");
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get<{ data: CampaignItem[] }>(
        `/mosques/${mosqueId}/campaigns?${p.toString()}`
      );
    },
  });

  const campaigns = campaignsData?.data || [];

  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });
  }, [campaigns, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Fundraising Campaigns
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Targeted capital campaigns, Ramadan drives, and special donation initiatives.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid of Campaign Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Loading campaigns...
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-xl border border-gray-200/80">
          <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No campaigns found</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a campaign to mobilize giving for a specific purpose.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const percent = camp.progress.progressPercent ?? 0;
            const hasTarget = Boolean(camp.targetAmount);

            return (
              <div
                key={camp.id}
                className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6F4F0] text-[#006B5B]">
                      {camp.fund.name}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {camp.isPublic ? (
                        <span className="flex items-center text-[11px] text-gray-500 font-medium">
                          <Globe className="w-3 h-3 mr-0.5 text-emerald-600" />
                          Public
                        </span>
                      ) : (
                        <span className="flex items-center text-[11px] text-gray-400 font-medium">
                          <Lock className="w-3 h-3 mr-0.5" />
                          Internal
                        </span>
                      )}
                      {camp.status === "ACTIVE" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {camp.title}
                  </h3>
                  {camp.description && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                      {camp.description}
                    </p>
                  )}

                  {/* Progress Matrix */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-[#006B5B]">
                        {formatCurrency(camp.progress.raisedAmount)}
                      </span>
                      {hasTarget && (
                        <span className="text-xs text-gray-500">
                          Goal: {formatCurrency(camp.targetAmount!)}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {hasTarget ? (
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#006B5B] h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-[#006B5B] h-2.5 rounded-full w-full opacity-60" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>{hasTarget ? `${percent}% achieved` : "Open goal"}</span>
                      <span className="flex items-center font-medium text-gray-700">
                        <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {camp.progress.donorCount} Donors
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Dates & Actions */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{new Date(camp.startDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => setCampaignForDonors(camp)}
                    >
                      Donors
                    </Button>

                    {isAdmin && camp.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-amber-700 hover:bg-amber-50 h-7 px-2"
                        onClick={() => setCampaignToClose(camp)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CampaignDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Close Dialog */}
      <CloseCampaignDialog
        isOpen={Boolean(campaignToClose)}
        onClose={() => setCampaignToClose(null)}
        mosqueId={mosqueId}
        campaign={campaignToClose}
      />

      {/* Donors Modal */}
      <CampaignDonorsModal
        isOpen={Boolean(campaignForDonors)}
        onClose={() => setCampaignForDonors(null)}
        mosqueId={mosqueId}
        campaign={campaignForDonors}
      />
    </div>
  );
}
