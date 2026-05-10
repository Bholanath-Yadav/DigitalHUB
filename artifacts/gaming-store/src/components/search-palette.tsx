import { useState, useEffect, useRef, useCallback } from "react";
import { useListProducts } from "@/lib/api-hooks";
import { Link } from "wouter";
import { Search, Gamepad2, X, ArrowRight, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fmtNPR } from "@/lib/currency";

const CATEGORY_LABELS: Record<string, string> = {
  gaming:          "Game Top-up",
  "gift-cards":    "Gift Card",
  streaming:       "Subscription",
  "digital-tools": "Digital Tools",
  "social-boost":  "Social Boost",
  "vpn-privacy":   "VPN & Privacy",
};

function isMac() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

function useCommandKey() {
  return isMac() ? "⌘" : "Ctrl";
}

/* ─── Trigger button shown in the navbar ─── */
export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const cmdKey = useCommandKey();
  return (
    <button
      onClick={onOpen}
      className="hidden lg:flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border bg-muted/60 hover:bg-muted hover:border-border/80 transition-all duration-150 text-sm text-muted-foreground min-w-[200px] xl:min-w-[240px] group"
      aria-label="Search products"
    >
      <Search className="h-3.5 w-3.5 shrink-0 group-hover:text-foreground transition-colors" />
      <span className="flex-1 text-left text-sm">Search...</span>
      <kbd className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm shrink-0">
        {cmdKey}K
      </kbd>
    </button>
  );
}

/* ─── Full palette modal ─── */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading } = useListProducts(
    { search: query || undefined },
    {
      query: {
        queryKey: ["search-palette", query],
        enabled: open && query.trim().length > 0,
        staleTime: 30_000,
      },
    }
  );

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && results && results.length > 0;
  const showEmpty = hasQuery && !isLoading && results?.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-[61] w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd
                onClick={onClose}
                className="hidden sm:inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">

              {/* Loading */}
              {isLoading && hasQuery && (
                <div className="flex flex-col gap-2.5 p-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-lg animate-shimmer shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 animate-shimmer rounded w-3/5" />
                        <div className="h-2.5 animate-shimmer rounded w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results list */}
              {showResults && (
                <ul className="p-2">
                  {results!.slice(0, 8).map(product => {
                    const hasVars = Array.isArray(product.variants) && product.variants.length > 0;
                    const price = hasVars
                      ? (() => {
                          const prices = product.variants!.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
                          return prices.length ? `from ${fmtNPR(Math.min(...prices))}` : null;
                        })()
                      : Number(product.price) > 0 ? fmtNPR(Number(product.price)) : null;

                    return (
                      <li key={product.id}>
                        <Link
                          href={`/products/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/60 shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gamepad2 className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {CATEGORY_LABELS[product.category as string] ?? product.category}
                            </p>
                          </div>

                          {/* Price + arrow */}
                          <div className="flex items-center gap-2 shrink-0">
                            {price && (
                              <span className="text-sm font-black text-black dark:text-white">{price}</span>
                            )}
                            {!product.inStock && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                                Out of Stock
                              </span>
                            )}
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}

                  {/* "View all" if more than 8 */}
                  {results!.length > 8 && (
                    <li>
                      <Link
                        href={`/products?search=${encodeURIComponent(query)}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-primary hover:underline"
                      >
                        View all {results!.length} results <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              {/* Empty state */}
              {showEmpty && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No results for "{query}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different keyword or browse by category.</p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Browse all products <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Default state — quick links */}
              {!hasQuery && (
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                    Quick links
                  </p>
                  <ul className="space-y-0.5">
                    {[
                      { href: "/products", label: "All Products", sub: "Browse everything", icon: <Zap className="h-4 w-4" /> },
                      { href: "/products?category=gaming", label: "Game Top-ups", sub: "Free Fire, PUBG, TikTok…", icon: <Gamepad2 className="h-4 w-4" /> },
                      { href: "/products?category=gift-cards",  label: "Gift Cards",   sub: "Google Play, Steam…", icon: <Gamepad2 className="h-4 w-4" /> },
                    ].map(item => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.sub}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground bg-muted/30">
              <span className="flex items-center gap-1"><kbd className="bg-background border border-border rounded px-1">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="bg-background border border-border rounded px-1">ESC</kbd> close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
