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
import { CustomerReviewsPanel } from "@/components/customer-reviews";
import { motion } from "framer-motion";
import {
  User, LogOut, Menu, Shield, Sun, Moon, Download,
  Gamepad2, Gift, Ticket, Zap, ChevronRight,
} from "lucide-react";

const APK_DOWNLOAD_URL = "https://github.com/Bholanath-Yadav/DigitalHUB/releases/latest/download/DigitalHUB.apk";

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

function AppDownloadButton() {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="hidden lg:inline-flex gap-1.5 border-primary/35 hover:bg-primary/10"
      aria-label="Download app"
      title="Download app"
    >
      <a href={APK_DOWNLOAD_URL} download="DigitalHUB.apk">
        <Download className="h-4 w-4" />
        Download App
      </a>
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

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center mr-1">
            <SearchTrigger onOpen={() => setSearchOpen(true)} />
          </div>
          <ThemeToggle />

          {isSignedIn ? (
            <>
              <AppDownloadButton />
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
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/sign-in")}
                className="rounded-full w-9 h-9 border border-border hover:border-primary/40 hover:bg-primary/10"
                title="Profile / Sign in"
              >
                <User className="h-4 w-4" />
              </Button>
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
                      <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left">
                        <p className="text-xs font-medium text-foreground truncate">{profile?.name || "My Account"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{profile?.email || "Signed in"}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => { setMobileOpen(false); setAccountOpen(true); }}
                      >
                        <User className="h-4 w-4" /> My Account
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <a href={APK_DOWNLOAD_URL} download="DigitalHUB.apk">
                          <Download className="h-4 w-4" /> Download App
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => { setLocation("/profile"); setMobileOpen(false); }}
                      >
                        <User className="h-4 w-4" /> Profile
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
  const [location] = useLocation();
  const isCheckoutPage = location === "/checkout" || location.startsWith("/checkout/");

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background via-card/25 to-background overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container max-w-screen-xl px-4 md:px-6 py-10 md:py-12 relative">
        {!isCheckoutPage && (
          <div className="mb-8 rounded-[2rem] border border-border/60 bg-card/70 backdrop-blur-md shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)] p-4 sm:p-6">
            <CustomerReviewsPanel />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start text-left">
          <div className="lg:col-span-5">
            <div className="mb-3 flex items-center gap-2">
              <Logo href="/" size="sm" markSize={26} />
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-6">
              Your one-stop shop for game top-ups, gift cards, and subscriptions. Fast delivery. Secure payments.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">Fast delivery</span>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">Secure checkout</span>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">NPR pricing</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm mb-3 text-foreground">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products?category=game-topups" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Game Top-ups</Link></li>
              <li><Link href="/products?category=gift-cards" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Gift Cards</Link></li>
              <li><Link href="/products?category=subscriptions" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Subscriptions</Link></li>
              <li><Link href="/products?category=vouchers" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Vouchers</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm mb-3 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Live Chat</span></li>
              <li><span className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Payment Methods</span></li>
              <li><span className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Track Order</span></li>
              <li>
                <a href="https://wa.me/9779826749317" target="_blank" rel="noopener noreferrer"
                  className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">WhatsApp Support</a>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-sm mb-3 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/refund-policy" className="inline-flex rounded-md px-2 py-1 -mx-2 hover:bg-primary/10 hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <p className="font-medium">© 2026 Digital HUB Nepal. All rights reserved.</p>
          <p className="inline-flex flex-wrap gap-x-2 gap-y-1">Accepts: <span className="font-medium text-foreground/80">eSewa</span> · <span className="font-medium text-foreground/80">Khalti</span> · <span className="font-medium text-foreground/80">IME Pay</span></p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/60 tracking-wide">
          Made with ❤️ and ☕ in Nepal
        </p>
      </div>
    </footer>
  );
}
