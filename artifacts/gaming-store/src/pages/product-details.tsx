import { useGetProduct, useCreateOrder, useValidateCoupon } from "@/lib/api-hooks";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Check, Gamepad2, ChevronRight, Clock, Globe, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";
import { fmtNPR } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/motion";
import { useSEO } from "@/hooks/use-seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

type Variant = {
  name: string;
  price: number;
  badge?: string | null;
  originalPrice?: number | null;
  icon?: string | null;
};

function VariantGrid({
  variants,
  selected,
  onSelect,
  disabled,
}: {
  variants: Variant[];
  selected: string | null;
  onSelect: (name: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {variants.map((v) => {
        const isSelected = selected === v.name;
        return (
          <button
            key={v.name}
            onClick={() => !disabled && onSelect(v.name)}
            disabled={disabled}
            className={`relative rounded-xl border p-2.5 text-left transition-all duration-150 focus:outline-none
              ${isSelected
                ? "border-primary bg-primary/8 shadow-[0_0_0_2px] shadow-primary/40"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]"}
            `}
          >
            {/* Discount badge ribbon */}
            {v.badge && (
              <span className="absolute -top-1.5 -right-1 text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white px-1.5 py-0.5 rounded-full leading-none z-10">
                {v.badge}
              </span>
            )}

            {/* Icon */}
            {v.icon && (
              <div className="text-lg mb-1 leading-none">{v.icon}</div>
            )}

            {/* Name */}
            <div className="text-[11px] font-semibold leading-tight text-foreground line-clamp-2">
              {v.name}
            </div>

            {/* Price */}
            <div className="mt-1 flex flex-col">
              {v.originalPrice && (
                <span className="text-[10px] text-muted-foreground line-through leading-none">
                  {fmtNPR(v.originalPrice)}
                </span>
              )}
              <span className={`text-xs font-black leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                {fmtNPR(v.price)}
              </span>
            </div>

            {/* Check mark */}
            {isSelected && (
              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isSignedIn } = useAuth();

  const { data: product, isLoading } = useGetProduct(id, {
    query: { queryKey: ["product", id], enabled: !!id },
  });

  const productDesc = product?.description
    ? product.description.length > 155
      ? product.description.slice(0, 152) + "..."
      : product.description
    : product
      ? `Buy ${product.name} in Nepal at Digital HUB. Fast delivery. Pay with eSewa, Khalti or IME Pay.`
      : undefined;

  useSEO({
    title: product ? `Buy ${product.name} in Nepal` : "Product",
    description: productDesc,
    type: "product",
    keywords: product
      ? `${product.name} nepal, buy ${product.name.toLowerCase()}, ${product.name.toLowerCase()} price nepal, digital hub nepal`
      : undefined,
    image: (product as any)?.imageUrl ?? undefined,
  });

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [validatedCoupon, setValidatedCoupon] = useState<{
    code: string;
    discount: number;
    final: number;
  } | null>(null);

  const validateCoupon = useValidateCoupon();
  const createOrder = useCreateOrder();

  const variants: Variant[] = Array.isArray((product as any)?.variants)
    ? (product as any).variants
    : [];
  const hasVariants = variants.length > 0;

  // For variant products with no dynamic fields, inject sensible defaults
  // so Step 1 (account data) always appears for game top-ups etc.
  const DEFAULT_GAME_FIELDS = [
    { name: "playerId", label: "Player ID", type: "text", required: true },
  ];
  const effectiveDynamicFields: { name: string; label: string; type: string; required: boolean }[] =
    product?.dynamicFields && product.dynamicFields.length > 0
      ? (product.dynamicFields as any[])
      : product?.category === "game-topups"
        ? DEFAULT_GAME_FIELDS
        : [];

  const effectivePrice = (() => {
    if (hasVariants && selectedVariant) {
      const v = variants.find((x) => x.name === selectedVariant);
      return v ? v.price : product?.price ?? 0;
    }
    return product?.price ?? 0;
  })();

  const finalNpr = validatedCoupon ? validatedCoupon.final : effectivePrice;

  const handleVariantSelect = (name: string) => {
    setSelectedVariant(name);
    setValidatedCoupon(null);
    setCouponCode("");
  };

  const handleValidateCoupon = () => {
    if (!couponCode || !product) return;
    validateCoupon.mutate(
      { data: { code: couponCode, productId: product.id, amount: effectivePrice } },
      {
        onSuccess: (res) => {
          if (res.valid) {
            setValidatedCoupon({ code: couponCode, discount: res.discountAmount, final: res.finalAmount });
            toast({ title: "Coupon applied!", description: res.message });
          } else {
            setValidatedCoupon(null);
            toast({ title: "Invalid coupon", description: res.message, variant: "destructive" });
          }
        },
        onError: () => {
          setValidatedCoupon(null);
          toast({ title: "Error validating coupon", variant: "destructive" });
        },
      }
    );
  };

  const handleCheckout = () => {
    if (!product) return;

    if (hasVariants && !selectedVariant) {
      toast({ title: "Please select an amount", description: "Choose a package before checking out.", variant: "destructive" });
      return;
    }

    const missingFields = effectiveDynamicFields.filter(
      (f) => f.required && !formData[f.name]
    );
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.map((f: any) => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    if (!isSignedIn && (!guestName || !guestEmail)) {
      toast({ title: "Missing contact info", description: "Please provide your name and email.", variant: "destructive" });
      return;
    }

    const details: Record<string, string> = { ...formData };
    if (selectedVariant) details.__variantName = selectedVariant;

    createOrder.mutate(
      {
        data: {
          productId: product.id,
          gameDetails: details,
          guestName: isSignedIn ? null : guestName,
          guestEmail: isSignedIn ? null : guestEmail,
          guestPhone: isSignedIn ? null : guestPhone,
          couponCode: validatedCoupon?.code || null,
          totalAmount: effectivePrice,
          discountAmount: validatedCoupon ? validatedCoupon.discount : 0,
        },
      },
      {
        onSuccess: (order) => setLocation(`/checkout/${order.id}`),
        onError: (err: any) => {
          console.error("createOrder failed", err);
          toast({ title: "Failed to create order", description: err?.message ?? "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl py-10 px-4 md:px-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 shrink-0 space-y-4">
          <div className="aspect-square animate-shimmer rounded-2xl" />
          <div className="h-24 animate-shimmer rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-10 animate-shimmer rounded w-3/4" />
          <div className="h-5 animate-shimmer rounded w-1/4" />
          <div className="h-40 animate-shimmer rounded mt-6" />
          <div className="h-12 animate-shimmer rounded w-full mt-4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container py-20 text-center text-muted-foreground">Product not found</div>;
  }

  const selectedVariantObj = selectedVariant ? variants.find((v) => v.name === selectedVariant) : null;

  return (
    <PageWrapper className="gaming-bg min-h-[calc(100vh-4rem)]">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd crumbs={[
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: product.name, url: `/products/${product.id}` },
      ]} />
      <div className="container max-w-screen-xl py-8 px-4 md:px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* ── Left: Product info panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4"
          >
            {/* Product image card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    {product.tags.map((tag: string) => (
                      <span key={tag}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide backdrop-blur-sm
                          ${tag === "Hot" ? "bg-red-500/90 text-white" :
                            tag === "New" ? "bg-primary/90 text-primary-foreground" :
                            tag === "Discount" ? "bg-purple-500/90 text-white" :
                            "bg-black/60 text-white"}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h1 className="text-lg font-black tracking-tight leading-tight">{product.name}</h1>
                <Badge variant="outline" className="mt-1 text-muted-foreground uppercase text-[10px]">
                  {product.category?.replace(/-/g, " ")}
                </Badge>
              </div>
            </div>

            {/* Info badges */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>Instant delivery (within 1–5 minutes)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                <span>Nepal / Bangladesh Account</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>All purchases are NON-REFUNDABLE</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-bold mb-2 text-foreground/80">About this product</h3>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </motion.div>

          {/* ── Right: Purchase flow ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-w-0"
          >
            <div className="space-y-4">

              {/* ── Step 1: Account details ── */}
              {(effectiveDynamicFields.length > 0 || !isSignedIn) && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-black shrink-0">
                      1
                    </div>
                    <h2 className="font-bold text-base">Enter Your Account Data</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {effectiveDynamicFields.map((field) => (
                      <div key={field.name} className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          type={field.type === "number" ? "number" : "text"}
                          placeholder={`Enter your ${field.label}`}
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          disabled={!product.inStock}
                          className="bg-background"
                        />
                      </div>
                    ))}

                    {!isSignedIn && (
                      <>
                        {effectiveDynamicFields.length > 0 && <div className="border-t border-border pt-3" />}
                        <p className="text-xs text-muted-foreground">We need your contact info to deliver the order.</p>
                        <div className="space-y-1.5">
                          <Label htmlFor="guestName">Full Name <span className="text-destructive">*</span></Label>
                          <Input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} disabled={!product.inStock} className="bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="guestEmail">Email <span className="text-destructive">*</span></Label>
                          <Input id="guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} disabled={!product.inStock} className="bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="guestPhone">Phone</Label>
                          <Input id="guestPhone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} disabled={!product.inStock} className="bg-background" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 2: Select amount (variants) ── */}
              {hasVariants && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-black shrink-0">
                      {effectiveDynamicFields.length > 0 || !isSignedIn ? "2" : "1"}
                    </div>
                    <h2 className="font-bold text-base">Select the Amount You Want to Buy</h2>
                  </div>
                  <div className="p-5">
                    {/* Category label */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-yellow-500">⚡</span>
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">TOP UP</span>
                    </div>
                    <VariantGrid
                      variants={variants}
                      selected={selectedVariant}
                      onSelect={handleVariantSelect}
                      disabled={!product.inStock}
                    />
                  </div>
                </div>
              )}

              {/* ── No variants: show price normally ── */}
              {!hasVariants && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="text-2xl font-black text-primary">{fmtNPR(product.price)}</div>
                  </div>
                  {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                </div>
              )}

              {/* ── Variant product with nothing selected yet ── */}
              {hasVariants && !selectedVariant && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-700 dark:text-amber-400">
                  <span className="text-lg">👆</span>
                  Select a package above to see the price and check out.
                </div>
              )}

              {/* ── Coupon ── */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
                <Label htmlFor="coupon" className="text-sm font-medium">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="e.g. GAMER10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="uppercase bg-background tracking-widest"
                    disabled={!!validatedCoupon || !product.inStock}
                  />
                  <Button
                    variant={validatedCoupon ? "destructive" : "secondary"}
                    onClick={validatedCoupon ? () => { setValidatedCoupon(null); setCouponCode(""); } : handleValidateCoupon}
                    disabled={!couponCode || !product.inStock || validateCoupon.isPending}
                  >
                    {validateCoupon.isPending ? "…" : validatedCoupon ? "Remove" : "Apply"}
                  </Button>
                </div>
                {validatedCoupon && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Saved {fmtNPR(validatedCoupon.discount)}
                  </p>
                )}
              </div>

              {/* ── Sticky buy bar ── */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4 shadow-sm sticky bottom-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {selectedVariantObj ? (
                        <>
                          <div className="text-sm font-semibold text-foreground">{selectedVariantObj.name}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-primary">{fmtNPR(finalNpr)}</span>
                            {validatedCoupon && (
                              <span className="text-sm text-muted-foreground line-through">{fmtNPR(effectivePrice)}</span>
                            )}
                            {selectedVariantObj.originalPrice && !validatedCoupon && (
                              <span className="text-sm text-muted-foreground line-through">{fmtNPR(selectedVariantObj.originalPrice)}</span>
                            )}
                          </div>
                        </>
                      ) : hasVariants ? (
                        <div className="text-sm text-muted-foreground">Select a package above</div>
                      ) : (
                        <>
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-primary">{fmtNPR(finalNpr)}</span>
                            {validatedCoupon && (
                              <span className="text-sm text-muted-foreground line-through">{fmtNPR(effectivePrice)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!product.inStock && (
                      <Badge variant="destructive" className="shrink-0">Out of Stock</Badge>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full font-black text-base h-12 bg-gradient-to-r from-primary to-secondary text-white border-none hover:opacity-90 shadow-md"
                    onClick={handleCheckout}
                    disabled={!product.inStock || createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      "Processing…"
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {selectedVariantObj || !hasVariants
                          ? `Buy Now — ${fmtNPR(finalNpr)}`
                          : "Select a Package"}
                      </>
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
