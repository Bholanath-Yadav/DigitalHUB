import { useListProducts, ListProductsCategory } from "@/lib/api-hooks";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Gamepad2, Gift, Tv, Ticket, Zap, LayoutGrid, List } from "lucide-react";
import { fmtNPR } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper, FadeUp, MotionCard, fadeUp, scaleIn, staggerFast } from "@/components/motion";
import { useSEO } from "@/hooks/use-seo";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const CATEGORIES = [
  { value: "all",           label: "All",           icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: "game-topups",   label: "Top-ups",        icon: <Gamepad2 className="h-3.5 w-3.5" /> },
  { value: "gift-cards",    label: "Gift Cards",     icon: <Gift className="h-3.5 w-3.5" /> },
  { value: "subscriptions", label: "Subscriptions",  icon: <Tv className="h-3.5 w-3.5" /> },
  { value: "vouchers",      label: "Vouchers",       icon: <Ticket className="h-3.5 w-3.5" /> },
];

function getPriceLabel(product: any): { label: string; prefix?: string } | null {
  const hasVars = Array.isArray(product.variants) && product.variants.length > 0;
  if (hasVars) {
    const prices: number[] = product.variants.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
    if (prices.length === 0) return null;
    return { label: fmtNPR(Math.min(...prices)), prefix: "from " };
  }
  const p = Number(product.price);
  return p > 0 ? { label: fmtNPR(p) } : null;
}

function GameCard({ product, index = 99 }: { product: any; index?: number }) {
  const priceInfo = getPriceLabel(product);
  const tags: string[] = product.tags || [];
  const loadingStrategy = index < 6 ? "eager" : "lazy";

  return (
    <MotionCard variants={fadeUp} className="cursor-pointer group">
      <Link href={`/products/${product.id}`}>
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted border border-border/60 group-hover:border-primary/50 transition-colors duration-200 group-hover:shadow-lg group-hover:shadow-primary/8">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name}
                loading={loadingStrategy} decoding="async"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
                <Gamepad2 className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
            {tags.includes("New") && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">NEW</div>
            )}
            {tags.includes("Hot") && !tags.includes("New") && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">HOT</div>
            )}
            {tags.includes("Discount") && !tags.includes("New") && !tags.includes("Hot") && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">SALE</div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xs font-bold text-destructive uppercase tracking-widest">Sold Out</span>
              </div>
            )}
          </div>
          <div className="mt-2 px-0.5">
            <p className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">{product.name}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{product.category?.replace(/-/g, " ")}</p>
            {priceInfo && (
              <div className="mt-1.5 flex items-baseline gap-0.5">
                {priceInfo.prefix && <span className="text-[11px] text-muted-foreground">{priceInfo.prefix}</span>}
                <span className="font-black text-sm text-primary">{priceInfo.label}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </MotionCard>
  );
}

function ListCard({ product }: { product: any }) {
  const priceInfo = getPriceLabel(product);

  return (
    <MotionCard variants={scaleIn} lift={false}>
      <Link href={`/products/${product.id}`}>
        <div className="group flex gap-4 p-3 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer hover:-translate-y-0.5">
          <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name}
                loading="lazy" decoding="async"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="h-7 w-7 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <p className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-150 leading-snug">{product.name}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{product.category?.replace(/-/g, " ")}</p>
            {priceInfo && (
              <div className="mt-2 flex items-baseline gap-0.5">
                {priceInfo.prefix && <span className="text-[11px] text-muted-foreground">{priceInfo.prefix}</span>}
                <span className="font-black text-sm text-primary">{priceInfo.label}</span>
              </div>
            )}
          </div>
          {!product.inStock && (
            <div className="shrink-0 self-center text-[10px] font-bold text-destructive uppercase tracking-wide bg-destructive/10 px-2 py-1 rounded-full">
              Sold Out
            </div>
          )}
        </div>
      </Link>
    </MotionCard>
  );
}

function ShimmerCard() {
  return (
    <div>
      <div className="aspect-square animate-shimmer rounded-xl" />
      <div className="mt-2 space-y-2 px-0.5">
        <div className="h-3.5 animate-shimmer rounded w-4/5" />
        <div className="h-3 animate-shimmer rounded w-3/5" />
        <div className="h-3.5 animate-shimmer rounded w-2/5" />
      </div>
    </div>
  );
}

