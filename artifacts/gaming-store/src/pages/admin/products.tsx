import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Package, Layers, Tag, X, Info, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { fmtNPR } from "@/lib/currency";
import { uploadToStorage } from "@/lib/upload";

type ProductType = "fixed" | "variant";

type DynField = {
  name: string;
  label: string;
  type: "text" | "number" | "email";
  required: boolean;
};

type ProductForm = {
  productType: ProductType;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  tags: string;
  dynamicFields: DynField[];
};

// Smart defaults per category — what account info is needed
const CATEGORY_DEFAULT_FIELDS: Record<string, DynField[]> = {
  "game-topups":    [{ name: "playerId",   label: "Player ID",       type: "text",  required: true  }],
  "gift-cards":     [{ name: "recipientEmail", label: "Recipient Email", type: "email", required: false }],
  "subscriptions":  [{ name: "accountEmail",   label: "Account Email",   type: "email", required: true  }],
  "vouchers":       [],
};

function getDefaultFields(category: string): DynField[] {
  return (CATEGORY_DEFAULT_FIELDS[category] ?? []).map(f => ({ ...f }));
}

const EMPTY: ProductForm = {
  productType: "fixed",
  name: "", description: "", price: "", category: "game-topups",
  imageUrl: "", inStock: true, featured: false, tags: "",
  dynamicFields: getDefaultFields("game-topups"),
};

function isVariantProduct(p: any) {
  return Array.isArray(p?.variants) && p.variants.length > 0;
}

