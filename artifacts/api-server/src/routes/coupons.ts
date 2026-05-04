import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatCoupon(c: any) {
  return {
    ...c,
    discountValue: parseFloat(c.discount_value ?? c.discountValue),
    applicableProductIds: Array.isArray(c.applicable_product_ids ?? c.applicableProductIds)
      ? (c.applicable_product_ids ?? c.applicableProductIds) : [],
    createdAt: c.created_at ?? c.createdAt,
    expiresAt: c.expires_at ?? c.expiresAt ?? null,
  };
}

router.get("/coupons", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("coupons").select("*");
    if (error) throw error;
    return res.json((data ?? []).map(formatCoupon));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/coupons", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("coupons").insert({
      ...req.body,
      applicable_product_ids: req.body.applicableProductIds || req.body.applicable_product_ids || [],
      expires_at: req.body.expiresAt ? new Date(req.body.expiresAt).toISOString() : null,
    }).select().single();
    if (error) throw error;
    return res.status(201).json(formatCoupon(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("coupons")
      .update({
        ...req.body,
        expires_at: req.body.expiresAt ? new Date(req.body.expiresAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", Number(req.params.id))
      .select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    return res.json(formatCoupon(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("coupons").delete().eq("id", Number(req.params.id));
    if (error) throw error;
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, productId, amount } = req.body;
    const { data: coupon, error } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    if (!coupon || !coupon.active) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Invalid or inactive coupon" });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon has expired" });
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon usage limit reached" });
    const appIds = Array.isArray(coupon.applicable_product_ids) ? coupon.applicable_product_ids as number[] : [];
    if (appIds.length > 0 && !appIds.includes(productId)) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon not valid for this product" });
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") discountAmount = amount * parseFloat(coupon.discount_value) / 100;
    else discountAmount = parseFloat(coupon.discount_value);
    const finalAmount = Math.max(0, amount - discountAmount);
    return res.json({ valid: true, discountAmount, finalAmount, message: "Coupon applied successfully" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
