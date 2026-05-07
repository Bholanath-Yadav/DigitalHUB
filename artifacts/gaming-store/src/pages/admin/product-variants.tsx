import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetProduct, useUpdateProduct } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Layers, Check, GripVertical, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { fmtNPR } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";

type Variant = {
  name: string;
  price: number;
  badge?: string | null;
  originalPrice?: number | null;
  icon?: string | null;
};

type VariantForm = {
  name: string;
  price: string;
  badge: string;
  originalPrice: string;
  icon: string;
};

const EMPTY_FORM: VariantForm = { name: "", price: "", badge: "", originalPrice: "", icon: "" };

function formToVariant(f: VariantForm): Variant {
  return {
    name: f.name.trim(),
    price: parseFloat(f.price) || 0,
    badge: f.badge.trim() || null,
    originalPrice: f.originalPrice ? parseFloat(f.originalPrice) : null,
    icon: f.icon.trim() || null,
  };
}

function variantToForm(v: Variant): VariantForm {
  return {
    name: v.name,
    price: String(v.price),
    badge: v.badge ?? "",
    originalPrice: v.originalPrice ? String(v.originalPrice) : "",
    icon: v.icon ?? "",
  };
}

function VariantCard({
  v,
  index,
  onEdit,
  onDelete,
}: {
  v: Variant;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="group relative bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
    >
      {/* Drag handle (visual only) */}
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xl">
        {v.icon || <Package className="h-5 w-5 text-primary/60" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{v.name}</span>
          {v.badge && (
            <span className="text-[10px] font-black uppercase tracking-wide bg-orange-500 text-white px-2 py-0.5 rounded-full">
              {v.badge}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-black text-black dark:text-white">{fmtNPR(v.price)}</span>
          {v.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{fmtNPR(v.originalPrice)}</span>
          )}
          {v.originalPrice && (
            <span className="text-[10px] font-semibold text-green-500">
              {Math.round((1 - v.price / v.originalPrice) * 100)}% off
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function VariantFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: VariantForm;
  onSave: (f: VariantForm) => void;
  title: string;
}) {
  const [form, setForm] = useState<VariantForm>(initial);
  const f = (k: keyof VariantForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Reset form when dialog opens with new initial
  const handleOpenChange = (open: boolean) => {
    if (open) setForm(initial);
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">

          {/* Preview card */}
          {form.name && (
            <div className="border border-primary/30 rounded-xl p-3 bg-primary/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                {form.icon || "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">{form.name}</span>
                  {form.badge && (
                    <span className="text-[9px] font-black uppercase bg-orange-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                      {form.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {form.price && <span className="text-sm font-black text-black dark:text-white">{fmtNPR(parseFloat(form.price) || 0)}</span>}
                  {form.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">{fmtNPR(parseFloat(form.originalPrice) || 0)}</span>
                  )}
                </div>
              </div>
              <Check className="h-4 w-4 text-primary shrink-0" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="25 Diamonds" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Price (NPR) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" value={form.price} onChange={e => f("price", e.target.value)} placeholder="39" />
            </div>
            <div className="space-y-1.5">
              <Label>Original Price <span className="text-muted-foreground text-xs">(for strikethrough)</span></Label>
              <Input type="number" min="0" value={form.originalPrice} onChange={e => f("originalPrice", e.target.value)} placeholder="50" />
            </div>
            <div className="space-y-1.5">
              <Label>Badge <span className="text-muted-foreground text-xs">(e.g. 8% OFF)</span></Label>
              <Input value={form.badge} onChange={e => f("badge", e.target.value)} placeholder="8% OFF" />
            </div>
            <div className="space-y-1.5">
              <Label>Icon <span className="text-muted-foreground text-xs">(emoji)</span></Label>
              <Input value={form.icon} onChange={e => f("icon", e.target.value)} placeholder="💎" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => { onSave(form); onOpenChange(false); }}
            disabled={!form.name.trim() || !form.price}
          >
            Save Variant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductVariants() {
  const [, params] = useRoute("/admin/products/:id/variants");
  const productId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { queryKey: ["product", productId], enabled: !!productId },
  });
  const updateProduct = useUpdateProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogForm, setDialogForm] = useState<VariantForm>(EMPTY_FORM);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const variants: Variant[] = Array.isArray((product as any)?.variants)
    ? (product as any).variants
    : [];

  const saveVariants = (newVariants: Variant[], successMsg: string) => {
    if (!product) return;
    updateProduct.mutate(
      {
        id: product.id,
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category as any,
          imageUrl: product.imageUrl ?? null,
          inStock: product.inStock,
          featured: product.featured,
          tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
          dynamicFields: Array.isArray(product.dynamicFields) ? (product.dynamicFields as any[]) : [],
          variants: newVariants as any,
        },
      },
      {
        onSuccess: () => {
          toast({ title: successMsg });
          queryClient.invalidateQueries({ queryKey: ["product", productId] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" }),
      }
    );
  };

  const openCreate = () => {
    setEditIndex(null);
    setDialogForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditIndex(idx);
    setDialogForm(variantToForm(variants[idx]));
    setDialogOpen(true);
  };

  const handleSave = (form: VariantForm) => {
    const v = formToVariant(form);
    if (editIndex !== null) {
      const updated = variants.map((x, i) => (i === editIndex ? v : x));
      saveVariants(updated, "Variant updated");
    } else {
      saveVariants([...variants, v], "Variant added");
    }
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    const updated = variants.filter((_, i) => i !== deleteIndex);
    saveVariants(updated, "Variant deleted");
    setDeleteIndex(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 animate-shimmer rounded w-48" />
        <div className="h-5 animate-shimmer rounded w-32" />
        {[0, 1, 2].map(i => (
          <div key={i} className="h-16 animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Product not found.{" "}
        <button className="text-primary underline" onClick={() => setLocation("/admin/products")}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-4 md:p-6 max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 mt-0.5"
          onClick={() => setLocation("/admin/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black tracking-tight">{product.name}</h1>
            <Badge variant="outline" className="text-[10px] uppercase">
              {product.category.replace(/-/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Manage selectable packages / amounts for this product
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Variant
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-black text-primary">{variants.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Variants</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-black text-green-500">
            {variants.length > 0 ? fmtNPR(Math.min(...variants.map(v => v.price))) : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Lowest Price</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-black">
            {variants.length > 0 ? fmtNPR(Math.max(...variants.map(v => v.price))) : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Highest Price</div>
        </div>
      </div>

      {/* Variant list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Variants ({variants.length})
          </h2>
        </div>

        {variants.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
            <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-semibold text-muted-foreground">No variants yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
              Add selectable packages like "25 Diamonds", "50 Diamonds", etc.
            </p>
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add First Variant
            </Button>
          </div>
        )}

        <AnimatePresence>
          {variants.map((v, i) => (
            <VariantCard
              key={`${v.name}-${i}`}
              v={v}
              index={i}
              onEdit={() => openEdit(i)}
              onDelete={() => setDeleteIndex(i)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Live preview */}
      {variants.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Customer Preview
          </h2>
          <p className="text-xs text-muted-foreground">This is how the grid will appear on the product page.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {variants.map((v, i) => (
              <div
                key={i}
                className={`relative rounded-xl border p-2.5 text-left transition-all ${i === 0 ? "border-primary bg-primary/8 shadow-[0_0_0_2px] shadow-primary/30" : "border-border bg-muted/30"}`}
              >
                {v.badge && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] font-black uppercase bg-orange-500 text-white px-1.5 py-0.5 rounded-full leading-none z-10">
                    {v.badge}
                  </span>
                )}
                {v.icon && <div className="text-base mb-1">{v.icon}</div>}
                <div className="text-[10px] font-semibold leading-tight text-foreground line-clamp-2">{v.name}</div>
                <div className="mt-1">
                  {v.originalPrice && (
                    <div className="text-[9px] text-muted-foreground line-through">{fmtNPR(v.originalPrice)}</div>
                  )}
                  <div className={`text-[11px] font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>{fmtNPR(v.price)}</div>
                </div>
                {i === 0 && (
                  <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit dialog */}
      <VariantFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={dialogForm}
        onSave={handleSave}
        title={editIndex !== null ? "Edit Variant" : "Add Variant"}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Variant?</DialogTitle>
          </DialogHeader>
          {deleteIndex !== null && (
            <p className="text-sm text-muted-foreground">
              Remove <strong>"{variants[deleteIndex]?.name}"</strong>? This cannot be undone.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={updateProduct.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
