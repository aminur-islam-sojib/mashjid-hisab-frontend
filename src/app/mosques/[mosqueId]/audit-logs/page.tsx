"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Eye,
  Clock,
  User,
  Activity,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiClient } from "@/lib/api-client";
import { useMosque } from "@/providers/mosque-provider";

export default function AuditLogsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { canAccess } = useMosque();

  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("");
  const [entityFilter, setEntityFilter] = React.useState<string>("");
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);

  const isAdmin = canAccess(["MOSQUE_ADMIN"]);

  const { data: logsData, isLoading } = useQuery<any>({
    queryKey: ["audit-logs", mosqueId, actionFilter, entityFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      p.append("limit", "50");
      if (actionFilter) p.append("action", actionFilter);
      if (entityFilter) p.append("entity", entityFilter);

      return apiClient.get<any>(
        `/mosques/${mosqueId}/audit-logs?${p.toString()}`
      );
    },
    enabled: isAdmin,
  });

  const logs = logsData?.items || logsData?.data || [];

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log: any) => {
      const q = search.toLowerCase();
      const actorName = log.actor?.name?.toLowerCase() || "";
      const summary = log.summary?.toLowerCase() || "";
      return actorName.includes(q) || summary.includes(q);
    });
  }, [logs, search]);

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE") || action.includes("POST")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes("VOID") || action.includes("DELETE") || action.includes("REJECT")) {
      return <Badge variant="danger">{action}</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("EDIT")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-gray-500">
        <ShieldCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-gray-800">Restricted Access</h3>
        <p className="text-sm text-gray-500 mt-1">
          System audit logs are strictly reserved for Mosque Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Financial & System Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Immutable forensic log of all financial postings, approvals, void actions, and administrative operations.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search actor or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="VOID">Void</option>
            <option value="CLOSE_PERIOD">Close Period</option>
            <option value="REOPEN_PERIOD">Reopen Period</option>
          </select>
        </div>

        <div className="w-full sm:w-44">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="">All Entities</option>
            <option value="DONATION">Donation</option>
            <option value="EXPENSE">Expense</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ACCOUNT">Account</option>
            <option value="FUND">Fund</option>
            <option value="MEMBERSHIP">Membership</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading forensic audit trail...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No audit records found</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Summary Description</Th>
                <Th>IP Address</Th>
                <Th className="text-right">Metadata</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredLogs.map((log: any) => (
                <Tr key={log.id}>
                  <Td className="whitespace-nowrap text-xs text-gray-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </Td>
                  <Td className="font-medium text-gray-900">
                    {log.actor?.name || "System"}
                    {log.actor?.email && (
                      <span className="block text-[11px] text-gray-400 font-normal">
                        {log.actor.email}
                      </span>
                    )}
                  </Td>
                  <Td>{getActionBadge(log.action)}</Td>
                  <Td>
                    <Badge variant="outline" className="text-[10px]">
                      {log.entity}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-gray-700 max-w-sm">
                    {log.summary}
                  </Td>
                  <Td className="text-xs font-mono text-gray-400">
                    {log.ipAddress || "—"}
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#006B5B] hover:bg-[#E6F4F0]"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Metadata Inspector Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Metadata"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
              <div>
                <span className="text-gray-400 font-medium">Action:</span>{" "}
                <span className="font-semibold text-gray-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Actor:</span>{" "}
                <span className="text-gray-900">{selectedLog.actor?.name || "System"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Summary:</span>{" "}
                <span className="text-gray-900">{selectedLog.summary}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                Payload Snapshot (JSON)
              </span>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
