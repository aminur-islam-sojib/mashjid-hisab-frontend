"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Plus,
  Users,
  Search,
  UserPlus,
  Eye,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { FamilyRecord } from "../types";
import { FamilyDialog } from "../family-dialog";
import { AddFamilyMemberDialog } from "../add-family-member-dialog";
import { FamilyDetailsModal } from "../family-details-modal";

export function FamiliesView({ mosqueId }: { mosqueId: string }) {
  // State
  const [search, setSearch] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [familyForDetails, setFamilyForDetails] = React.useState<string | null>(null);
  const [familyForAddMember, setFamilyForAddMember] = React.useState<FamilyRecord | null>(null);
  const [returnToDetailsAfterAdd, setReturnToDetailsAfterAdd] = React.useState<string | null>(null);

  // Fetch families
  const { data: families, isLoading } = useQuery<FamilyRecord[]>({
    queryKey: ["families", mosqueId],
    queryFn: () => apiClient.get<FamilyRecord[]>(`/mosques/${mosqueId}/families`),
    enabled: Boolean(mosqueId),
  });

  const filteredFamilies = React.useMemo(() => {
    if (!families) return [];
    return families.filter((f) => {
      const q = search.toLowerCase();
      const headName = (f.headMembership?.user?.name || f.head?.user?.name || "").toLowerCase();
      const headPhone = (f.headMembership?.user?.phone || f.head?.user?.phone || "").toLowerCase();
      const address = (f.address || "").toLowerCase();
      const memberMatch = f.members?.some((m) => m.name.toLowerCase().includes(q)) ?? false;
      return (
        f.name.toLowerCase().includes(q) ||
        headName.includes(q) ||
        headPhone.includes(q) ||
        address.includes(q) ||
        memberMatch
      );
    });
  }, [families, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Families & Households
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Group members by household for unified Chanda giving statements and family census records.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto font-semibold"
        >
          <Plus className="w-4 h-4" />
          Register Family
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search family name, head of household, dependents, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading families...
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Home className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
            <p className="font-semibold text-sm text-foreground">No family households found</p>
            <p className="text-xs text-muted-foreground">
              Click &ldquo;Register Family&rdquo; to create a new household registry.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Household Name</Th>
                <Th>Head of Household</Th>
                <Th>Residential Address</Th>
                <Th>Dependents Count</Th>
                <Th>Created Date</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFamilies.map((fam) => {
                const head = fam.headMembership?.user || fam.head?.user;
                const memberCount = fam.members ? fam.members.length : (fam._count?.members ?? 0);

                return (
                  <Tr key={fam.id}>
                    <Td className="font-semibold text-xs text-foreground">
                      {fam.name}
                    </Td>
                    <Td className="text-xs text-foreground">
                      <span className="font-medium">
                        {head?.name || "Member Head"}
                      </span>
                      {head?.phone && (
                        <span className="block text-muted-foreground/80">
                          {head.phone}
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground max-w-xs truncate">
                      {fam.address || "—"}
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setFamilyForDetails(fam.id)}
                        className="inline-flex items-center text-left hover:opacity-80 transition-opacity"
                      >
                        <Badge variant="outline" className="text-xs cursor-pointer">
                          <Users className="w-3 h-3 mr-1 inline" />
                          {memberCount} members
                        </Badge>
                      </button>
                      {fam.members && fam.members.length > 0 && (
                        <div className="text-[11px] text-muted-foreground mt-1 truncate max-w-xs">
                          {fam.members.map((m) => `${m.name} (${m.relation.toLowerCase()})`).join(", ")}
                        </div>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(fam.createdAt).toLocaleDateString()}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setFamilyForDetails(fam.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Members
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setReturnToDetailsAfterAdd(null);
                            setFamilyForAddMember(fam);
                          }}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Add Member
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Create Family Modal */}
      <FamilyDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Family Details Modal */}
      <FamilyDetailsModal
        isOpen={Boolean(familyForDetails)}
        onClose={() => setFamilyForDetails(null)}
        familyId={familyForDetails}
        mosqueId={mosqueId}
        onAddMember={(fam) => {
          setReturnToDetailsAfterAdd(familyForDetails);
          setFamilyForDetails(null);
          setFamilyForAddMember(fam);
        }}
      />

      {/* Add Member Dialog */}
      <AddFamilyMemberDialog
        isOpen={Boolean(familyForAddMember)}
        onClose={() => {
          const returnId = returnToDetailsAfterAdd;
          setFamilyForAddMember(null);
          setReturnToDetailsAfterAdd(null);
          if (returnId) {
            setFamilyForDetails(returnId);
          }
        }}
        mosqueId={mosqueId}
        family={familyForAddMember}
      />
    </div>
  );
}

