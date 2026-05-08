import { useState, useEffect } from "react";
import { useListProducts, useListBanners } from "@/lib/api-hooks";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Gamepad2, Gift, Tv, Ticket, ArrowRight, Zap, ShieldCheck, Clock, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { fmtNPR } from "@/lib/currency";
import { BannerCarousel } from "@/components/banner-carousel";
import { useSEO } from "@/hooks/use-seo";
import { FAQJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/json-ld";
import {
  PageWrapper,
  StaggerGrid,
  MotionCard,
  FadeUp,
  fadeUp,
  staggerFast,
  staggerSlow,
  slideRight,
  scaleIn,
} from "@/components/motion";

const TAGLINES = [
  { line1: "Level Up",     line2: "Your Game"    },
  { line1: "Power Up",     line2: "Your Play"    },
  { line1: "Dominate",     line2: "Every Match"  },
  { line1: "Top Up,",      line2: "Win More"     },
  { line1: "Game On,",     line2: "Nepal"        },
  { line1: "Fuel Your",    line2: "Victory"      },
  { line1: "Unlock Your",  line2: "Full Power"   },
  { line1: "Play More,",   line2: "Pay Less"     },
  { line1: "Rise Above",   line2: "The Rest"     },
  { line1: "Own The",      line2: "Battlefield"  },
  { line1: "Stack Up",     line2: "Your Arsenal" },
];

type TwPhase = "typing1" | "typing2" | "erasing2" | "erasing1";

function HeroTypewriter() {
  const [idx,   setIdx]   = useState(() => Math.floor(Math.random() * TAGLINES.length));
  const [txt1,  setTxt1]  = useState("");
  const [txt2,  setTxt2]  = useState("");
  const [phase, setPhase] = useState<TwPhase>("typing1");

  const tl          = TAGLINES[idx];
  const SPEED_TYPE  = 68;
  const SPEED_ERASE = 32;
  const PAUSE       = 2600;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing1") {
      if (txt1.length < tl.line1.length) {
        t = setTimeout(() => setTxt1(tl.line1.slice(0, txt1.length + 1)), SPEED_TYPE);
      } else {
        t = setTimeout(() => setPhase("typing2"), 110);
      }
    } else if (phase === "typing2") {
      if (txt2.length < tl.line2.length) {
        t = setTimeout(() => setTxt2(tl.line2.slice(0, txt2.length + 1)), SPEED_TYPE);
      } else {
        t = setTimeout(() => setPhase("erasing2"), PAUSE);
      }
    } else if (phase === "erasing2") {
      if (txt2.length > 0) {
        t = setTimeout(() => setTxt2(txt2.slice(0, -1)), SPEED_ERASE);
      } else {
        setPhase("erasing1");
      }
    } else if (phase === "erasing1") {
      if (txt1.length > 0) {
        t = setTimeout(() => setTxt1(txt1.slice(0, -1)), SPEED_ERASE);
      } else {
        setIdx(prev => {
          let next = Math.floor(Math.random() * TAGLINES.length);
          while (next === prev) next = Math.floor(Math.random() * TAGLINES.length);
          return next;
        });
        setPhase("typing1");
      }
    }

    return () => clearTimeout(t);
  }, [phase, txt1, txt2, tl]);

  const cur1 = phase === "typing1" || phase === "erasing1";
  const cur2 = phase === "typing2" || phase === "erasing2";

  return (
    <>
      <span className="text-gradient">
        {txt1 || "\u00A0"}
        {cur1 && <span className="animate-cursor-blink text-primary font-thin ml-0.5">|</span>}
      </span>
      <br />
      <span className="text-foreground">
        {txt2 || "\u00A0"}
        {cur2 && <span className="animate-cursor-blink text-primary/60 font-thin ml-0.5">|</span>}
      </span>
    </>
  );
}

const CATEGORIES = [
  { value: "digital-tools",  label: "Digital Tools",  image: "/category-images/digital-tools.svg", color: "from-slate-500 to-gray-600" },
  { value: "gaming",         label: "Gaming",         image: "/category-images/gaming.svg", color: "from-cyan-500 to-blue-600" },
  { value: "gift-cards",     label: "Gift Cards",     image: "/category-images/gift-cards.svg", color: "from-purple-500 to-pink-600" },
  { value: "social-boost",   label: "Social Boost",   image: "/category-images/social-boost.svg", color: "from-yellow-500 to-orange-600" },
  { value: "streaming",      label: "Streaming",      image: "/category-images/streaming.svg", color: "from-orange-500 to-red-600" },
  { value: "vpn-privacy",    label: "VPN & Privacy",  image: "/category-images/vpn-privacy.svg", color: "from-indigo-500 to-purple-600" },
];

