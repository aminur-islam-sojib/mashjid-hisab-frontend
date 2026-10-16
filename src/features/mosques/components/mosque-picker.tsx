"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, ArrowRight, Shield, MapPin, Loader2, LogOut, RotateCcw, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { MosqueBasic } from "@/types/auth";
import { MembershipStatus } from "@/types/api";

interface UserMosqueItem extends MosqueBasic {
  membershipRole?: string;
  membershipStatus?: MembershipStatus;
  isArchived?: boolean;
}

export function MosquePicker() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, refetchSession, isLoading: isAuthLoading } = useAuth();

  const { data: mosques, isLoading: isMosquesLoading } = useQuery<UserMosqueItem[]>({
    queryKey: ["user-mosques"],
    queryFn: () => apiClient.get<UserMosqueItem[]>("/mosques?includeArchived=true"),
    enabled: !!user,
  });

  const unarchiveMutation = useMutation({
    mutationFn: async (mosqueId: string) => {
      return apiClient.post(`/mosques/${mosqueId}/unarchive`);
    },
    onSuccess: () => {
      toast.success("Mosque workspace restored successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-mosques"] });
      refetchSession();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to restore mosque workspace");
    },
  });

  const isLoading = isAuthLoading || isMosquesLoading;

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <Card className="p-8 shadow-md border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border/80">
          <div className="flex items-center gap-3">
            <MosqueLogo size="md" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>

        <div className="py-6">
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Select Mosque Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a mosque to manage or register a new mosque community.
          </p>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading workspaces...</p>
            </div>
          ) : mosques && mosques.length > 0 ? (
            <div className="mt-6 space-y-3">
              {mosques.map((mosque) => {
                const isArchived = Boolean(mosque.isArchived);
                const isSuspended = mosque.membershipStatus === "SUSPENDED";
                const isAdmin =
                  mosque.membershipRole === "MOSQUE_ADMIN" || user?.role === "SUPER_ADMIN";

                return (
                  <div
                    key={mosque.id}
                    onClick={() => {
                      if (isArchived) {
                        toast.info("This mosque workspace is archived.");
                        return;
                      }
                      if (isSuspended) {
                        toast.error(
                          "Your access to this mosque has been suspended. Please contact the administrator."
                        );
                        return;
                      }
                      router.push(`/mosques/${mosque.id}/dashboard`);
                    }}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${
                      isArchived
                        ? "border-amber-500/30 bg-amber-500/5 opacity-80"
                        : isSuspended
                        ? "border-destructive/30 bg-destructive/5 opacity-75"
                        : "border-border/80 bg-background/50 hover:bg-muted/40 hover:border-primary/40 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isArchived
                            ? "bg-amber-500/10 text-amber-600"
                            : isSuspended
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary text-primary group-hover:scale-105"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {mosque.name}
                          </h3>
                        </div>
                        {mosque.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{mosque.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      {isArchived ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            Archived
                          </span>
                          {user?.role === "SUPER_ADMIN" && (
                            <Button
                              size="xs"
                              variant="outline"
                              className="text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1"
                              disabled={unarchiveMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `Do you want to restore "${mosque.name}" to active status?`
                                  )
                                ) {
                                  unarchiveMutation.mutate(mosque.id);
                                }
                              }}
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </Button>
                          )}
                        </div>
                      ) : isSuspended ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          Suspended
                        </span>
                      ) : (
                        <>
                          {mosque.archiveRequested && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                              Archive Requested
                            </span>
                          )}
                          {mosque.membershipRole && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {mosque.membershipRole.replace("_", " ")}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 py-8 text-center border border-dashed border-border rounded-xl p-6">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-foreground">No active mosque memberships</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                You do not have access to any mosque workspaces yet. You can create a new mosque below.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border/80 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Managing a different mosque?</span>
            <Link href="/mosques/new">
              <Button size="sm" className="gap-1.5 font-semibold">
                <Plus className="w-4 h-4" /> Add Mosque
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

