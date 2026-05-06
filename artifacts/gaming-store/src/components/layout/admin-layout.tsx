import { useState } from "react";
import { useGetMyProfile } from "@/lib/api-hooks";
import { Link, useLocation, Redirect } from "wouter";
import { Shield, Package, ShoppingCart, CreditCard, Tag, Image as ImageIcon, Users, MessageSquare, Home, Wallet, Menu, X, MessageSquareQuote } from "lucide-react";
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
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer
            ${isActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Desktop sidebar ── */}
      <aside className="w-56 xl:w-64 border-r border-border/40 bg-card hidden md:flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-border/40">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-base text-primary">
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-border/40">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4" />
            Back to Store
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden h-14 border-b border-border/40 bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
          <span className="font-bold text-primary flex items-center gap-2">
            <Shield className="h-4 w-4" /> Admin Panel
          </span>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 border border-border rounded-lg">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="h-14 flex items-center justify-between px-5 border-b border-border/40">
                  <span className="font-bold text-primary flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </span>
                </div>
                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
                <div className="p-3 border-t border-border/40">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2"
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
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
