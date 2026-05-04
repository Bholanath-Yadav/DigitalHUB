import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { db, couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatCoupon(c: any) {
  return {
    ...c,
    discountValue: parseFloat(c.discountValue),
    applicableProductIds: Array.isArray(c.applicableProductIds) ? c.applicableProductIds : [],
    createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
    expiresAt: c.expiresAt?.toISOString?.() ?? c.expiresAt ?? null,
  };
}

router.get("/coupons", requireAdmin, async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable);
    return res.json(coupons.map(formatCoupon));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/coupons", requireAdmin, async (req, res) => {
  try {
    const [coupon] = await db.insert(couponsTable).values({
      ...req.body,
      applicableProductIds: req.body.applicableProductIds || [],
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
    }).returning();
    return res.status(201).json(formatCoupon(coupon));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const [coupon] = await db.update(couponsTable)
      .set({ ...req.body, expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null, updatedAt: new Date() } as any)
      .where(eq(couponsTable.id, Number(req.params.id)))
      .returning();
    if (!coupon) return res.status(404).json({ error: "Not found" });
    return res.json(formatCoupon(coupon));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(couponsTable).where(eq(couponsTable.id, Number(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, productId, amount } = req.body;
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code));
    if (!coupon || !coupon.active) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Invalid or inactive coupon" });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon has expired" });
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon usage limit reached" });
    const appIds = Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds as number[] : [];
    if (appIds.length > 0 && !appIds.includes(productId)) return res.json({ valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon not valid for this product" });
    let discountAmount = 0;
    if (coupon.discountType === "percentage") discountAmount = amount * parseFloat(coupon.discountValue) / 100;
    else discountAmount = parseFloat(coupon.discountValue);
    const finalAmount = Math.max(0, amount - discountAmount);
    return res.json({ valid: true, discountAmount, finalAmount, message: "Coupon applied successfully" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
