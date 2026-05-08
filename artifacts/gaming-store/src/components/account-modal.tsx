import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { compressImage } from "@/lib/upload";
import { useGetMyOrders, useGetMyProfile, useUpdateMyProfile } from "@/lib/api-hooks";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { queryClient } from "@/lib/queryClient";
import { fmtNPR } from "@/lib/currency";
import { Link } from "wouter";
import {
  User, ShoppingBag, Settings, Shield, LogOut, Camera, Loader2,
  Clock, CheckCircle, XCircle, Sun, Moon, Bell, Tag, Package,
  KeyRound, Smartphone, ChevronRight, Upload, Trash2,
} from "lucide-react";
import SafeImage from "@/components/safe-image";

type Section = "profile" | "orders" | "preferences" | "security";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { id: Section; icon: React.ElementType; label: string; sub: string }[] = [
  { id: "profile",     icon: User,        label: "Profile Details", sub: "Manage your profile info"    },
  { id: "orders",      icon: ShoppingBag, label: "My Orders",       sub: "View your order history"     },
  { id: "preferences", icon: Settings,    label: "Preferences",     sub: "Notifications & display"     },
  { id: "security",    icon: Shield,      label: "Security",        sub: "Password & account safety"   },
];

const PREF_KEY = "gs_notification_prefs";
const defaultPrefs = { orderUpdates: true, promotions: false, newArrivals: true };

function loadPrefs() {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; }
  catch { return defaultPrefs; }
}

