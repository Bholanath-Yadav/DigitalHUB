import { useMemo, useState } from "react";
import { useListCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/lib/api-hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Tag, RefreshCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type CouponForm = {
  code: string; discountType: "percentage" | "fixed"; discountValue: string;
  usageLimit: string; active: boolean; expiresAt: string;
};
const EMPTY: CouponForm = { code: "", discountType: "percentage", discountValue: "", usageLimit: "", active: true, expiresAt: "" };

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useListCoupons({ query: { queryKey: ["admin-coupons"] } });
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons ?? [];
    return (coupons ?? []).filter((coupon) => {
      return [coupon.code, coupon.discountType, String(coupon.discountValue), coupon.active ? "active" : "inactive"].some((value) =>
        String(value).toLowerCase().includes(q)
      );
    });
  }, [coupons, search]);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: String(c.discountValue),
      usageLimit: c.usageLimit ? String(c.usageLimit) : "", active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setOpen(true);
  };

  const buildData = () => ({
    code: form.code.toUpperCase(),
    discountType: form.discountType,
    discountValue: parseFloat(form.discountValue) || 0,
    usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
    active: form.active,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    applicableProductIds: [],
  });

  const handleSave = () => {
    const data = buildData();
    if (editId) {
      updateCoupon.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "Coupon updated" });
          queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
          setOpen(false);
        },
        onError: () => toast({ title: "Failed to update coupon", variant: "destructive" }),
      });
    } else {
      createCoupon.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Coupon created" });
          queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
          setOpen(false);
        },
        onError: () => toast({ title: "Failed to create coupon", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteCoupon.mutate(id, {
      onSuccess: () => {
        toast({ title: "Coupon deleted" });
        queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const f = (k: keyof CouponForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="relative p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Coupons</h2>
            <p className="text-xs text-muted-foreground">{filteredCoupons.length} coupons</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon..." className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Create Coupon</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>}
            {filteredCoupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-bold tracking-widest">{c.code}</TableCell>
                <TableCell className="font-semibold">
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `NPR ${c.discountValue}`}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : " used"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(c)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Coupon Code *</Label>
              <Input value={form.code} onChange={e => f("code", e.target.value.toUpperCase())} placeholder="GAMER10" className="uppercase tracking-widest font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.discountType} onValueChange={v => f("discountType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (NPR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Value *</Label>
                <Input type="number" value={form.discountValue} onChange={e => f("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "10" : "50"} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Usage Limit</Label>
                <Input type="number" value={form.usageLimit} onChange={e => f("usageLimit", e.target.value)} placeholder="Unlimited" /></div>
              <div className="space-y-1.5"><Label>Expires At</Label>
                <Input type="date" value={form.expiresAt} onChange={e => f("expiresAt", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.active} onCheckedChange={v => f("active", v)} id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.discountValue || createCoupon.isPending || updateCoupon.isPending}>
              {editId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Coupon?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteCoupon.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
