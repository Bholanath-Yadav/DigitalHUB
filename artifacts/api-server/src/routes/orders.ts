import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    ...p,
    price: parseFloat(p.price),
    tags: Array.isArray(p.tags) ? p.tags : [],
    dynamicFields: Array.isArray(p.dynamic_fields ?? p.dynamicFields) ? (p.dynamic_fields ?? p.dynamicFields) : [],
    createdAt: p.created_at ?? p.createdAt,
  };
}

async function enrichOrder(order: any) {
  const { data: product } = await supabase.from("products").select("*").eq("id", order.product_id ?? order.productId).maybeSingle();
  // If order has a registered user, fetch their profile for display name
  let userProfile: any = null;
  const userId = order.user_id ?? order.userId;
  if (userId) {
    const { data: u } = await supabase.from("users").select("*").eq("supabase_id", userId).maybeSingle();
    if (u) userProfile = u;
  }
  return {
    ...order,
    id: order.id,
    userId: order.user_id ?? order.userId,
    productId: order.product_id ?? order.productId,
    // Prefer registered user's name/email when available
    guestName: userProfile?.name ?? order.guest_name ?? order.guestName ?? (userProfile?.email ?? null),
    guestEmail: userProfile?.email ?? order.guest_email ?? order.guestEmail ?? null,
    guestPhone: order.guest_phone ?? order.guestPhone ?? null,
    gameDetails: order.game_details ?? order.gameDetails ?? {},
    totalAmount: parseFloat(order.total_amount ?? order.totalAmount),
    discountAmount: parseFloat(order.discount_amount ?? order.discountAmount),
    couponCode: order.coupon_code ?? order.couponCode ?? null,
    status: order.status,
    paymentScreenshotUrl: order.payment_screenshot_url ?? order.paymentScreenshotUrl ?? null,
    adminNote: order.admin_note ?? order.adminNote ?? null,
    product: product ? formatProduct(product) : null,
    createdAt: order.created_at ?? order.createdAt,
    updatedAt: order.updated_at ?? order.updatedAt,
  };
}

router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("orders").select("*")
      .eq("user_id", (req as any).supabaseUserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const enriched = await Promise.all((data ?? []).map(enrichOrder));
    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders/stats/summary", requireAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const all = orders ?? [];
    const stats = {
      total: all.length,
      pending: all.filter(o => o.status === "pending").length,
      verified: all.filter(o => o.status === "verified").length,
      rejected: all.filter(o => o.status === "rejected").length,
      completed: all.filter(o => o.status === "completed").length,
      totalRevenue: all
        .filter(o => o.status === "completed" || o.status === "verified")
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    };
    const recent = await Promise.all(all.slice(0, 5).map(enrichOrder));
    return res.json({ ...stats, recentOrders: recent });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as any;
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    const enriched = await Promise.all((data ?? []).map(enrichOrder));
    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/orders", optionalAuth, async (req, res) => {
  try {
    const supabaseUserId = (req as any).supabaseUserId ?? null;
    const { productId, guestName, guestEmail, guestPhone, gameDetails, couponCode } = req.body;

    const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
    if (productError) throw productError;
    if (!product) return res.status(404).json({ error: "Product not found" });

    let baseAmount = parseFloat(product.price);
    const selectedVariantName = gameDetails?.__variantName as string | undefined;
    if (selectedVariantName) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const matched = variants.find((v: any) => v.name === selectedVariantName);
      if (matched && typeof matched.price === "number") baseAmount = matched.price;
    }

    let totalAmount = baseAmount;
    let discountAmount = 0;
    let validCouponCode: string | null = null;

    if (couponCode) {
      const { data: coupon } = await supabase.from("coupons").select("*").eq("code", couponCode).maybeSingle();
      if (coupon && coupon.active) {
        const appIds = Array.isArray(coupon.applicable_product_ids) ? coupon.applicable_product_ids as number[] : [];
        if (appIds.length === 0 || appIds.includes(productId)) {
          if (coupon.discount_type === "percentage") {
            discountAmount = totalAmount * parseFloat(coupon.discount_value) / 100;
          } else {
            discountAmount = parseFloat(coupon.discount_value);
          }
          totalAmount = Math.max(0, totalAmount - discountAmount);
          validCouponCode = couponCode;
          await supabase.from("coupons").update({ usage_count: (coupon.usage_count || 0) + 1 }).eq("id", coupon.id);
        }
      }
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: supabaseUserId,
      guest_name: guestName ?? null,
      guest_email: guestEmail ?? null,
      guest_phone: guestPhone ?? null,
      product_id: productId,
      game_details: gameDetails || {},
      total_amount: totalAmount.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      coupon_code: validCouponCode,
      status: "pending",
    }).select().single();
    if (orderError) throw orderError;

    if (supabaseUserId) {
      await supabase.from("users").upsert({
        supabase_id: supabaseUserId,
        email: (req as any).supabaseEmail || guestEmail || "",
        role: "user",
      }, { onConflict: "supabase_id", ignoreDuplicates: true });
    }

    return res.status(201).json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", Number(req.params.id)).maybeSingle();
    if (error) throw error;
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const { data: order, error } = await supabase.from("orders")
      .update({ status, admin_note: adminNote, updated_at: new Date().toISOString() })
      .eq("id", Number(req.params.id))
      .select().single();
    if (error) throw error;
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
