import { useMemo, useState, useRef } from "react";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@/lib/api-hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Image, Upload, Loader2, X, ExternalLink, RefreshCcw, Search } from "lucide-react";
import SafeImage from "@/components/safe-image";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { uploadToStorage } from "@/lib/upload";

type BannerForm = {
  title: string; subtitle: string; imageUrl: string; linkUrl: string;
  active: boolean; sortOrder: string;
};
const EMPTY: BannerForm = { title: "", subtitle: "", imageUrl: "", linkUrl: "", active: true, sortOrder: "0" };

export default function AdminBanners() {
  const { data: banners, isLoading } = useListBanners({ query: { queryKey: ["admin-banners"] } });
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  const filteredBanners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banners ?? [];
    return (banners ?? []).filter((banner) => {
      return [banner.title, banner.subtitle ?? "", banner.linkUrl ?? "", banner.active ? "active" : "inactive"].some((value) =>
        String(value).toLowerCase().includes(q)
      );
    });
  }, [banners, search]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "banner-images");
      f("imageUrl", url);
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      title: b.title, subtitle: b.subtitle ?? "", imageUrl: b.imageUrl ?? "",
      linkUrl: b.linkUrl ?? "", active: b.active, sortOrder: String(b.sortOrder),
    });
    setOpen(true);
  };

  const buildData = () => ({
    title: form.title, subtitle: form.subtitle || null,
    imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null,
    active: form.active, sortOrder: parseInt(form.sortOrder) || 0,
  });

  const handleSave = () => {
    const data = buildData();
    if (editId) {
      updateBanner.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "Banner updated" });
          queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
          queryClient.invalidateQueries({ queryKey: ["banners"] });
          setOpen(false);
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      });
    } else {
      createBanner.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Banner created" });
          queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
          queryClient.invalidateQueries({ queryKey: ["banners"] });
          setOpen(false);
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteBanner.mutate(id, {
      onSuccess: () => {
        toast({ title: "Banner deleted" });
        queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
        queryClient.invalidateQueries({ queryKey: ["banners"] });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const f = (k: keyof BannerForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="relative p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Image className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Banners</h2>
            <p className="text-xs text-muted-foreground">{filteredBanners.length} banners</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search banners..." className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-banners"] })} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Banner</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>}
            {filteredBanners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.imageUrl
                    ? <SafeImage src={b.imageUrl} className="h-12 w-20 object-cover rounded-lg border" alt="" />
                    : <div className="h-12 w-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/40"><Image className="h-5 w-5" /></div>}
                </TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">{b.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{b.subtitle || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{b.sortOrder}</TableCell>
                <TableCell>
                  <Badge variant={b.active ? "default" : "secondary"}>{b.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {b.linkUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue/10 hover:text-blue" asChild>
                        <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" title="View banner">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(b)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(b.id)}>
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
          <DialogHeader><DialogTitle>{editId ? "Edit Banner" : "Add Banner"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Title *</Label>
              <Input value={form.title} onChange={e => f("title", e.target.value)} placeholder="Free Fire Diamonds Sale" /></div>
            <div className="space-y-1.5"><Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => f("subtitle", e.target.value)} placeholder="Get up to 20% off…" /></div>
            <div className="space-y-1.5">
              <Label>Banner Image</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                  {form.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border group">
                  <SafeImage src={form.imageUrl} alt="preview" className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Replace
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs bg-red-500/80 border-red-400/20 text-white hover:bg-red-600"
                      onClick={() => f("imageUrl", "")}>
                      <X className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer p-4">
                  {uploading
                    ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                    : <>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload banner image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 10 MB</p>
                        </div>
                      </>
                  }
                </div>
              )}
            </div>
            <div className="space-y-1.5"><Label>Link URL</Label>
              <Input value={form.linkUrl} onChange={e => f("linkUrl", e.target.value)} placeholder="/products?category=game-topups" /></div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5"><Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={e => f("sortOrder", e.target.value)} /></div>
              <div className="flex items-center gap-2 pb-0.5">
                <Switch checked={form.active} onCheckedChange={v => f("active", v)} id="bActive" />
                <Label htmlFor="bActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || createBanner.isPending || updateBanner.isPending}>
              {editId ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Banner?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteBanner.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
