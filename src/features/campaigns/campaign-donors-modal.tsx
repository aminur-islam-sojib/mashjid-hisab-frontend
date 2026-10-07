"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { CampaignDonorEntry, CampaignItem } from "./types";

interface CampaignDonorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  campaign: CampaignItem | null;
}

export function CampaignDonorsModal({
  isOpen,
  onClose,
  mosqueId,
  campaign,
}: CampaignDonorsModalProps) {
  const { data: donorsData, isLoading } = useQuery<{ data: CampaignDonorEntry[] }>({
    queryKey: ["campaign-donors", mosqueId, campaign?.id],
    queryFn: () => {
      if (!campaign) throw new Error("No campaign selected");
      return apiClient.get<{ data: CampaignDonorEntry[] }>(
        `/mosques/${mosqueId}/campaigns/${campaign.id}/donors?limit=100`
      );
    },
    enabled: isOpen && Boolean(campaign),
  });

  if (!isOpen || !campaign) return null;

  const donors = donorsData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Donors: ${campaign.title}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Raised</span>
            <div className="text-lg font-bold text-[#006B5B]">
              {formatCurrency(campaign.progress.raisedAmount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 font-medium">Contributors</span>
            <div className="text-lg font-bold text-gray-900">
              {campaign.progress.donorCount} Donors
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#006B5B]" />
            <p className="text-xs">Fetching donor records...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No donations recorded yet for this campaign.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Donor</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Total Donated</Th>
                  <Th className="text-right">Contributions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donors.map((d, idx) => (
                  <Tr key={idx}>
                    <Td className="font-semibold text-gray-900">
                      {d.donorLabel}
                    </Td>
                    <Td>
                      <Badge variant="outline" className="text-[10px]">
                        {d.donorType}
                      </Badge>
                    </Td>
                    <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                      {formatCurrency(d.totalAmount)}
                    </Td>
                    <Td className="text-right text-xs text-gray-600">
                      {d.donationCount} {d.donationCount === 1 ? "time" : "times"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </div>
    </Modal>
  );
}
