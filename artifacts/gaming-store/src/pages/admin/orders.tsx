import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ShoppingCart } from "lucide-react";
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
  const { toast } = useToast();

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          <p className="text-xs text-muted-foreground">{orders?.length ?? 0} total orders</p>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">{order.product.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">{order.guestEmail || order.guestName || "Registered User"}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