export function AccountModal({ open, onClose }: AccountModalProps) {
  const { isSignedIn, signOut, user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [section, setSection] = useState<Section>("profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useGetMyProfile({ query: { queryKey: ["my-profile"], enabled: !!isSignedIn } });
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders({ query: { queryKey: ["my-orders"], enabled: !!isSignedIn && section === "orders" } });
  const updateProfile = useUpdateMyProfile();

  useEffect(() => {
    if (profile) { setName(profile.name || ""); setPhone(profile.phone || ""); }
  }, [profile]);

  useEffect(() => {
    if (!open) { setAvatarPreview(null); setSection("profile"); setNewPassword(""); setConfirmPassword(""); setMobileNavOpen(false); }
  }, [open]);

  if (!isSignedIn) return null;

  const displayAvatar = avatarBroken ? null : (avatarPreview || profile?.avatarUrl || null);
  const initials = (profile?.name || user?.email || "?")[0]?.toUpperCase();

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { data: { name, phone } },
      {
        onSuccess: () => { toast({ title: "Profile updated!" }); queryClient.invalidateQueries({ queryKey: ["my-profile"] }); },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" }); return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large — max 20 MB", variant: "destructive" }); return;
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarLoading(true);
    try {
      const compressed = await compressImage(file, 512, 0.82);
      const path = `avatars/${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const avatarUrl = urlData.publicUrl;

      await updateProfile.mutateAsync({ data: { avatarUrl } });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Profile photo updated!" });
    } catch {
      toast({ title: "Failed to update photo", variant: "destructive" });
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
      URL.revokeObjectURL(preview);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarLoading(true);
    try {
      await updateProfile.mutateAsync({ data: { avatarUrl: null } });
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Photo removed" });
    } catch {
      toast({ title: "Failed to remove photo", variant: "destructive" });
    } finally { setAvatarLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({ title: "Password too short", description: "At least 8 characters required.", variant: "destructive" }); return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully!" });
      setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Failed to update password", description: err.message, variant: "destructive" });
    } finally { setPasswordLoading(false); }
  };

  const savePrefs = (next: typeof prefs) => {
    setPrefs(next);
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
    toast({ title: "Preferences saved!" });
  };

  const getStatusBadge = (status: string) => {
    const MAP: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
      pending:   { icon: Clock,       cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Pending"   },
      verified:  { icon: CheckCircle, cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",       label: "Verified"  },
      completed: { icon: CheckCircle, cls: "bg-green-500/10 text-green-500 border-green-500/20",    label: "Completed" },
      rejected:  { icon: XCircle,     cls: "bg-red-500/10 text-red-500 border-red-500/20",          label: "Rejected"  },
    };
    const s = MAP[status];
    if (!s) return <Badge variant="outline">{status}</Badge>;
    const Icon = s.icon;
    return <Badge variant="outline" className={s.cls}><Icon className="w-3 h-3 mr-1" />{s.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 max-w-[900px] w-[100vw] h-[100dvh] sm:w-[95vw] sm:h-[85vh] max-h-none sm:max-h-[680px] flex flex-col lg:flex-row overflow-hidden rounded-none sm:rounded-2xl gap-0 border border-border shadow-2xl">
        <DialogTitle className="sr-only">Account</DialogTitle>

        {/* ── Left Sidebar ── */}
        <div className="hidden lg:flex w-full lg:w-56 shrink-0 bg-muted/40 border-b lg:border-b-0 lg:border-r border-border flex-col">
          <div className="p-4 sm:p-5 border-b border-border">
            <h2 className="font-bold text-base">Account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your account info.</p>
          </div>
          <nav className="flex-1 p-3 grid grid-cols-2 gap-2 sm:grid-cols-1 sm:space-y-1 sm:gap-0">
            {NAV_ITEMS.map(({ id, icon: Icon, label, sub }) => (
              <button key={id} onClick={() => setSection(id)}
                className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all group min-h-[4.5rem] sm:min-h-0
                  ${section === id ? "bg-primary/10 text-primary shadow-sm" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${section === id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <div className="min-w-0">
                  <div className={`text-sm font-medium leading-tight ${section === id ? "text-primary" : ""}`}>{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight truncate">{sub}</div>
                </div>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4 shrink-0" />Sign Out
            </button>
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-3 lg:hidden mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-lg">{NAV_ITEMS.find(n => n.id === section)?.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{NAV_ITEMS.find(n => n.id === section)?.sub}</p>
              </div>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0 gap-2">
                    <Settings className="h-4 w-4" /> Sections
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[72vh] rounded-t-2xl p-0">
                  <SheetTitle className="sr-only">Account Sections</SheetTitle>
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-base">Account Sections</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose a section to view.</p>
                  </div>
                  <div className="p-3 grid gap-2 overflow-y-auto pb-4">
                    {NAV_ITEMS.map(({ id, icon: Icon, label, sub }) => (
                      <button
                        key={id}
                        onClick={() => { setSection(id); setMobileNavOpen(false); }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[3.75rem]
                          ${section === id ? "bg-primary/10 text-primary shadow-sm" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${section === id ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${section === id ? "text-primary" : ""}`}>{label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-tight truncate">{sub}</div>
                        </div>
                      </button>
                    ))}
                    <div className="pt-2">
                      <button
                        onClick={() => { setMobileNavOpen(false); onClose(); signOut(); }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden lg:block">
              <h3 className="font-bold text-lg">{NAV_ITEMS.find(n => n.id === section)?.label}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{NAV_ITEMS.find(n => n.id === section)?.sub}</p>
            </div>
          </div>

          <ScrollArea className="flex-1 scroll-smooth">
            <div className="px-4 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-6">

              {/* ── PROFILE ── */}
              {section === "profile" && (
                <>
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/10 relative">
                      <div className="absolute -bottom-10 left-4 sm:left-6 flex items-end gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-muted border-4 border-background shadow-lg overflow-hidden">
                            {displayAvatar
                              ? <SafeImage src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-muted-foreground bg-gradient-to-br from-primary/20 to-secondary/20">{initials}</div>
                            }
                            {avatarLoading && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                                <Loader2 className="h-5 w-5 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <button onClick={() => avatarInputRef.current?.click()} disabled={avatarLoading}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow border-2 border-background hover:bg-primary/80 disabled:opacity-50">
                            <Camera className="h-3 w-3" />
                          </button>
                          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>
                      </div>
                    </div>
                    <div className="pt-12 px-4 sm:px-6 pb-5">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-sm">Profile Image</p>
                        {profile?.role && (
                          <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">{profile.role}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">JPG, PNG or WEBP — max 5 MB</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1.5" onClick={() => avatarInputRef.current?.click()} disabled={avatarLoading}>
                          <Upload className="h-3.5 w-3.5" /> Upload
                        </Button>
                        {displayAvatar && (
                          <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30" onClick={handleRemoveAvatar} disabled={avatarLoading}>
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border p-4 sm:p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="acc-email" className="text-sm font-medium">Email address</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input id="acc-email" value={profile?.email || user?.email || ""} disabled className="bg-muted text-muted-foreground w-full flex-1" />
                        <Badge variant="secondary" className="self-start sm:self-center px-3 py-1.5 text-xs shrink-0">Primary</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="acc-name" className="text-sm font-medium">Display name</Label>
                        <Input id="acc-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="acc-phone" className="text-sm font-medium">Phone number</Label>
                        <Input id="acc-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+977 9800000000" />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90">
                      {updateProfile.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
                    </Button>
                  </div>
                </>
              )}

              {/* ── ORDERS ── */}
              {section === "orders" && (
                <>
                  {ordersLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
                  ) : !orders?.length ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold">No orders yet</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-5">Start shopping to see your orders here.</p>
                      <Button asChild onClick={onClose} className="bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90">
                        <Link href="/products">Browse Products</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div key={order.id} className="rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
                              <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-3 px-4 py-3">
                            {order.product.imageUrl && (
                              <SafeImage src={order.product.imageUrl} className="h-12 w-12 rounded-lg object-cover border border-border shrink-0" alt="" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{order.product.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{order.product.category.replace(/-/g, " ")}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-bold text-sm">{fmtNPR(order.totalAmount - order.discountAmount)}</span>
                              <Button variant="outline" size="sm" asChild onClick={onClose} className="gap-1 text-xs h-7">
                                <Link href={`/orders/${order.id}`}>View <ChevronRight className="h-3 w-3" /></Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── PREFERENCES ── */}
              {section === "preferences" && (
                <>
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-muted/30 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="h-4 w-4 text-primary" /></div>
                      <div><p className="font-semibold text-sm">Notifications</p><p className="text-xs text-muted-foreground">Manage what updates you receive</p></div>
                    </div>
                    {[
                      { key: "orderUpdates" as const, icon: Package, label: "Order updates", sub: "Status changes, payment confirmations" },
                      { key: "promotions"   as const, icon: Tag,     label: "Promotions & deals", sub: "Coupons, flash sales, special offers" },
                      { key: "newArrivals"  as const, icon: Bell,    label: "New arrivals", sub: "New game top-ups and gift cards" },
                    ].map(({ key, icon: Icon, label, sub }, i, arr) => (
                      <div key={key} className={`flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0"><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
                        </div>
                        <Switch checked={prefs[key]} onCheckedChange={v => setPrefs({ ...prefs, [key]: v })} />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-muted/30 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        {theme === "light" ? <Sun className="h-4 w-4 text-secondary" /> : <Moon className="h-4 w-4 text-secondary" />}
                      </div>
                      <div><p className="font-semibold text-sm">Display</p><p className="text-xs text-muted-foreground">Appearance preferences</p></div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {theme === "light" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                        <div><p className="text-sm font-medium">{theme === "light" ? "Light mode" : "Dark mode"}</p><p className="text-xs text-muted-foreground">Switch between light and dark theme</p></div>
                      </div>
                      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                    </div>
                  </div>

                  <Button onClick={() => savePrefs(prefs)} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90">
                    Save Preferences
                  </Button>
                </>
              )}

              {/* ── SECURITY ── */}
              {section === "security" && (
                <>
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-muted/30 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><KeyRound className="h-4 w-4 text-orange-500" /></div>
                      <div><p className="font-semibold text-sm">Change Password</p><p className="text-xs text-muted-foreground">Update your account password</p></div>
                    </div>
                    <div className="px-4 sm:px-5 py-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pass" className="text-sm">New Password</Label>
                        <Input id="new-pass" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={passwordLoading} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-pass" className="text-sm">Confirm Password</Label>
                        <Input id="confirm-pass" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={passwordLoading} />
                      </div>
                      <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword || !confirmPassword} className="w-full sm:w-auto gap-2">
                        {passwordLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <><KeyRound className="h-4 w-4" /> Update Password</>}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-muted/30 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Smartphone className="h-4 w-4 text-blue-500" /></div>
                      <div><p className="font-semibold text-sm">Account Info</p><p className="text-xs text-muted-foreground">Your account details</p></div>
                    </div>
                    <div className="px-4 sm:px-5 py-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Email: <span className="font-medium text-foreground">{user?.email}</span></p>
                      <p className="text-sm text-muted-foreground">Member since: <span className="font-medium text-foreground">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span></p>
                      <p className="text-sm text-muted-foreground">Role: <span className="font-medium text-foreground capitalize">{profile?.role || "user"}</span></p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
