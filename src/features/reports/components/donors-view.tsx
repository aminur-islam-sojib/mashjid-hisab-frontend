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
  const donorList = data?.topDonors || data?.donors || data?.data || [];
  const totalDonorsCount = data?.totalDonorsCount ?? donorList.length;
  const totalDonationsCount = data?.totalDonationsCount;
  const totalGiving = data?.totalGiving;

  return (
    <div className="space-y-4">
      {/* Print-only Statement Header */}
      <div className="hidden print:block pb-4 mb-2 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Donor Giving Analysis & Rankings
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
          <span>
            Entity: {donorGroupBy === "member" ? "Individual Members" : "Family Households"} &bull; Filter: {donorStatus.toUpperCase()}
          </span>
          <span>Printed on: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls Bar (Hidden during print) */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm print:hidden">
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

      {/* Summary Cards */}
      {Boolean(totalGiving || totalDonorsCount) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Ranked Donors
            </span>
            <div className="text-2xl font-black text-gray-900">
              {totalDonorsCount}
            </div>
          </div>

          {totalDonationsCount !== undefined && (
            <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Total Contributions
              </span>
              <div className="text-2xl font-black text-gray-900">
                {totalDonationsCount}
              </div>
            </div>
          )}

          {totalGiving && (
            <div className="p-4 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
              <span className="text-xs font-semibold text-[#006B5B] uppercase tracking-wider block mb-1">
                Total Donated
              </span>
              <div className="text-2xl font-black text-[#006B5B]">
                {formatCurrency(totalGiving)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Donor Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Calculating donor rankings...
          </div>
        ) : donorList.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No donor records found for the selected criteria.
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
                <Tr key={d.id || idx}>
                  <Td className="font-bold text-gray-400">#{idx + 1}</Td>
                  <Td className="font-semibold text-gray-900">
                    <div>
                      <span>{d.name || d.donorName || "Congregant"}</span>
                      {d.phone && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {d.phone}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td className="text-right font-black text-[#006B5B]">
                    {formatCurrency(d.totalGiven || d.totalAmount || "0")}
                  </Td>
                  <Td className="text-right text-xs text-gray-600">
                    {d.donationCount || d.count || 1} donation
                    {(d.donationCount || d.count || 1) === 1 ? "" : "s"}
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

