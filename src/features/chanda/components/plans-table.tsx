import * as React from "react";
import { CalendarHeart, Pause, Play } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import { ChandaPlan } from "../types";

interface PlansTableProps {
  plans?: ChandaPlan[];
  isLoading: boolean;
  canManagePlans: boolean;
  onPause: (planId: string) => void;
  onResume: (planId: string) => void;
  onEnd: (planId: string) => void;
  isActionPending: boolean;
}

export function PlansTable({
  plans,
  isLoading,
  canManagePlans,
  onPause,
  onResume,
  onEnd,
  isActionPending,
}: PlansTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Loading recurring plans...
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <CalendarHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No active Chanda plans</p>
          <p className="text-xs text-gray-400 mt-1">
            Click &quot;New Chanda Plan&quot; to enroll donors in recurring giving.
          </p>
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Payer Entity</Th>
              <Th>Fund</Th>
              <Th className="text-right">Pledged Amount</Th>
              <Th>Frequency</Th>
              <Th>Start Month</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {plans.map((plan) => (
              <Tr key={plan.id}>
                <Td className="font-medium text-gray-900">
                  {plan.member?.user?.name ||
                    (plan.family?.name ? `${plan.family.name} Household` : "Member")}
                  {plan.member?.user?.phone && (
                    <span className="block text-xs text-gray-400 font-normal">
                      {plan.member.user.phone}
                    </span>
                  )}
                </Td>
                <Td className="text-xs text-gray-600">
                  {plan.fund?.name || "General Fund"}
                </Td>
                <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                  {formatCurrency(plan.amount)}
                </Td>
                <Td>
                  <Badge variant="outline">{plan.frequency}</Badge>
                </Td>
                <Td className="text-xs text-gray-700 font-mono">
                  {plan.startMonth}
                </Td>
                <Td>
                  {plan.status === "ACTIVE" ? (
                    <Badge variant="success">Active</Badge>
                  ) : plan.status === "PAUSED" ? (
                    <Badge variant="warning">Paused</Badge>
                  ) : (
                    <Badge variant="secondary">Ended</Badge>
                  )}
                </Td>
                <Td className="text-right whitespace-nowrap">
                  {canManagePlans && plan.status !== "ENDED" && (
                    <div className="flex items-center justify-end space-x-1">
                      {plan.status === "ACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-amber-700 hover:bg-amber-50"
                          onClick={() => onPause(plan.id)}
                          disabled={isActionPending}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onResume(plan.id)}
                          disabled={isActionPending}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Are you sure you want to end this Chanda plan?")) {
                            onEnd(plan.id);
                          }
                        }}
                        disabled={isActionPending}
                      >
                        End
                      </Button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

