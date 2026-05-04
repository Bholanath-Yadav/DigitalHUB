import { Router, type IRouter } from "express";
import { requireAdminStrict } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

const DEFAULT_SETTINGS = [
  { method: "esewa",      label: "eSewa",        sort_order: 0, enabled: true, account_name: "GameStore Nepal", account_number: "9800000000" },
  { method: "khalti",     label: "Khalti",       sort_order: 1, enabled: true, account_name: "GameStore Nepal", account_number: "9800000000" },
  { method: "connectips", label: "ConnectIPS",   sort_order: 2, enabled: true, account_name: "GameStore Nepal", account_number: "123456789"  },
  { method: "bank",       label: "Bank Transfer", sort_order: 3, enabled: true, account_name: "GameStore Nepal", account_number: "0123456789012" },
];

async function ensureDefaults() {
  for (const d of DEFAULT_SETTINGS) {
    const { data: existing } = await supabase.from("payment_settings").select("id").eq("method", d.method).maybeSingle();
    if (!existing) await supabase.from("payment_settings").insert(d);
  }
}

function fmt(s: any) {
  return {
    ...s,
    accountName: s.account_name ?? s.accountName ?? null,
    accountNumber: s.account_number ?? s.accountNumber ?? null,
    qrImageUrl: s.qr_image_url ?? s.qrImageUrl ?? null,
    sortOrder: s.sort_order ?? s.sortOrder ?? 0,
    updatedAt: s.updated_at ?? s.updatedAt,
  };
}

router.get("/payment-settings", async (req, res) => {
  try {
    await ensureDefaults();
    const { data, error } = await supabase.from("payment_settings").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return res.json((data ?? []).map(fmt));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/admin/payment-settings/:method", requireAdminStrict, async (req, res) => {
  try {
    const method = String(req.params.method);
    const { label, enabled, accountName, accountNumber, qrImageUrl, instructions, sortOrder } = req.body;
    const { data: existing } = await supabase.from("payment_settings").select("*").eq("method", method).maybeSingle();

    if (!existing) {
      const { data: created, error: insertError } = await supabase.from("payment_settings").insert({
        method,
        label: label ?? method,
        enabled: enabled ?? true,
        account_name: accountName,
        account_number: accountNumber,
        qr_image_url: qrImageUrl,
        instructions,
        sort_order: sortOrder ?? 0,
      }).select().single();
      if (insertError) throw insertError;
      return res.json(fmt(created));
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (label !== undefined) updateData.label = label;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (accountName !== undefined) updateData.account_name = accountName;
    if (accountNumber !== undefined) updateData.account_number = accountNumber;
    if (qrImageUrl !== undefined) updateData.qr_image_url = qrImageUrl;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    const { data: updated, error: updateError } = await supabase.from("payment_settings")
      .update(updateData)
      .eq("method", method)
      .select().single();
    if (updateError) throw updateError;

    return res.json(fmt(updated));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