// ── Dynamic Fields Editor ──────────────────────────────────────────────────
function DynamicFieldsEditor({
  fields,
  onChange,
}: {
  fields: DynField[];
  onChange: (fields: DynField[]) => void;
}) {
  const add = () =>
    onChange([...fields, { name: "", label: "", type: "text", required: false }]);
  const remove = (i: number) => onChange(fields.filter((_, idx) => idx !== i));
  const update = (i: number, k: keyof DynField, v: any) =>
    onChange(fields.map((f, idx) => idx === i ? { ...f, [k]: v } : f));

  // Auto-generate name slug from label
  const handleLabel = (i: number, label: string) => {
    const name = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    onChange(fields.map((f, idx) => idx === i ? { ...f, label, name } : f));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Account Info Fields</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Fields shown to customers before checkout (e.g. Player ID, email)
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1.5 h-8 shrink-0">
          <Plus className="h-3.5 w-3.5" /> Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl py-5 text-center">
          <Info className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">No account fields — customers won't be asked for any details.</p>
        </div>
      )}

      {fields.map((field, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end bg-muted/40 rounded-xl p-3 border border-border">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Label *</Label>
            <Input
              value={field.label}
              onChange={e => handleLabel(i, e.target.value)}
              placeholder="Player ID"
              className="h-8 text-sm"
            />
            {field.name && (
              <span className="text-[10px] text-muted-foreground font-mono">key: {field.name}</span>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</Label>
            <Select value={field.type} onValueChange={v => update(i, "type", v as DynField["type"])}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center gap-1 pb-0.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Req.</Label>
            <Switch
              checked={field.required}
              onCheckedChange={v => update(i, "required", v)}
              className="scale-90"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mb-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useListProducts({}, { query: { queryKey: ["admin-products"] } });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof ProductForm, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "product-images");
      f("imageUrl", url);
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setOpen(true); };

  const openEdit = (p: any) => {
    const hasVars = isVariantProduct(p);
    const existingFields: DynField[] = Array.isArray(p.dynamicFields) && p.dynamicFields.length > 0
      ? p.dynamicFields
      : getDefaultFields(p.category);
    setEditId(p.id);
    setForm({
      productType: hasVars ? "variant" : "fixed",
      name: p.name,
      description: p.description ?? "",
      price: hasVars ? "" : String(p.price),
      category: p.category,
      imageUrl: p.imageUrl ?? "",
      inStock: p.inStock,
      featured: p.featured,
      tags: (p.tags ?? []).join(", "),
      dynamicFields: existingFields,
    });
    setOpen(true);
  };

  // When category changes, replace dynamic fields with category defaults (only for new products)
  const handleCategoryChange = (category: string) => {
    setForm(prev => ({
      ...prev,
      category,
      // Only auto-replace fields if this is a new product or fields are empty
      dynamicFields: !editId || prev.dynamicFields.length === 0
        ? getDefaultFields(category)
        : prev.dynamicFields,
    }));
  };

  const handleSave = () => {
    const existingVariants = editId
      ? (products?.find(p => p.id === editId) as any)?.variants ?? []
      : [];

    const validFields = form.dynamicFields.filter(f => f.name && f.label);

    const data = {
      name: form.name,
      description: form.description,
      price: form.productType === "variant" ? 0 : (parseFloat(form.price) || 0),
      category: form.category as any,
      imageUrl: form.imageUrl || null,
      inStock: form.inStock,
      featured: form.featured,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      dynamicFields: validFields,
      variants: existingVariants,
    };

    if (editId) {
      updateProduct.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "Product updated" });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setOpen(false);
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setOpen(false);
          if (form.productType === "variant") {
            toast({ title: "Product created", description: "Now add your price packages." });
            setLocation(`/admin/products/${created.id}/variants`);
          } else {
            toast({ title: "Product created" });
          }
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const isVariant = form.productType === "variant";
  const canSave = form.name && (isVariant || form.price);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Products</h2>
            <p className="text-xs text-muted-foreground">{products?.length ?? 0} products</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {products?.map((p) => {
              const hasVars = isVariantProduct(p);
              const varCount = hasVars ? (p as any).variants.length : 0;
              const fieldCount = Array.isArray(p.dynamicFields) ? p.dynamicFields.length : 0;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate">{p.name}</TableCell>
                  <TableCell>
                    {hasVars ? (
                      <button onClick={() => setLocation(`/admin/products/${p.id}/variants`)}>
                        <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 hover:bg-purple-200 transition-colors cursor-pointer">
                          <Layers className="h-3 w-3" />
                          {varCount} variants
                        </Badge>
                      </button>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        Fixed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">{p.category.replace("-", " ")}</TableCell>
                  <TableCell className="font-semibold">
                    {hasVars
                      ? <span className="text-xs text-muted-foreground italic">per variant</span>
                      : fmtNPR(p.price)}
                  </TableCell>
                  <TableCell>
                    {fieldCount > 0 ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        {fieldCount} field{fieldCount > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <span className="text-xs text-amber-500 font-medium">No fields</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.inStock ? "default" : "destructive"}>
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(p)} title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {hasVars && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-400" onClick={() => setLocation(`/admin/products/${p.id}/variants`)} title="Manage variants">
                          <Layers className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(p.id)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">

            {/* ── Product type ── */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Product Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => f("productType", "fixed")}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all focus:outline-none
                    ${!isVariant ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isVariant ? "bg-primary/15" : "bg-muted"}`}>
                    <Tag className={`h-4 w-4 ${!isVariant ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${!isVariant ? "text-primary" : "text-foreground"}`}>Fixed Price</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">One product, one price<br />e.g. Netflix 1 Month</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-auto ${!isVariant ? "border-primary" : "border-muted-foreground/40"}`}>
                    {!isVariant && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
                <button type="button" onClick={() => f("productType", "variant")}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all focus:outline-none
                    ${isVariant ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-sm" : "border-border bg-card hover:border-purple-400/40"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isVariant ? "bg-purple-100 dark:bg-purple-900/40" : "bg-muted"}`}>
                    <Layers className={`h-4 w-4 ${isVariant ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isVariant ? "text-purple-700 dark:text-purple-400" : "text-foreground"}`}>Variant Package</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">Multiple amounts<br />e.g. 25 / 50 / 100 Diamonds</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-auto ${isVariant ? "border-purple-500" : "border-muted-foreground/40"}`}>
                    {isVariant && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                  </div>
                </button>
              </div>
            </div>

            {/* ── Name ── */}
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => f("name", e.target.value)}
                placeholder={isVariant ? "Free Fire Diamonds" : "Netflix 1 Month Subscription"} />
            </div>

            {/* ── Description ── */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => f("description", e.target.value)} rows={2} />
            </div>

            {/* ── Price + Category ── */}
            <div className="grid grid-cols-2 gap-3">
              {!isVariant ? (
                <div className="space-y-1.5">
                  <Label>Price (NPR) *</Label>
                  <Input type="number" min="0" value={form.price} onChange={e => f("price", e.target.value)} placeholder="99" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Price</Label>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground italic">
                    Set per variant →
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game-topups">Game Top-ups</SelectItem>
                    <SelectItem value="gift-cards">Gift Cards</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="vouchers">Vouchers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Image ── */}
            <div className="space-y-1.5">
              <Label>Product Image</Label>
              <input ref={imageFileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
              {form.imageUrl ? (
                <div className="flex items-center gap-3">
                  <img src={form.imageUrl} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-border" />
                  <div className="flex flex-col gap-1.5">
                    <Button type="button" size="sm" variant="outline" className="gap-1.5 h-7 text-xs"
                      onClick={() => imageFileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      Replace
                    </Button>
                    <button type="button" onClick={() => f("imageUrl", "")}
                      className="text-xs text-destructive hover:underline text-left">Remove</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => imageFileRef.current?.click()}
                  className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer p-3">
                  {uploading
                    ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                    : <>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 10 MB</p>
                        </div>
                      </>
                  }
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input value={form.tags} onChange={e => f("tags", e.target.value)} placeholder="Hot, New, Discount" />
            </div>

            {/* ── Toggles ── */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.inStock} onCheckedChange={v => f("inStock", v)} id="inStock" />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={v => f("featured", v)} id="featured" />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-border" />

            {/* ── Dynamic fields editor ── */}
            <DynamicFieldsEditor
              fields={form.dynamicFields}
              onChange={fields => f("dynamicFields", fields)}
            />

            {/* Variant hint */}
            {!editId && isVariant && (
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-3 flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After creating, you'll go to the <strong className="text-foreground">Variant Manager</strong> to add price packages like "25 Diamonds — Rs. 39".
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!canSave || createProduct.isPending || updateProduct.isPending}
              className={isVariant && !editId ? "bg-purple-600 hover:bg-purple-700 text-white border-none" : ""}
            >
              {editId ? "Save Changes" : isVariant ? "Create & Add Variants →" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteProduct.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
