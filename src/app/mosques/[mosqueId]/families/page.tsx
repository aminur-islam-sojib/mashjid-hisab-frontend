"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
import { FamilyRecord } from "@/features/families/types";
import { FamilyDialog } from "@/features/families/family-dialog";
import { AddFamilyMemberDialog } from "@/features/families/add-family-member-dialog";
import { FamilyDetailsModal } from "@/features/families/family-details-modal";

export default function FamiliesPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Family Households & Census
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Group members by household for unified Chanda giving statements and family census records.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Family
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search family name, head of household, dependents, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading families...
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No family households found</p>
            <p className="text-xs text-gray-400 mt-1">
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
                    <Td className="font-semibold text-gray-900">
                      {fam.name}
                    </Td>
                    <Td className="text-sm text-gray-700">
                      <span className="font-medium">
                        {head?.name || "Member Head"}
                      </span>
                      {head?.phone && (
                        <span className="block text-xs text-gray-400">
                          {head.phone}
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-gray-600 max-w-xs truncate">
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
                        <div className="text-[11px] text-gray-500 mt-1 truncate max-w-xs">
                          {fam.members.map((m) => `${m.name} (${m.relation.toLowerCase()})`).join(", ")}
                        </div>
                      )}
                    </Td>
                    <Td className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(fam.createdAt).toLocaleDateString()}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#006B5B] hover:bg-[#E6F4F0]"
                          onClick={() => setFamilyForDetails(fam.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Members
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-600 hover:bg-gray-100"
                          onClick={() => {
                            setReturnToDetailsAfterAdd(null);
                            setFamilyForAddMember(fam);
                          }}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Add
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

      {/* Create Family Dialog */}
      <FamilyDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Add Family Member Dialog */}
      <AddFamilyMemberDialog
        isOpen={Boolean(familyForAddMember)}
        onClose={() => {
          setFamilyForAddMember(null);
          if (returnToDetailsAfterAdd) {
            setFamilyForDetails(returnToDetailsAfterAdd);
            setReturnToDetailsAfterAdd(null);
          }
        }}
        mosqueId={mosqueId}
        family={familyForAddMember}
        onSuccess={() => {
          if (returnToDetailsAfterAdd) {
            setFamilyForDetails(returnToDetailsAfterAdd);
            setReturnToDetailsAfterAdd(null);
          }
        }}
      />

      {/* Family Details Modal */}
      <FamilyDetailsModal
        isOpen={Boolean(familyForDetails)}
        onClose={() => setFamilyForDetails(null)}
        mosqueId={mosqueId}
        familyId={familyForDetails}
        onAddMember={(f) => {
          setReturnToDetailsAfterAdd(f.id);
          setFamilyForDetails(null);
          setFamilyForAddMember(f);
        }}
      />
    </div>
  );
}
