import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect, useCallback } from "react";
import { useGetMyProfile } from "@/lib/api-hooks";
import { ChatWidget } from "@/components/chat-widget";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useTheme } from "@/components/theme-provider";
import { AccountModal } from "@/components/account-modal";
import { SearchTrigger, SearchPalette } from "@/components/search-palette";
import { Logo, LogoMark, LogoText } from "@/components/logo";
import { motion } from "framer-motion";
import {
  User, LogOut, Menu, Shield, Sun, Moon,
  Gamepad2, Gift, Ticket, Zap, ChevronRight,
} from "lucide-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 border border-border hover:border-primary/40 hover:bg-primary/10 transition-all"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-foreground/70" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-400" />
      )}
    </Button>
  );
}

function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  const { data: profile } = useGetMyProfile({
    query: { queryKey: ["my-profile"], retry: false, enabled: isSignedIn },
  });
  const isAdmin = profile?.role === "admin";

  const navLinks = [
    { href: "/products", label: "All Products", icon: <Zap className="h-4 w-4" /> },
    { href: "/products?category=game-topups", label: "Top-ups", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/products?category=gift-cards", label: "Gift Cards", icon: <Gift className="h-4 w-4" /> },
    { href: "/products?category=vouchers", label: "Vouchers", icon: <Ticket className="h-4 w-4" /> },
  ];

  const isActive = (href: string) => location === href.split("?")[0];

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
    >
      <div className="container max-w-screen-xl flex h-16 items-center px-4 md:px-6">

        <div className="mr-8 shrink-0">
          <Logo href="/" size="md" />
        </div>

        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 + i * 0.04 }}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted"}`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="hidden lg:flex flex-1 justify-end mr-3">
          <SearchTrigger onOpen={() => setSearchOpen(true)} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isSignedIn ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/admin")}
                  className="gap-1.5 hidden lg:flex border border-border hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAccountOpen(true)}
                className="rounded-full w-9 h-9 border border-border hover:border-primary/40 hover:bg-primary/10"
                title="My Account"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { signOut(); setLocation("/"); }}
                className="rounded-full w-9 h-9 border border-border hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/sign-in")}
                className="hidden lg:flex text-foreground/70 hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => setLocation("/sign-in")}
                className="hidden lg:flex bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90 shadow-sm"
              >
                Sign Up
              </Button>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full w-9 h-9 border border-border"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-border">
                  <div onClick={() => setMobileOpen(false)}>
                    <Logo href="/" size="md" />
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{link.icon}</span>
                        {link.label}
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-2">
                  {isSignedIn ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => { setMobileOpen(false); setAccountOpen(true); }}
                      >
                        <User className="h-4 w-4" /> My Account
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => { setLocation("/admin"); setMobileOpen(false); }}
                        >
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { signOut(); setLocation("/"); }}
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white border-none"
                        onClick={() => { setLocation("/sign-in"); setMobileOpen(false); }}
                      >
                        Sign Up
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => { setLocation("/sign-in"); setMobileOpen(false); }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>

    <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container max-w-screen-xl px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-3">
              <Logo href="/" size="sm" markSize={26} />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop shop for game top-ups, gift cards, and subscriptions. Fast delivery. Secure payments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products?category=game-topups" className="hover:text-primary transition-colors">Game Top-ups</Link></li>
              <li><Link href="/products?category=gift-cards" className="hover:text-primary transition-colors">Gift Cards</Link></li>
              <li><Link href="/products?category=subscriptions" className="hover:text-primary transition-colors">Subscriptions</Link></li>
              <li><Link href="/products?category=vouchers" className="hover:text-primary transition-colors">Vouchers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Live Chat</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Payment Methods</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Track Order</span></li>
              <li>
                <a href="https://wa.me/9779826749317" target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary transition-colors">WhatsApp Support</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 Digital HUB Nepal. All rights reserved.</p>
          <p>Accepts: eSewa · Khalti · IME Pay</p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          Made with ❤️ and ☕ in Nepal
        </p>
      </div>
    </footer>
  );
}
