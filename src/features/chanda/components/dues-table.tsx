import * as React from "react";
import { Receipt, CreditCard } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import { DueRecord } from "../types";

export function getDueStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge variant="success">Paid</Badge>;
    case "PARTIAL":
      return <Badge variant="warning">Partial</Badge>;
    case "UNPAID":
      return <Badge variant="danger">Unpaid</Badge>;
    case "WAIVED":
      return <Badge variant="secondary">Waived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface DuesTableProps {
  dues: DueRecord[];
  isLoading: boolean;
  selectedPeriod: string;
  isAdmin: boolean;
  onPay: (due: DueRecord) => void;
  onWaive: (due: DueRecord) => void;
}

export function DuesTable({
  dues,
  isLoading,
  selectedPeriod,
  isAdmin,
  onPay,
  onWaive,
}: DuesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Loading monthly dues...
        </div>
      ) : dues.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No dues found for period {selectedPeriod}</p>
          <p className="text-xs text-gray-400 mt-1">
            Click &quot;Generate Dues&quot; above to generate monthly invoices from active plans.
          </p>
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Period</Th>
              <Th>Payer</Th>
              <Th>Fund</Th>
              <Th className="text-right">Invoice Amount</Th>
              <Th className="text-right">Paid Amount</Th>
              <Th className="text-right">Remaining</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {dues.map((due) => {
              const remaining =
                BigInt(due.amount || "0") - BigInt(due.paidAmount || "0");
              const isPayable =
                due.status !== "PAID" && due.status !== "WAIVED";

              return (
                <Tr key={due.id}>
                  <Td className="whitespace-nowrap font-medium text-gray-700">
                    {due.period}
                  </Td>
                  <Td className="font-medium text-gray-900">
                    {due.member?.user?.name ||
                      (due.family?.name ? `${due.family.name} Household` : "Member")}
                    {due.member?.user?.phone && (
                      <span className="block text-xs text-gray-400 font-normal">
                        {due.member.user.phone}
                      </span>
                    )}
                  </Td>
                  <Td className="text-xs text-gray-600">
                    {due.fund?.name || "General Fund"}
                  </Td>
                  <Td className="text-right font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(due.amount)}
                  </Td>
                  <Td className="text-right font-medium text-emerald-700 whitespace-nowrap">
                    {formatCurrency(due.paidAmount)}
                  </Td>
                  <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                    {formatCurrency(remaining > 0n ? remaining.toString() : "0")}
                  </Td>
                  <Td>{getDueStatusBadge(due.status)}</Td>
                  <Td className="text-right whitespace-nowrap">
                    {isPayable ? (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white"
                          onClick={() => onPay(due)}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-amber-700 hover:bg-amber-50"
                            onClick={() => onWaive(due)}
                          >
                            Waive
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Settled</span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

