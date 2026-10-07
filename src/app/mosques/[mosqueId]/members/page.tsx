"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Mail,
  Link2,
  Search,
  Filter,
  Shield,
  Trash2,
  Ban,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useMosque } from "@/providers/mosque-provider";
import { MosqueMemberItem, InviteLinkItem } from "@/features/members/types";
import { InviteMemberDialog } from "@/features/members/invite-member-dialog";
import { DirectCreateMemberDialog } from "@/features/members/direct-create-member-dialog";
import { UpdateRoleDialog } from "@/features/members/update-role-dialog";
import { GenerateInviteLinkDialog } from "@/features/members/generate-invite-link-dialog";

export default function MembersPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"directory" | "links">("directory");

  // Filters State
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  // Dialog States
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isDirectCreateOpen, setIsDirectCreateOpen] = React.useState(false);
  const [isGenerateLinkOpen, setIsGenerateLinkOpen] = React.useState(false);
  const [memberToEdit, setMemberToEdit] = React.useState<MosqueMemberItem | null>(null);

  const isAdmin = canAccess(["MOSQUE_ADMIN"]);
  const canDirectCreate = canAccess(["MOSQUE_ADMIN", "TREASURER"]);

  // Fetch Members
  const { data: members, isLoading: isMembersLoading } = useQuery<MosqueMemberItem[]>({
    queryKey: ["members", mosqueId, roleFilter, statusFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (roleFilter) p.append("role", roleFilter);
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get<MosqueMemberItem[]>(
        `/mosques/${mosqueId}/members?${p.toString()}`
      );
    },
    enabled: activeTab === "directory",
  });

  // Fetch Invite Links
  const { data: inviteLinks, isLoading: isLinksLoading } = useQuery<InviteLinkItem[]>({
    queryKey: ["invite-links", mosqueId],
    queryFn: () => apiClient.get<InviteLinkItem[]>(`/mosques/${mosqueId}/invite-links`),
    enabled: activeTab === "links" && isAdmin,
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId: string) =>
      apiClient.delete(`/mosques/${mosqueId}/members/${membershipId}`),
    onSuccess: () => {
      toast.success("Member removed from mosque.");
      queryClient.invalidateQueries({ queryKey: ["members", mosqueId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  // Revoke Link Mutation
  const revokeLinkMutation = useMutation({
    mutationFn: async (linkId: string) =>
      apiClient.post(`/mosques/${mosqueId}/invite-links/${linkId}/revoke`),
    onSuccess: () => {
      toast.success("Invite link revoked.");
      queryClient.invalidateQueries({ queryKey: ["invite-links", mosqueId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke link");
    },
  });

  const filteredMembers = React.useMemo(() => {
    if (!members) return [];
    return members.filter((m) => {
      const q = search.toLowerCase();
      const name = m.user.name.toLowerCase();
      const email = (m.user.email || "").toLowerCase();
      const phone = (m.user.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [members, search]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "MOSQUE_ADMIN":
        return <Badge variant="danger">Admin</Badge>;
      case "TREASURER":
        return <Badge variant="warning">Treasurer</Badge>;
      case "COMMITTEE_MEMBER":
        return <Badge variant="info">Committee</Badge>;
      case "STAFF":
        return <Badge variant="secondary">Staff</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Mosque Membership Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage congregation members, staff roles, governance officers, and onboarding invites.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canDirectCreate && (
            <Button
              variant="outline"
              onClick={() => setIsDirectCreateOpen(true)}
              className="text-xs border-[#006B5B] text-[#006B5B] hover:bg-[#E6F4F0]"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Direct Register
            </Button>
          )}
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "directory"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Directory</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "links"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Shareable Invite Links</span>
          </button>
        )}
      </div>

      {/* Tab 1: Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              />
            </div>

            <div className="w-full sm:w-44">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">All Roles</option>
                <option value="MOSQUE_ADMIN">Admin</option>
                <option value="TREASURER">Treasurer</option>
                <option value="COMMITTEE_MEMBER">Committee</option>
                <option value="STAFF">Staff</option>
                <option value="MEMBER">Member</option>
              </select>
            </div>

            <div className="w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isMembersLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No members found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Invite or register congregators to build the membership registry.
                </p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Member</Th>
                    <Th>Contact Details</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Joined Date</Th>
                    <Th className="text-right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredMembers.map((member) => (
                    <Tr key={member.id}>
                      <Td className="font-semibold text-gray-900">
                        {member.user.name}
                      </Td>
                      <Td className="text-xs text-gray-600">
                        {member.user.email && <div>{member.user.email}</div>}
                        {member.user.phone && (
                          <div className="text-gray-400">{member.user.phone}</div>
                        )}
                        {!member.user.email && !member.user.phone && "—"}
                      </Td>
                      <Td>{getRoleBadge(member.role)}</Td>
                      <Td>
                        {member.status === "ACTIVE" ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </Td>
                      <Td className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[#006B5B] hover:bg-[#E6F4F0]"
                              onClick={() => setMemberToEdit(member)}
                            >
                              Edit Role
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to remove ${member.user.name} from the mosque?`
                                  )
                                ) {
                                  removeMemberMutation.mutate(member.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Tab 2: Shareable Invite Links */}
      {activeTab === "links" && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsGenerateLinkOpen(true)}
              className="bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Create Invite Link
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isLinksLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading invite links...
              </div>
            ) : !inviteLinks || inviteLinks.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Link2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No active invite links</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create a shareable link to allow new members to join via QR code or group link.
                </p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Target Role</Th>
                    <Th>Usage Count</Th>
                    <Th>Max Uses</Th>
                    <Th>Expiration</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inviteLinks.map((link) => (
                    <Tr key={link.id}>
                      <Td>{getRoleBadge(link.role)}</Td>
                      <Td className="font-bold text-gray-900">
                        {link.useCount} times used
                      </Td>
                      <Td className="text-xs text-gray-600">
                        {link.maxUses ? `${link.maxUses} max` : "Unlimited"}
                      </Td>
                      <Td className="text-xs text-gray-500">
                        {link.expiresAt
                          ? new Date(link.expiresAt).toLocaleString()
                          : "Never expires"}
                      </Td>
                      <Td>
                        {link.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Revoked</Badge>
                        )}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        {link.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:bg-red-50"
                            onClick={() => revokeLinkMutation.mutate(link.id)}
                            disabled={revokeLinkMutation.isPending}
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Direct Create Member Dialog */}
      <DirectCreateMemberDialog
        isOpen={isDirectCreateOpen}
        onClose={() => setIsDirectCreateOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Update Role Dialog */}
      <UpdateRoleDialog
        isOpen={Boolean(memberToEdit)}
        onClose={() => setMemberToEdit(null)}
        mosqueId={mosqueId}
        member={memberToEdit}
      />

      {/* Generate Invite Link Dialog */}
      <GenerateInviteLinkDialog
        isOpen={isGenerateLinkOpen}
        onClose={() => setIsGenerateLinkOpen(false)}
        mosqueId={mosqueId}
      />
    </div>
  );
}
