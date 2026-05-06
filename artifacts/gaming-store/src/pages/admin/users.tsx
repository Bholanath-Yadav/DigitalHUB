import { useMemo, useState } from "react";
import { useListAdminUsers as useListUsers, useUpdateUserRole, useBanUser, useDeleteAdminUser as useDeleteUser } from "@/lib/api-hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Users, Search, Shield, ShieldOff, Trash2,
  Crown, User as UserIcon, Briefcase, Ban, CheckCircle, RefreshCcw,
} from "lucide-react";

const ROLE_CONFIG = {
  admin: { label: "Admin",  icon: Crown,    cls: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  staff: { label: "Staff",  icon: Briefcase,cls: "bg-blue-500/10 text-blue-500 border-blue-500/20"     },
  user:  { label: "User",   icon: UserIcon, cls: "bg-muted text-muted-foreground border-border"         },
};

type UserRow = {
  id: number; supabaseId: string; email: string; name?: string | null;
  phone?: string | null; avatarUrl?: string | null;
  role: "user" | "staff" | "admin"; isBanned: boolean; createdAt: string;
};

export default function AdminUsers() {
  const { data: users = [], isLoading } = useListUsers({ query: { queryKey: ["admin-users"] } });
  const updateRole = useUpdateUserRole();
  const banUser    = useBanUser();
  const deleteUser = useDeleteUser();
  const { toast }  = useToast();

  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"all" | "active" | "banned">("all");
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [confirmBan, setConfirmBan]       = useState<{ user: UserRow; ban: boolean } | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const handleRoleChange = (supabaseId: string, role: "user" | "staff" | "admin") => {
    updateRole.mutate(
      { userId: supabaseId, data: { role } },
      { onSuccess: () => { toast({ title: "Role updated" }); invalidate(); },
        onError:   () =>  toast({ title: "Failed to update role", variant: "destructive" }) }
    );
  };

  const handleBan = (user: UserRow, ban: boolean) => {
    banUser.mutate(
      { userId: user.supabaseId, data: { isBanned: ban } },
      { onSuccess: () => { toast({ title: ban ? `${user.name || user.email} banned` : `${user.name || user.email} unbanned` }); invalidate(); setConfirmBan(null); },
        onError:   () =>  toast({ title: "Action failed", variant: "destructive" }) }
    );
  };

  const handleDelete = (user: UserRow) => {
    deleteUser.mutate(
      user.supabaseId,
      { onSuccess: () => { toast({ title: "User deleted" }); invalidate(); setConfirmDelete(null); },
        onError:   (e: any) => toast({ title: e?.response?.data?.error ?? "Delete failed", variant: "destructive" }) }
    );
  };

  const filtered = useMemo(() => (users as UserRow[]).filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === "all" || (filter === "banned" ? u.isBanned : !u.isBanned);
    return matchSearch && matchFilter;
  }), [users, search, filter]);

  const counts = {
    all:    (users as UserRow[]).length,
    active: (users as UserRow[]).filter(u => !u.isBanned).length,
    banned: (users as UserRow[]).filter(u =>  u.isBanned).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Users</h2>
            <p className="text-xs text-muted-foreground">{counts.all} registered · {counts.banned} banned</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })} className="gap-2 self-start">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "banned"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize gap-1.5">
              {f === "banned" && <Ban className="h-3.5 w-3.5" />}
              {f === "active" && <CheckCircle className="h-3.5 w-3.5" />}
              {f} <span className="text-xs opacity-70">({counts[f]})</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        {isLoading ? (
          <div className="space-y-0">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted animate-pulse rounded w-32" />
                  <div className="h-3 bg-muted animate-pulse rounded w-48" />
                </div>
                <div className="h-7 bg-muted animate-pulse rounded w-24 hidden sm:block" />
                <div className="h-7 bg-muted animate-pulse rounded w-20 hidden md:block" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Users className="mx-auto h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_120px_160px_100px] gap-4 px-4 py-2.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>User</span><span>Phone</span><span>Joined</span><span>Role</span><span>Actions</span>
            </div>

            {filtered.map(user => {
              const roleInfo = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.user;
              const RoleIcon = roleInfo.icon;
              const initials = (user.name || user.email || "?")[0].toUpperCase();

              return (
                <div
                  key={user.supabaseId}
                  className={`flex flex-col sm:grid sm:grid-cols-[2fr_1fr_120px_160px_100px] gap-3 sm:gap-4 px-4 py-3.5 items-start sm:items-center transition-colors
                    ${user.isBanned ? "bg-red-500/5" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold
                        ${user.isBanned ? "border-destructive/40 opacity-60" : "border-border"}`}>
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground">{initials}</div>
                        }
                      </div>
                      {user.isBanned && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                          <Ban className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{user.name || "—"}</span>
                        {user.isBanned && <Badge variant="destructive" className="text-xs px-1.5 py-0">Banned</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground break-all sm:break-normal sm:truncate max-w-full">{user.email}</p>
                    </div>
                  </div>

                  <span className="text-sm text-muted-foreground sm:truncate">
                    {user.phone || <span className="text-muted-foreground/40">—</span>}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })}
                  </span>

                  <div>
                    <Select value={user.role} onValueChange={(val: any) => handleRoleChange(user.supabaseId, val)} disabled={updateRole.isPending}>
                      <SelectTrigger className="h-8 text-xs w-[140px]">
                        <SelectValue>
                          <div className="flex items-center gap-1.5"><RoleIcon className="h-3 w-3" />{roleInfo.label}</div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user"><div className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5" /> User</div></SelectItem>
                        <SelectItem value="staff"><div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Staff</div></SelectItem>
                        <SelectItem value="admin"><div className="flex items-center gap-2"><Crown className="h-3.5 w-3.5" /> Admin</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon"
                      className={`h-8 w-8 ${user.isBanned ? "text-green-600 hover:bg-green-500/10" : "text-orange-500 hover:bg-orange-500/10"}`}
                      title={user.isBanned ? "Unban user" : "Ban user"}
                      onClick={() => setConfirmBan({ user, ban: !user.isBanned })}>
                      {user.isBanned ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete user" onClick={() => setConfirmDelete(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!confirmBan} onOpenChange={v => !v && setConfirmBan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmBan?.ban
                ? <><Shield className="h-5 w-5 text-orange-500" /> Ban user?</>
                : <><ShieldOff className="h-5 w-5 text-green-600" /> Unban user?</>
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBan?.ban
                ? `${confirmBan.user.name || confirmBan.user.email} will be banned and blocked from signing in.`
                : `${confirmBan?.user.name || confirmBan?.user.email} will be able to sign in again.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmBan?.ban ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}
              onClick={() => confirmBan && handleBan(confirmBan.user, confirmBan.ban)}>
              {confirmBan?.ban ? "Ban User" : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={v => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" /> Delete user permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{confirmDelete?.name || confirmDelete?.email}</strong> and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
