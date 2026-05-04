import { useGetMyOrders, useGetMyProfile, useUpdateMyProfile } from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { compressImage } from "@/lib/upload";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Settings, LogOut, Clock, CheckCircle, XCircle, Camera, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { fmtNPR } from "@/lib/currency";

export default function Profile() {
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const { toast }  = useToast();
  const [, setLocation] = useLocation();

  const { data: profile } = useGetMyProfile({ query: { queryKey: ["my-profile"], enabled: !!isSignedIn } });
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders({ query: { queryKey: ["my-orders"], enabled: !!isSignedIn } });
  const updateProfile = useUpdateMyProfile();

  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) { setName(profile.name || ""); setPhone(profile.phone || ""); }
  }, [profile]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/");
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }
  if (!isSignedIn) return null;

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { data: { name, phone } },
      {
        onSuccess: () => { toast({ title: "Profile updated" }); queryClient.invalidateQueries({ queryKey: ["my-profile"] }); },
        onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
      }
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" }); return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20 MB allowed.", variant: "destructive" }); return;
    }
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarLoading(true);
    try {
      const compressed = await compressImage(file, 512, 0.82);
      const path = `avatars/${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      await updateProfile.mutateAsync({ data: { avatarUrl: urlData.publicUrl } });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Profile photo updated!" });
    } catch {
      toast({ title: "Failed to update photo", variant: "destructive" });
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
      URL.revokeObjectURL(localPreview);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const getStatusBadge = (status: string) => {
    const MAP: Record<string, { icon: any; cls: string; label: string }> = {
      pending:   { icon: Clock,        cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",  label: "Pending"   },
      verified:  { icon: CheckCircle,  cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",        label: "Verified"  },
      completed: { icon: CheckCircle,  cls: "bg-green-500/10 text-green-500 border-green-500/20",     label: "Completed" },
      rejected:  { icon: XCircle,      cls: "bg-red-500/10 text-red-500 border-red-500/20",           label: "Rejected"  },
    };
    const s = MAP[status];
    if (!s) return <Badge>{status}</Badge>;
    const Icon = s.icon;
    return <Badge variant="outline" className={s.cls}><Icon className="w-3 h-3 mr-1" />{s.label}</Badge>;
  };

  const displayAvatar = avatarPreview || profile?.avatarUrl;

  return (
    <div className="container py-8 px-4 md:px-6 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl shadow-sm">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-md overflow-hidden">
                {displayAvatar
                  ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-muted-foreground">
                      {(profile?.name || user?.email || "?")[0]?.toUpperCase()}
                    </div>
                }
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background hover:bg-primary/80 disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <h2 className="font-bold text-lg leading-tight">{profile?.name || user?.email?.split("@")[0] || "User"}</h2>
            <p className="text-xs text-muted-foreground mt-1 break-all">{profile?.email || user?.email}</p>
            <Badge className="mt-3 capitalize" variant={profile?.role === "admin" ? "default" : "secondary"}>
              {profile?.role || "user"}
            </Badge>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="mt-3 text-xs text-primary hover:underline disabled:opacity-50"
              disabled={avatarLoading}
            >
              {avatarLoading ? "Uploading…" : "Change photo"}
            </button>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { signOut(); setLocation("/"); }}
          >
            <LogOut className="mr-2 h-4 w-4" />Sign Out
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="w-full justify-start mb-6 border-b border-border rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="orders" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3">
                <ShoppingBag className="w-4 h-4 mr-2" />My Orders
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3">
                <Settings className="w-4 h-4 mr-2" />Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {ordersLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl border border-border" />)}</div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border">
                  <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No orders yet</h3>
                  <p className="text-muted-foreground text-sm mt-1 mb-6">You haven't made any purchases yet.</p>
                  <Button asChild><Link href="/products">Browse Products</Link></Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders?.map(order => (
                    <Card key={order.id} className="overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">#{order.id}</span>
                          <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                          {order.product.imageUrl && (
                            <img src={order.product.imageUrl} className="h-14 w-14 rounded-lg object-cover border border-border shrink-0" alt="" />
                          )}
                          <div>
                            <h4 className="font-semibold text-sm">{order.product.name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{order.product.category.replace("-"," ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:ml-auto">
                          <div className="font-bold">{fmtNPR(order.totalAmount - order.discountAmount)}</div>
                          <Button variant="outline" size="sm" asChild><Link href={`/orders/${order.id}`}>View Details</Link></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-base">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">Update your display name and phone number</p>
                  </div>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile?.email || user?.email || ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+977 9800000000" />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="mt-1 gap-2">
                      {updateProfile.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
