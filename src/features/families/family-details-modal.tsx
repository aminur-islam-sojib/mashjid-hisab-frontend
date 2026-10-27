"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Home,
  Users,
  Trash2,
  Loader2,
  Plus,
  Phone,
  User,
  ShieldCheck,
  Calendar,
  Briefcase,
  Droplet,
} from "lucide-react";
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
  const headName =
    family?.headMembership?.user?.name ||
    family?.head?.user?.name ||
    "Registered Member";
  const headPhone =
    family?.headMembership?.user?.phone || family?.head?.user?.phone;
  const headEmail =
    family?.headMembership?.user?.email || family?.head?.user?.email;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={family?.name || "Family Household"}
      description="Registered household members, dependents, and contact details."
      size="5xl"
      className="w-full max-w-5xl"
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#006B5B]" />
          <p className="text-sm font-medium">Loading family household details...</p>
        </div>
      ) : !family ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Family record not found.
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {/* Household Head Summary Banner */}
          <div className="p-5 bg-muted/40 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#006B5B]/10 text-[#006B5B] flex items-center justify-center font-bold text-lg shrink-0">
                {headName.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Head of Household
                  </span>
                  <Badge variant="success" className="text-[10px] font-medium py-0.5">
                    Active Member
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium py-0.5">
                    {members.length + 1} Total {members.length + 1 === 1 ? "Member" : "Members"}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg text-foreground">
                  {headName}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {headPhone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {headPhone}
                    </span>
                  )}
                  {headEmail && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs">@</span>
                      {headEmail}
                    </span>
                  )}
                  {family.address && (
                    <span className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-muted-foreground" />
                      {family.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                onAddMember(family);
              }}
              className="gap-2 font-semibold shadow-xs shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              Add Family Member
            </Button>
          </div>

          {/* Household Dependents Table Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#006B5B]" />
                  Household Dependents & Kin ({members.length})
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Family dependents linked to this household record for census and giving statements.
                </p>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="py-14 text-center space-y-3 bg-card border border-border rounded-2xl">
                <Users className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">No dependents registered yet</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Add family members like spouse, children, or elderly parents to complete this household profile.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onAddMember(family);
                  }}
                  className="gap-1.5 font-semibold text-xs mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Member
                </Button>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
                <Table>
                  <Thead>
                    <Tr>
                      <Th className="w-[24%]">Name</Th>
                      <Th className="w-[14%]">Relation</Th>
                      <Th className="w-[12%]">Gender</Th>
                      <Th className="w-[14%]">Date of Birth</Th>
                      <Th className="w-[10%]">Blood Group</Th>
                      <Th className="w-[14%]">Occupation</Th>
                      <Th className="w-[14%]">Contact</Th>
                      <Th className="w-[6%] text-right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {members.map((m) => (
                      <Tr key={m.id} className="hover:bg-muted/40 transition-colors">
                        <Td className="font-semibold text-xs text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-bold text-[11px] text-muted-foreground shrink-0">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div>{m.name}</div>
                              {m.linkedMembershipId && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#006B5B] font-medium">
                                  <ShieldCheck className="w-3 h-3" />
                                  Mosque Member
                                </span>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {m.relation}
                          </Badge>
                        </Td>
                        <Td className="text-xs">
                          {m.gender ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium"
                            >
                              {m.gender}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </Td>
                        <Td className="text-xs text-muted-foreground whitespace-nowrap">
                          {m.dateOfBirth
                            ? new Date(m.dateOfBirth).toLocaleDateString()
                            : "—"}
                        </Td>
                        <Td className="text-xs font-mono">
                          {m.bloodGroup ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono px-1.5 py-0.5"
                            >
                              {m.bloodGroup}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </Td>
                        <Td className="text-xs text-muted-foreground truncate max-w-[130px]">
                          {m.occupation || "—"}
                        </Td>
                        <Td className="text-xs text-muted-foreground whitespace-nowrap">
                          {m.phone ? (
                            <a
                              href={`tel:${m.phone}`}
                              className="hover:text-primary transition-colors flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {m.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
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
