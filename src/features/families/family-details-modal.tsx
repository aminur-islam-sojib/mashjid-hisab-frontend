"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Home, Users, Trash2, Loader2, Plus, Phone } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { FamilyRecord, FamilyMemberItem } from "./types";

interface FamilyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  familyId: string | null;
  onAddMember: (family: FamilyRecord) => void;
}

export function FamilyDetailsModal({
  isOpen,
  onClose,
  mosqueId,
  familyId,
  onAddMember,
}: FamilyDetailsModalProps) {
  const queryClient = useQueryClient();

  const { data: family, isLoading } = useQuery<FamilyRecord>({
    queryKey: ["family-detail", mosqueId, familyId],
    queryFn: () => {
      if (!familyId) throw new Error("No family selected");
      return apiClient.get<FamilyRecord>(
        `/mosques/${mosqueId}/families/${familyId}`
      );
    },
    enabled: isOpen && Boolean(familyId),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!familyId) return;
      return apiClient.delete(
        `/mosques/${mosqueId}/families/${familyId}/members/${memberId}`
      );
    },
    onSuccess: () => {
      toast.success("Family member removed.");
      queryClient.invalidateQueries({ queryKey: ["family-detail", mosqueId, familyId] });
      queryClient.invalidateQueries({ queryKey: ["families", mosqueId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  if (!isOpen || !familyId) return null;

  const members = family?.members || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={family?.name || "Family Household"}
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#006B5B]" />
          <p className="text-xs">Loading family household details...</p>
        </div>
      ) : !family ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Family record not found.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Household Metadata */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Head of Household</span>
              <p className="font-bold text-gray-900 mt-0.5">
                {family.headMembership?.user?.name || family.head?.user?.name || "Registered Member"}
              </p>
              {(family.headMembership?.user?.phone || family.head?.user?.phone) && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {family.headMembership?.user?.phone || family.head?.user?.phone}
                </p>
              )}
              {family.address && (
                <p className="text-xs text-gray-500 mt-0.5">{family.address}</p>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                onAddMember(family);
              }}
              className="bg-[#006B5B] hover:bg-[#005246] text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Member
            </Button>
          </div>

          {/* Members Table */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Household Dependents ({members.length})
            </h4>

            {members.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-white border border-gray-100 rounded-lg">
                No dependents registered yet. Click &ldquo;Add Member&rdquo; above.
              </div>
            ) : (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Relation</Th>
                      <Th>Gender</Th>
                      <Th>Blood Group</Th>
                      <Th>Phone</Th>
                      <Th className="text-right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {members.map((m) => (
                      <Tr key={m.id}>
                        <Td className="font-semibold text-gray-900">{m.name}</Td>
                        <Td>
                          <Badge variant="outline" className="text-[10px]">
                            {m.relation}
                          </Badge>
                        </Td>
                        <Td className="text-xs text-gray-600">{m.gender || "—"}</Td>
                        <Td className="text-xs font-mono text-gray-700">
                          {m.bloodGroup || "—"}
                        </Td>
                        <Td className="text-xs text-gray-600">{m.phone || "—"}</Td>
                        <Td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Remove ${m.name} from family?`)) {
                                removeMemberMutation.mutate(m.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