const TRUST_BADGES = [
  { icon: <Zap className="h-5 w-5" />,         title: "Instant Delivery",  desc: "Most orders delivered in minutes" },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Secure Payments",   desc: "eSewa, Khalti & IME Pay accepted" },
  { icon: <Clock className="h-5 w-5" />,       title: "24/7 Support",      desc: "Live chat always available" },
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

function GameCard({ product, index }: { product: any; index: number }) {
  const priceInfo = getPriceLabel(product);
  const tags: string[] = product.tags || [];
  // First 6 cards are above the fold — load eagerly, rest lazy
  const loadingStrategy = index < 6 ? "eager" : "lazy";

  return (
    <MotionCard variants={fadeUp} className="cursor-pointer group">
      <Link href={`/products/${product.id}`}>
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-[1.1rem] bg-muted border border-border/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/45 group-hover:shadow-[0_22px_44px_-28px_rgba(14,165,233,0.55)]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading={loadingStrategy}
                decoding="async"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.08]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
                <Gamepad2 className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {tags.includes("New") && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">
                NEW
              </div>
            )}
            {tags.includes("Hot") && !tags.includes("New") && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">
                HOT
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xs font-bold text-destructive uppercase tracking-widest">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="mt-2.5 px-0.5">
            <p className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-150">{product.name}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5 line-clamp-1">{product.category?.replace(/-/g, " ")}</p>
            {priceInfo && (
              <div className="mt-1.5 flex items-baseline gap-0.5">
                {priceInfo.prefix && <span className="text-[11px] text-muted-foreground">{priceInfo.prefix}</span>}
                <span className="font-black text-sm text-black dark:text-white">{priceInfo.label}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </MotionCard>
  );
}

function ProductSkeleton() {
  return (
    <div>
      <div className="aspect-square animate-shimmer rounded-xl" />
      <div className="mt-2.5 space-y-2 px-0.5">
        <div className="h-3.5 animate-shimmer rounded w-4/5" />
        <div className="h-3 animate-shimmer rounded w-3/5" />
        <div className="h-3.5 animate-shimmer rounded w-2/5" />
      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();

  useSEO({
    fullTitle: "Digital HUB — Nepal's #1 Gaming Store | Free Fire Diamonds, PUBG UC & More",
    description: "Nepal's #1 digital gaming marketplace. Buy Free Fire Diamonds, PUBG UC, TikTok Coins, Netflix, Spotify & Google Play gift cards. Instant delivery. Pay with eSewa, Khalti or IME Pay.",
    keywords: "free fire diamonds nepal, pubg uc nepal, tiktok coins nepal, netflix nepal, spotify nepal, google play gift card nepal, gaming store nepal, digital hub nepal, esewa khalti, mobile legends diamonds nepal",
  });

  // Single query — no wasted "featured" call
  const { data: allProducts, isLoading: productsLoading, isError: productsError, error: productsQueryError } = useListProducts(
    {},
    { query: { queryKey: ["products", "all"], staleTime: 5 * 60 * 1000 } }
  );
  const { data: banners, isError: bannersError, error: bannersQueryError } = useListBanners({
    query: { queryKey: ["banners"], staleTime: 5 * 60 * 1000 },
  });

  return (
    <PageWrapper className="flex flex-col">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FAQJsonLd items={FAQ_ITEMS} />

      {(productsError || bannersError) && (
        <section className="container max-w-screen-xl px-4 md:px-6 pt-4">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <p className="font-semibold">Supabase data did not load.</p>
            <p className="mt-1 text-destructive/80">
              Most likely causes: Vercel is missing <span className="font-mono">VITE_SUPABASE_URL</span> or <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>, or the live Supabase project is missing the RLS policies for public reads.
            </p>
            <p className="mt-1 text-destructive/70">
              {productsError && <span>Products: {(productsQueryError as Error)?.message ?? "failed"}. </span>}
              {bannersError && <span>Banners: {(bannersQueryError as Error)?.message ?? "failed"}.</span>}
            </p>
          </div>
        </section>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative gaming-bg hero-glow overflow-hidden">
        <div className="container max-w-screen-xl px-4 md:px-6 py-14 md:py-20">

          <motion.div
            variants={staggerSlow}
            initial="hidden"
            animate="visible"
            className="text-center mb-10"
          >
            <motion.div variants={fadeUp} className="inline-flex mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-badge-glow">
                <Zap className="h-3 w-3 animate-float" /> Nepal's #1 Gaming Store
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-5 min-h-[2.2em]"
            >
              <HeroTypewriter />
            </motion.h1>

            <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
              Instant top-ups, gift cards & subscriptions. Pay with eSewa, Khalti or IME Pay.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" onClick={() => setLocation("/products")}
                className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90 shadow-lg font-bold px-8 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Zap className="h-4 w-4" /> Shop Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/products?category=game-topups")}
                className="gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Gamepad2 className="h-4 w-4" /> Browse Top-ups
              </Button>
            </motion.div>
          </motion.div>

          {banners && banners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <BannerCarousel banners={banners} />
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────── */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container max-w-screen-xl px-4 md:px-6 py-5">
          <StaggerGrid fast className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TRUST_BADGES.map(b => (
              <motion.div
                key={b.title}
                variants={slideRight}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">{b.icon}</div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="container max-w-screen-xl px-4 md:px-6 pt-12 pb-8">
        <FadeUp>
          <h2 className="text-2xl font-black tracking-tight mb-6">Shop by Category</h2>
        </FadeUp>
        <StaggerGrid fast className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <motion.div key={cat.value} variants={scaleIn} className="h-full">
              <Link href={`/products?category=${cat.value}`}>
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted hover:border-primary/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer p-5 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-sm leading-tight">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {allProducts?.filter(p => p.category === cat.value).length ?? "0"} items
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerGrid>
      </section>

      {/* ── All products ──────────────────────────────────── */}
      <section className="container max-w-screen-xl px-4 md:px-6 py-8 pb-16">
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : productsError ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center">
            <p className="font-semibold">Unable to load products from Supabase.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check Vercel env vars and Supabase RLS policies, then redeploy.
            </p>
          </div>
        ) : !allProducts || allProducts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center">
            <p className="font-semibold">No products found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              If this is unexpected, verify the products table has data in Supabase.
            </p>
          </div>
        ) : (
          <StaggerGrid
            fast
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {allProducts?.map((product, i) => (
              <GameCard key={product.id} product={product} index={i} />
            ))}
          </StaggerGrid>
        )}
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="container max-w-screen-xl px-4 md:px-6 py-12 pb-20">
        <FadeUp>
          <h2 className="text-xl font-black tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground mb-8">Everything you need to know about ordering from Digital HUB Nepal.</p>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {FAQ_ITEMS.map((item, i) => (
            <FaqCard key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

    </PageWrapper>
  );
}

const FAQ_ITEMS = [
  {
    q: "How fast will I receive my order?",
    a: "Most orders are delivered within 1–2 hours after payment verification. During peak hours it may take up to 24 hours. You will receive your product directly on your order page and via email.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept eSewa, Khalti, and IME Pay. After placing your order, you will see our payment QR code and account details. Upload your payment screenshot to confirm.",
  },
  {
    q: "What if I entered the wrong game ID?",
    a: "Please double-check your game ID or account details before submitting your order. We cannot be held responsible for top-ups credited to incorrect accounts. Contact us on WhatsApp immediately if you notice a mistake before your order is processed.",
  },
  {
    q: "Is my account information safe?",
    a: "Yes. We use Supabase for secure authentication and never store your payment details. Your personal information is only used to process and deliver your order.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer refunds if your product was not delivered, a code was invalid, or you were charged incorrectly. Please see our full Refund Policy for details. Refunds are not available for already-redeemed codes.",
  },
  {
    q: "Do you offer bulk or reseller pricing?",
    a: "Yes! Contact us on WhatsApp at +977 9826749317 to discuss bulk pricing and reseller arrangements for game top-ups, gift cards, and vouchers.",
  },
  {
    q: "Which games and platforms do you support?",
    a: "We stock top-ups for Free Fire, PUBG Mobile, TikTok Coins, and more. Gift cards for Google Play, Steam, and other platforms. Subscriptions for Netflix, Spotify, and others. Browse all products to see the full catalogue.",
  },
  {
    q: "How do I track my order?",
    a: "Log in to your account and visit the Orders section. Your order status updates in real time. You can also reach us on WhatsApp for a quick status update.",
  },
];

function FaqCard({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="border border-border rounded-xl bg-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="text-sm font-semibold leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}
