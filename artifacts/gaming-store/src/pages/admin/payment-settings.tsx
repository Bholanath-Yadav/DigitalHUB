import { useState, useRef } from "react";
import { useListPaymentSettings, useUpdatePaymentSetting } from "@/lib/api-hooks";
import { uploadToStorage } from "@/lib/upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wallet, Upload, X, ZoomIn, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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

type SettingForm = {
  label: string;
  enabled: boolean;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  instructions: string;
};

function PaymentCard({ setting }: { setting: any }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<SettingForm>({
    label:         setting.label         ?? setting.method,
    enabled:       setting.enabled       ?? true,
    accountName:   setting.accountName   ?? "",
    accountNumber: setting.accountNumber ?? "",
    qrImageUrl:    setting.qrImageUrl    ?? "",
    instructions:  setting.instructions  ?? "",
  });
  const [uploadingQR, setUploadingQR] = useState(false);

  const update = useUpdatePaymentSetting();

  const f = (k: keyof SettingForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleQRUpload = async (file: File) => {
    setUploadingQR(true);
    try {
      const url = await uploadToStorage(file, "qr-codes");
      f("qrImageUrl", url);
      toast({ title: "QR code uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingQR(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    update.mutate(
      {
        method: setting.method,
        data: {
          label:         form.label,
          enabled:       form.enabled,
          accountName:   form.accountName  || null,
          accountNumber: form.accountNumber || null,
          qrImageUrl:    form.qrImageUrl   || null,
          instructions:  form.instructions  || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: `${form.label} settings saved` });
          queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
        },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
        onSettled: () => setSaving(false),
      }
    );
  };

  const color = METHOD_COLORS[setting.method] ?? "#888";
  const logo  = METHOD_LOGOS[setting.method];

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header bar */}
        <div className="h-1.5 w-full" style={{ background: color }} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo
                ? <img src={logo} alt={form.label} className="h-10 object-contain max-w-[90px]" />
                : <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: color }}>{form.label[0]}</div>
              }
              <div>
                <CardTitle className="text-base">{form.label}</CardTitle>
                <CardDescription className="capitalize">{setting.method}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={form.enabled ? "default" : "secondary"} className="text-xs">
                {form.enabled ? "Active" : "Disabled"}
              </Badge>
              <Switch
                checked={form.enabled}
                onCheckedChange={v => f("enabled", v)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Label */}
            <div className="space-y-1.5">
              <Label>Display Label</Label>
              <Input value={form.label} onChange={e => f("label", e.target.value)} placeholder="eSewa" />
            </div>
            {/* Account name */}
            <div className="space-y-1.5">
              <Label>Account Name</Label>
              <Input value={form.accountName} onChange={e => f("accountName", e.target.value)} placeholder="GameStore Nepal" />
            </div>
            {/* Account number */}
            <div className="space-y-1.5">
              <Label>Account / Phone Number</Label>
              <Input value={form.accountNumber} onChange={e => f("accountNumber", e.target.value)} placeholder="98XXXXXXXX" />
            </div>
            {/* Instructions */}
            <div className="space-y-1.5">
              <Label>Customer Instructions</Label>
              <Textarea
                value={form.instructions}
                onChange={e => f("instructions", e.target.value)}
                placeholder="Open eSewa app → Send Money → enter number…"
                className="resize-none h-[74px] text-sm"
              />
            </div>
          </div>

          {/* QR Code section */}
          <div className="space-y-2">
            <Label>Payment QR Code</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleQRUpload(f); }}
            />

            {form.qrImageUrl ? (
              <div className="flex items-start gap-4">
                {/* QR preview */}
                <div className="relative group w-36 h-36 rounded-xl border-2 overflow-hidden shrink-0 cursor-zoom-in bg-white"
                  style={{ borderColor: color }}
                  onClick={() => setLightbox(true)}
                >
                  <img src={form.qrImageUrl} alt="QR" className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploadingQR}>
                    {uploadingQR ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Replace QR
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => f("qrImageUrl", "")}>
                    <X className="h-3.5 w-3.5" /> Remove
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Shown to customers at checkout</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer py-8"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload QR Code</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 5 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Save button */}
          <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="h-4 w-4" /> Save Changes</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* QR lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          <img src={form.qrImageUrl} alt="QR" className="max-w-sm max-h-[80vh] object-contain rounded-xl bg-white p-4" />
        </div>
      )}
    </>
  );
}

export default function AdminPaymentSettings() {
  const { data: settings, isLoading } = useListPaymentSettings({
    query: { queryKey: ["payment-settings"] },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Payment Settings</h2>
          <p className="text-xs text-muted-foreground">
            Configure payment methods shown at checkout — upload QR codes, set account numbers, enable/disable methods
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {settings?.map(s => <PaymentCard key={s.method} setting={s} />)}
        </div>
      )}
    </div>
  );
}
