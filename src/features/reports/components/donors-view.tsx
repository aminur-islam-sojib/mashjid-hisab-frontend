import * as React from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { DonorsReport, DonorGroupBy, DonorStatus } from "../types";

interface DonorsViewProps {
  donorGroupBy: DonorGroupBy;
  donorStatus: DonorStatus;
  onDonorGroupByChange: (val: DonorGroupBy) => void;
  onDonorStatusChange: (val: DonorStatus) => void;
  data?: DonorsReport;
  isLoading: boolean;
}

export function DonorsView({
  donorGroupBy,
  donorStatus,
  onDonorGroupByChange,
  onDonorStatusChange,
  data,
  isLoading,
}: DonorsViewProps) {
  const donorList = data?.donors || data?.data || [];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Entity:</span>
          <select
            value={donorGroupBy}
            onChange={(e) => onDonorGroupByChange(e.target.value as DonorGroupBy)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="member">Individual Member</option>
            <option value="family">Family Household</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
          <select
            value={donorStatus}
            onChange={(e) => onDonorStatusChange(e.target.value as DonorStatus)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="top">Top Donors</option>
            <option value="all">All Donors</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Calculating donor rankings...
          </div>
        ) : donorList.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No donor records found.
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Donor / Household</Th>
                <Th className="text-right">Total Contributed</Th>
                <Th className="text-right">Donation Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {donorList.map((d, idx) => (
                <Tr key={idx}>
                  <Td className="font-bold text-gray-400">#{idx + 1}</Td>
                  <Td className="font-semibold text-gray-900">
                    {d.name || d.donorName || "Congregant"}
                  </Td>
                  <Td className="text-right font-black text-[#006B5B]">
                    {formatCurrency(d.totalAmount || "0")}
                  </Td>
                  <Td className="text-right text-xs text-gray-600">
                    {d.count || d.donationCount || 1} donations
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  );
}

