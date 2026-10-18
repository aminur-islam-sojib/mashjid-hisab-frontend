"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Home, Users, Trash2, Loader2, Plus, Phone, User } from "lucide-react";
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
      description="Registered household members, dependents, and contact details."
      className="max-w-4xl sm:max-w-4xl w-full"
    >
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#006B5B]" />
          <p className="text-xs">Loading family household details...</p>
        </div>
      ) : !family ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Family record not found.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Household Summary Card */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Head of Household
                </span>
                <Badge variant="outline" className="text-[10px] font-medium">
                  {members.length + 1} Household {members.length + 1 === 1 ? "Member" : "Members"}
                </Badge>
              </div>
              <p className="font-bold text-base text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#006B5B]" />
                {family.headMembership?.user?.name || family.head?.user?.name || "Registered Member"}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {(family.headMembership?.user?.phone || family.head?.user?.phone) && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {family.headMembership?.user?.phone || family.head?.user?.phone}
                  </span>
                )}
                {family.address && (
                  <span className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    {family.address}
                  </span>
                )}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                onAddMember(family);
              }}
              className="gap-1.5 self-start sm:self-auto font-semibold shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>

          {/* Members Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Household Dependents & Members ({members.length})
              </h4>
            </div>

            {members.length === 0 ? (
              <div className="py-12 text-center space-y-2 bg-card border border-border rounded-xl">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                <p className="font-semibold text-sm text-foreground">No dependents registered yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click &ldquo;Add Member&rdquo; above to register spouses, children, or elderly dependents under this household.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-card shadow-xs">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Relation</Th>
                      <Th>Gender</Th>
                      <Th>Date of Birth</Th>
                      <Th>Blood Group</Th>
                      <Th>Occupation</Th>
                      <Th>Phone</Th>
                      <Th className="text-right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {members.map((m) => (
                      <Tr key={m.id}>
                        <Td className="font-semibold text-xs text-foreground">
                          {m.name}
                          {m.linkedMembershipId && (
                            <span className="ml-1.5 inline-flex items-center text-[10px] text-[#006B5B] font-normal">
                              (Registered User)
                            </span>
                          )}
                        </Td>
                        <Td>
                          <Badge variant="outline" className="text-[10px]">
                            {m.relation}
                          </Badge>
                        </Td>
                        <Td className="text-xs text-muted-foreground">
                          {m.gender ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-normal"
                            >
                              {m.gender}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </Td>
                        <Td className="text-xs text-muted-foreground whitespace-nowrap">
                          {m.dateOfBirth
                            ? new Date(m.dateOfBirth).toLocaleDateString()
                            : "—"}
                        </Td>
                        <Td className="text-xs font-mono text-muted-foreground">
                          {m.bloodGroup ? (
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {m.bloodGroup}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </Td>
                        <Td className="text-xs text-muted-foreground">
                          {m.occupation || "—"}
                        </Td>
                        <Td className="text-xs text-muted-foreground whitespace-nowrap">
                          {m.phone || "—"}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm(`Remove ${m.name} from this family household?`)) {
                                removeMemberMutation.mutate(m.id);
                              }
                            }}
                            disabled={removeMemberMutation.isPending}
                            title="Remove member"
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
