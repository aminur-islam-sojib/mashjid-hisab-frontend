"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tags, Plus, Edit2, Archive, Loader2, AlertCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { CategoryItem } from "@/features/categories/types";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import { FundItem } from "@/features/funds/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [activeTab, setActiveTab] = React.useState<"INCOME" | "EXPENSE">("INCOME");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);

  const { data: categories, isLoading, isError, refetch } = useQuery<CategoryItem[]>({
    queryKey: ["mosque", mosqueId, "categories"],
    queryFn: () => apiClient.get<CategoryItem[]>(`/mosques/${mosqueId}/categories`),
    enabled: !!mosqueId,
  });

  const { data: funds } = useQuery<FundItem[]>({
    queryKey: ["mosque", mosqueId, "funds"],
    queryFn: () => apiClient.get<FundItem[]>(`/mosques/${mosqueId}/funds`),
    enabled: !!mosqueId,
  });

  const archiveMutation = useMutation({
    mutationFn: (categoryId: string) =>
      apiClient.post(`/mosques/${mosqueId}/categories/${categoryId}/archive`),
    onSuccess: () => {
      toast.success("Category archived successfully");
      queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "categories"] });
    },
    onError: (err: ApiError) => {
      toast.error("Failed to archive category", {
        description: err.message,
      });
    },
  });

  const isFinOps = canAccess(["MOSQUE_ADMIN", "TREASURER"]);
  const isAdmin = canAccess(["MOSQUE_ADMIN"]);

  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => c.type === activeTab);
  }, [categories, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Transaction Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Categorize revenue collections and operational expense line items.
          </p>
        </div>

        {isFinOps && (
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsDialogOpen(true);
            }}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl w-fit border border-border/80">
        <button
          onClick={() => setActiveTab("INCOME")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "INCOME"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Income Categories
        </button>
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "EXPENSE"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Expense Categories
        </button>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading categories...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load categories</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredCategories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fund Constraint</TableHead>
                {isFinOps && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-semibold text-foreground">
                    {cat.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cat.type === "INCOME" ? "teal" : "secondary"} className="text-[10px]">
                      {cat.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cat.fund ? (
                      <span className="font-medium text-foreground">{cat.fund.name}</span>
                    ) : (
                      "Available to All Funds"
                    )}
                  </TableCell>
                  {isFinOps && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsDialogOpen(true);
                          }}
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              if (confirm(`Are you sure you want to archive "${cat.name}"?`)) {
                                archiveMutation.mutate(cat.id);
                              }
                            }}
                            disabled={archiveMutation.isPending}
                            title="Archive Category"
                          >
                            <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Tags className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No {activeTab.toLowerCase()} categories found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Add categories to classify entries when recording transactions.
            </p>
          </div>
        )}
      </Card>

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCategory(null);
        }}
        mosqueId={mosqueId}
        funds={funds}
        defaultType={activeTab}
        initialData={editingCategory}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "categories"] });
        }}
      />
    </div>
  );
}