function ShimmerListCard() {
  return <div className="h-[88px] animate-shimmer rounded-xl" />;
}

const CATEGORY_SEO: Record<string, { title: string; desc: string; kw: string }> = {
  "game-topups":   { title: "Buy Game Top-ups in Nepal",        desc: "Top up Free Fire Diamonds, PUBG UC, Mobile Legends and more. Instant delivery in Nepal. Pay with eSewa, Khalti or IME Pay.",       kw: "free fire diamonds nepal, pubg uc nepal, mobile legends nepal, game top-up nepal, tiktok coins nepal" },
  "gift-cards":    { title: "Buy Gift Cards in Nepal",          desc: "Buy Google Play, Steam, Apple and other gift cards in Nepal. Instant digital delivery via Digital HUB.",                            kw: "google play gift card nepal, steam wallet nepal, apple gift card nepal, gift cards nepal" },
  subscriptions:   { title: "Buy Subscriptions in Nepal",       desc: "Buy Netflix, Spotify, YouTube Premium and other digital subscriptions in Nepal. Pay with eSewa or Khalti.",                         kw: "netflix nepal, spotify nepal, youtube premium nepal, disney plus nepal, digital subscriptions nepal" },
  vouchers:        { title: "Buy Digital Vouchers in Nepal",    desc: "Buy digital vouchers and prepaid codes in Nepal. Instant delivery. All major games and platforms available.",                        kw: "vouchers nepal, digital vouchers nepal, prepaid codes nepal, gaming vouchers nepal" },
};

export default function Products() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(initialCategory);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products, isLoading } = useListProducts(
    { search: search || undefined, category: category !== "all" ? (category as ListProductsCategory) : undefined },
    { query: { queryKey: ["products", { search, category }] } }
  );

  const catMeta = CATEGORY_SEO[category] ?? {
    title: "All Gaming Products in Nepal",
    desc: "Browse Free Fire Diamonds, PUBG UC, gift cards, subscriptions and vouchers at Digital HUB Nepal. Instant delivery. Pay with eSewa, Khalti or IME Pay.",
    kw: "gaming products nepal, digital hub nepal, free fire, pubg, gift cards nepal",
  };
  useSEO({ title: catMeta.title, description: catMeta.desc, keywords: catMeta.kw });

  const crumbLabel = CATEGORIES.find(c => c.value === category)?.label ?? "All Products";

  return (
    <PageWrapper className="gaming-bg min-h-[calc(100vh-4rem)]">
      <BreadcrumbJsonLd crumbs={[{ name: "Home", url: "/" }, { name: crumbLabel, url: "/products" }]} />
      <div className="container max-w-screen-xl px-4 md:px-6 py-8">

        {/* Header */}
        <FadeUp className="mb-7">
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span className="text-gradient">All Products</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Loading…" : `${products?.length ?? 0} products · prices in NPR`}
          </p>
        </FadeUp>

        {/* Filters bar */}
        <FadeUp delay={0.05} className="flex flex-col sm:flex-row gap-3 mb-7">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              className="pl-9 bg-background/80 border-border/70 focus:border-primary/60 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                  ${category === cat.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.03]"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto shrink-0">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 transition-all duration-150"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 transition-all duration-150"
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </FadeUp>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "flex flex-col gap-3"}
            >
              {Array.from({ length: 12 }).map((_, i) =>
                viewMode === "grid"
                  ? <ShimmerCard key={i} />
                  : <ShimmerListCard key={i} />
              )}
            </motion.div>

          ) : products?.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold">No products found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try a different search or category.</p>
              <Button variant="outline" className="mt-4 transition-all hover:scale-[1.02]" onClick={() => { setSearch(""); setCategory("all"); }}>
                Clear Filters
              </Button>
            </motion.div>

          ) : viewMode === "grid" ? (
            <motion.div
              key={`grid-${category}-${search}`}
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {products?.map((product, i) => <GameCard key={product.id} product={product} index={i} />)}
            </motion.div>

          ) : (
            <motion.div
              key={`list-${category}-${search}`}
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {products?.map(product => <ListCard key={product.id} product={product} />)}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}
