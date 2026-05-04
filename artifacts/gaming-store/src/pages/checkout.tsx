import { useGetOrder, useUploadPaymentScreenshot, useListPaymentSettings } from "@/lib/api-hooks";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ImagePlus, Upload, X, ZoomIn, Loader2 } from "lucide-react";
import { fmtNPR } from "@/lib/currency";
import { uploadToStorage } from "@/lib/upload";

const METHOD_LOGOS: Record<string, string> = {
  esewa:      "/esewa-logo.png",
  khalti:     "/khalti-logo.png",
  connectips: "/connectips-logo.png",
  bank:       "/bank-logo.png",
};

const METHOD_COLORS: Record<string, string> = {
  esewa:      "#4cb946",
  khalti:     "#5C2D91",
  connectips: "#E01A22",
  bank:       "#1a56db",
};

export default function Checkout() {
  const [, params]  = useRoute("/checkout/:orderId");
  const orderId     = parseInt(params?.orderId || "0");
  const [, setLocation] = useLocation();
  const { toast }   = useToast();

  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl,     setPreviewUrl]      = useState("");
  const [isDragging,     setIsDragging]      = useState(false);
  const [lightbox,       setLightbox]        = useState(false);
  const [uploading,      setUploading]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: order, isLoading: orderLoading } = useGetOrder(orderId, {
    query: { queryKey: ["order", orderId], enabled: !!orderId },
  });

  const { data: allSettings, isLoading: settingsLoading } = useListPaymentSettings({
    query: { queryKey: ["payment-settings"] },
  });

  const enabledMethods = allSettings?.filter(s => s.enabled) ?? [];

  const activeMethod = enabledMethods.find(m => m.method === selectedMethod) ?? enabledMethods[0];

  const uploadScreenshot = useUploadPaymentScreenshot();

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setScreenshotFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!screenshotFile) {
      toast({ title: "Screenshot required", description: "Please upload your payment screenshot.", variant: "destructive" });
      return;
    }
    if (!activeMethod) {
      toast({ title: "No payment method selected", variant: "destructive" });
      return;
    }
    setUploading(true);
    let screenshotUrl: string;
    try {
      screenshotUrl = await uploadToStorage(screenshotFile, "payment-screenshots");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    uploadScreenshot.mutate(
      { data: { orderId, paymentMethod: activeMethod.method as any, screenshotUrl } },
      {
        onSuccess: () => {
          toast({ title: "Payment submitted!", description: "Your payment is pending verification." });
          setLocation(`/orders/${orderId}`);
        },
        onError: () => {
          toast({ title: "Submission failed", variant: "destructive" });
        },
        onSettled: () => setUploading(false),
      }
    );
  };

  if (orderLoading || settingsLoading) {
    return (
      <div className="container py-12 px-4 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (!order) return <div className="container py-12 px-4 text-center">Order not found</div>;

  if (order.status !== "pending") {
    return (
      <div className="container py-20 px-4 text-center max-w-md mx-auto">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order {order.status}</h2>
        <p className="text-muted-foreground mb-6">This order cannot be paid for anymore.</p>
        <Button onClick={() => setLocation(`/orders/${order.id}`)}>View Order Status</Button>
      </div>
    );
  }

  const finalAmount = order.totalAmount - order.discountAmount;
  const accentColor = activeMethod ? (METHOD_COLORS[activeMethod.method] ?? "#888") : "#888";

  return (
    <div className="container py-8 px-4 md:px-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Checkout &amp; Payment</h1>

      <div className="grid md:grid-cols-5 gap-6">
        {/* ── Left: order summary ── */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
              <CardDescription>Order #{order.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {order.product.imageUrl && (
                  <img src={order.product.imageUrl} className="h-14 w-14 rounded-lg object-cover border border-border shrink-0" alt="" />
                )}
                <div>
                  <div className="font-semibold text-sm">{order.product.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{order.product.category.replace("-"," ")}</div>
                </div>
              </div>
              <div className="pt-3 border-t space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{fmtNPR(order.totalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({order.couponCode})</span>
                    <span>− {fmtNPR(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{fmtNPR(finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.keys(order.gameDetails || {}).length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Game Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="space-y-1.5 text-sm">
                  {Object.entries(order.gameDetails || {})
                    .map(([k, v]): [string, string] => {
                      if (k === "__variantName") return ["Package", v as string];
                      return [k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim(), v as string];
                    })
                    .map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground font-medium shrink-0 capitalize">{label}</dt>
                        <dd className="font-mono text-right">{value}</dd>
                      </div>
                    ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: payment ── */}
        <div className="md:col-span-3 space-y-4">
          {/* Step 1 — Select method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {enabledMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payment methods are currently enabled.</p>
              ) : (
                <div className={`grid gap-3 ${enabledMethods.length <= 2 ? "grid-cols-2" : enabledMethods.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                  {enabledMethods.map(m => {
                    const logo  = METHOD_LOGOS[m.method];
                    const color = METHOD_COLORS[m.method] ?? "#888";
                    const isActive = activeMethod?.method === m.method;
                    return (
                      <button
                        key={m.method}
                        onClick={() => setSelectedMethod(m.method)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${isActive ? "scale-[1.03] shadow-md" : "border-border bg-card hover:bg-muted hover:scale-[1.01]"}`}
                        style={isActive ? { borderColor: color, background: `${color}14` } : {}}
                      >
                        {logo
                          ? <img src={logo} alt={m.label} className="h-8 w-full object-contain" draggable={false} />
                          : <div className="h-8 w-16 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: color }}>{m.label}</div>
                        }
                      </button>
                    );
                  })}
                </div>
              )}

              {/* QR + account info for selected method */}
              {activeMethod && (
                <div className="flex flex-col items-center gap-3 py-2">
                  {/* Method name */}
                  <div className="text-sm font-medium text-center">
                    Pay via <span className="font-bold">{activeMethod.label}</span>
                    {activeMethod.accountName && <span className="text-muted-foreground"> · {activeMethod.accountName}</span>}
                  </div>

                  {/* QR code */}
                  <div className="w-44 h-44 bg-white p-2 rounded-xl border-4 shadow-sm flex items-center justify-center"
                    style={{ borderColor: accentColor }}>
                    {activeMethod.qrImageUrl ? (
                      <img
                        src={activeMethod.qrImageUrl}
                        alt="Payment QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GameStore-${activeMethod.method}-${finalAmount}`}
                        className="w-full h-full object-contain"
                        alt="QR Code"
                      />
                    )}
                  </div>

                  {/* Account number */}
                  {activeMethod.accountNumber && (
                    <p className="font-mono text-lg font-bold tracking-widest">{activeMethod.accountNumber}</p>
                  )}

                  {/* Amount */}
                  <p className="text-sm font-semibold">
                    Amount: <span className="text-primary">{fmtNPR(finalAmount)}</span>
                  </p>

                  {/* Instructions */}
                  {activeMethod.instructions && (
                    <div className="w-full rounded-lg bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
                      {activeMethod.instructions}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2 — Upload screenshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Upload Payment Screenshot</CardTitle>
              <CardDescription>Take a screenshot of your successful transaction and upload it below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-10 px-4
                    ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ImagePlus className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Click to upload or drag &amp; drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — max 5 MB</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="gap-2 pointer-events-none">
                    <Upload className="h-3.5 w-3.5" /> Browse Files
                  </Button>
                </div>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30">
                  <img
                    src={previewUrl}
                    alt="Payment screenshot"
                    className="w-full max-h-56 object-contain cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setLightbox(true)}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleRemove}
                      className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur flex items-center justify-center text-white hover:bg-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
                    <span className="text-white text-xs font-medium">Screenshot uploaded ✓</span>
                    <button onClick={() => fileInputRef.current?.click()} className="text-white/80 hover:text-white text-xs underline">Change</button>
                  </div>
                </div>
              )}

              <Button
                className="w-full font-bold h-11 gap-2"
                onClick={handleSubmit}
                disabled={uploading || uploadScreenshot.isPending || !screenshotFile || !activeMethod}
              >
                {uploading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading screenshot…</>
                  : uploadScreenshot.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  : <><CheckCircle className="h-4 w-4" /> Submit Payment for Verification</>
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          <img src={previewUrl} alt="Screenshot" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
