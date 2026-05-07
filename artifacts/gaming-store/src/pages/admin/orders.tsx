import { useMemo, useState } from "react";
import { useListOrders, useUpdateOrderStatus, useDeleteOrder } from "@/lib/api-hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ShoppingCart, RefreshCcw, Search, Trash2 } from "lucide-react";
import { fmtNPR } from "@/lib/currency";

const STATUS_COLORS: Record<string, any> = {
  completed: "success",
  rejected: "destructive",
  verified: "default",
  pending: "secondary",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useListOrders(undefined, { query: { queryKey: ["admin-orders"] } });
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const isOldOrder = (createdAt: string) => {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    const days = ageMs / (1000 * 60 * 60 * 24);
    return days >= 30;
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders ?? [];
    return (orders ?? []).filter((order) => {
      const customer = `${order.guestName ?? ""} ${order.guestEmail ?? ""} ${order.userId ?? ""}`.toLowerCase();
      return (
        String(order.id).includes(q) ||
        order.product.name.toLowerCase().includes(q) ||
        customer.includes(q) ||
        order.status.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  const handleStatusChange = (id: number, status: "pending" | "verified" | "completed" | "rejected") => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "Order status updated" });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteOrder.mutate(id, {
      onSuccess: () => {
        toast({ title: "Order deleted" });
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({ title: "Failed to delete order", variant: "destructive" });
      },
    });
  };

  return (
    <div className="relative p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Orders</h2>
            <p className="text-xs text-muted-foreground">{filteredOrders.length} total orders</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative min-w-0 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, product, customer..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Change Status</TableHead>
              <TableHead className="text-right">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">{order.product.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate" title={order.guestEmail || order.guestName || "Registered User"}>{order.guestEmail || order.guestName || "Registered User"}</TableCell>
                <TableCell className="font-semibold">{fmtNPR(order.totalAmount)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[order.status] ?? "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(val: any) => handleStatusChange(order.id, val)}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(order.id)}
                    disabled={!isOldOrder(order.createdAt) || deleteOrder.isPending}
                    title={isOldOrder(order.createdAt) ? "Delete order" : "Only orders older than 30 days can be deleted"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete old order?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the order record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
