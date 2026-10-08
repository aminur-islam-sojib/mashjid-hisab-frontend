"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Settings,
  Building2,
  Globe,
  Lock,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useMosque } from "@/providers/mosque-provider";
import { ADMIN_ONLY_ROLES } from "@/lib/roles";

export default function MosqueSettingsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const router = useRouter();
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  // Fetch mosque details
  const { data: mosque, isLoading } = useQuery<any>({
    queryKey: ["mosque-detail", mosqueId],
    queryFn: () => apiClient.get<any>(`/mosques/${mosqueId}`),
    enabled: isAdmin,
  });

  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [timezone, setTimezone] = React.useState("Asia/Dhaka");
  const [fiscalYearStart, setFiscalYearStart] = React.useState(1);
  const [isTransparencyEnabled, setIsTransparencyEnabled] = React.useState(true);

  React.useEffect(() => {
    if (mosque) {
      setName(mosque.name || "");
      setAddress(mosque.address || "");
      setTimezone(mosque.timezone || "Asia/Dhaka");
      setFiscalYearStart(mosque.fiscalYearStart || 1);
      setIsTransparencyEnabled(mosque.isTransparencyPageEnabled ?? true);
    }
  }, [mosque]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch(`/mosques/${mosqueId}`, {
        name,
        address: address || null,
        timezone,
        fiscalYearStart,
        confirmFiscalYearChange: true,
        isTransparencyPageEnabled: isTransparencyEnabled,
      });
    },
    onSuccess: () => {
      toast.success("Mosque profile and settings updated.");
      queryClient.invalidateQueries({ queryKey: ["mosque-detail", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["user-mosques"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/mosques/${mosqueId}/archive`);
    },
    onSuccess: () => {
      toast.success("Mosque workspace archived.");
      queryClient.invalidateQueries({ queryKey: ["user-mosques"] });
      router.push("/mosques");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cannot archive mosque (check outstanding balances)");
    },
  });

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Lock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-gray-800">Restricted Access</h3>
        <p className="text-sm text-gray-500 mt-1">
          Workspace settings can only be managed by Mosque Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Mosque Workspace Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage mosque identity, public transparency presence, and fiscal year configurations.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#006B5B] mb-2" />
          Loading workspace settings...
        </div>
      ) : (
        <div className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-[#006B5B]" />
              Mosque Profile & Identification
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mosque Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baitul Aman Jame Masjid"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Public URL Slug
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={mosque?.slug || "mosque-slug"}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-mono"
                />
                {mosque?.slug && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/m/${mosque.slug}`, "_blank")}
                    className="shrink-0 text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Visit Public Page
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                The public web address for your congregation. Immutable once provisioned.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Physical Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Mirpur-10, Dhaka 1216"
              />
            </div>
          </div>

          {/* Fiscal & Regional Configurations */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-[#006B5B]" />
              Accounting & Regional Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="Asia/Karachi">Asia/Karachi (GMT+5)</option>
                  <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fiscal Year Starting Month
                </label>
                <select
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
                >
                  <option value={1}>January (Calendar Year)</option>
                  <option value={7}>July (Govt. Fiscal Year)</option>
                  <option value={4}>April</option>
                  <option value={9}>September</option>
                </select>
              </div>
            </div>
          </div>

          {/* Public Transparency Portal Switch */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-emerald-600" />
                  Public Financial Transparency Page
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-lg">
                  Enable public access to audited high-level summaries of collections,
                  fund balances, and expenses. Individual personal account numbers and internal IDs
                  are automatically masked.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTransparencyEnabled}
                  onChange={(e) => setIsTransparencyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#006B5B]" />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="bg-[#006B5B] hover:bg-[#005246] text-white"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                "Save Workspace Settings"
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/60 rounded-xl border border-red-200 p-6 space-y-4">
            <div className="flex items-start space-x-3 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Archive Mosque Workspace</h4>
                <p className="text-xs text-red-700 mt-1">
                  Archiving deactivates this mosque instance. Archiving is only permitted when
                  all account balances have zero remaining liabilities and assets.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                className="text-xs text-red-700 border-red-300 hover:bg-red-100/60"
                onClick={() => {
                  if (
                    confirm(
                      "Are you completely certain you wish to archive this mosque workspace? This cannot be undone if balances exist."
                    )
                  ) {
                    archiveMutation.mutate();
                  }
                }}
                disabled={archiveMutation.isPending}
              >
                Archive Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
