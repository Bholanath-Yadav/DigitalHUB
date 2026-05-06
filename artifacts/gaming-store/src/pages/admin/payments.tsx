import { useMemo, useState } from "react";
import { useListPayments, useVerifyPayment } from "@/lib/api-hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, ExternalLink, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AdminPayments() {
  const { data: payments, isLoading } = useListPayments(undefined, { query: { queryKey: ["admin-payments"] } });
  const verifyPayment = useVerifyPayment();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments ?? [];
    return (payments ?? []).filter((payment) => {
      return [
        String(payment.orderId),
        payment.paymentMethod,
        payment.status,
        payment.adminNote ?? "",
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [payments, search]);

  const handleVerify = (id: number, status: "verified" | "rejected") => {
    verifyPayment.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Payment ${status}`, description: `Payment has been marked as ${status}.` });
          queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
        onError: () => toast({ title: "Failed to update payment", variant: "destructive" }),
      }
    );
  };

  const pending = payments?.filter(p => p.status === "pending").length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Payment Verification</h2>
          <p className="text-xs text-muted-foreground">{pending} pending review</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order or method..." className="w-[240px]" />
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-payments"] })}>Refresh</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">#{payment.orderId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="capitalize text-sm font-medium">{payment.paymentMethod}</span>
                </TableCell>
                <TableCell>
                  {payment.screenshotUrl ? (
                    <a href={payment.screenshotUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                      <ExternalLink className="h-3 w-3" /> View
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    payment.status === "verified" ? "default" :
                    payment.status === "rejected" ? "destructive" : "secondary"
                  } className="capitalize">
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {payment.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 gap-1"
                        onClick={() => handleVerify(payment.id, "verified")}
                        disabled={verifyPayment.isPending}>
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline"
                        className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1"
                        onClick={() => handleVerify(payment.id, "rejected")}
                        disabled={verifyPayment.isPending}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
