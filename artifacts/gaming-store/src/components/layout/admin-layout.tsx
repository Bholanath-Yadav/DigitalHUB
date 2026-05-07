import { useState } from "react";
import { useGetMyProfile } from "@/lib/api-hooks";
import { Link, useLocation, Redirect } from "wouter";
import { Shield, Package, ShoppingCart, CreditCard, Tag, Image as ImageIcon, Users, MessageSquare, Home, Wallet, Menu, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useGetMyProfile({
    query: { queryKey: ["my-profile"], retry: false }
  });
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return <Redirect to="/" />;
  }

  const navItems = [
    { href: "/admin",                   label: "Dashboard",    icon: Shield },
    { href: "/admin/products",          label: "Products",     icon: Package },
    { href: "/admin/orders",            label: "Orders",       icon: ShoppingCart },
    { href: "/admin/payments",          label: "Payments",     icon: CreditCard },
    { href: "/admin/coupons",           label: "Coupons",      icon: Tag },
    { href: "/admin/banners",           label: "Banners",      icon: ImageIcon },
    { href: "/admin/users",             label: "Users",        icon: Users },
    { href: "/admin/chat",              label: "Chat",         icon: MessageSquare },
    { href: "/admin/reviews",           label: "Reviews",      icon: MessageSquareQuote },
    { href: "/admin/payment-settings",  label: "Pay Settings", icon: Wallet },
  ];

  const isActive = (href: string) => location === href;

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} onClick={onNavigate}>
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer border
            ${isActive(item.href)
              ? "border-white/10 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
              : "border-transparent text-white/65 hover:border-white/5 hover:bg-white/5 hover:text-white"}`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        </Link>
      ))}
    </>
  );

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#07090d] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.10),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_10%,transparent_90%,rgba(255,255,255,0.02))]" />

      {/* ── Desktop sidebar ── */}
      <aside className="relative z-10 hidden md:flex w-60 xl:w-64 shrink-0 flex-col border-r border-white/10 bg-[#0b0d12]/90 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 font-bold text-base text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Shield className="h-4 w-4 text-sky-300" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-wide">Admin Panel</span>
              <span className="block text-[11px] font-normal text-white/50">LifeLine operations</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/10">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4" />
            Back to Store
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0d12]/95 px-4 backdrop-blur-2xl">
          <span className="flex items-center gap-2 font-bold text-white">
            <Shield className="h-4 w-4 text-sky-300" /> Admin Panel
          </span>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-white/10 bg-[#0b0d12] text-white">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="h-14 flex items-center justify-between px-5 border-b border-white/10">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-sky-300" /> Admin Panel
                  </span>
                </div>
                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
                <div className="p-3 border-t border-white/10">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => { setLocation("/"); setMobileOpen(false); }}>
                    <Home className="h-4 w-4" />
                    Back to Store
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Page content ── */}
        <main className="relative flex-1 overflow-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_26%)]" />
          <div className="relative mx-auto w-full max-w-[1800px] min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
