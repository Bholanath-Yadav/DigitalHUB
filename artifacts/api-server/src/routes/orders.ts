import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/supabaseAuth.js";
import { db, ordersTable, productsTable, couponsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

async function enrichOrder(order: any) {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));
  return {
    ...order,
    totalAmount: parseFloat(order.totalAmount),
    discountAmount: parseFloat(order.discountAmount),
    gameDetails: order.gameDetails || {},
    product: product ? {
      ...product,
      price: parseFloat(product.price),
      tags: Array.isArray(product.tags) ? product.tags : [],
      dynamicFields: Array.isArray(product.dynamicFields) ? product.dynamicFields : [],
      createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    } : null,
    createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
    updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
  };
}

router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, (req as any).supabaseUserId))
      .orderBy(desc(ordersTable.createdAt));
    const enriched = await Promise.all(orders.map(enrichOrder));
    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders/stats/summary", requireAdmin, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      verified: orders.filter(o => o.status === "verified").length,
      rejected: orders.filter(o => o.status === "rejected").length,
      completed: orders.filter(o => o.status === "completed").length,
      totalRevenue: orders
        .filter(o => o.status === "completed" || o.status === "verified")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
      recentOrders: [],
    };
    const recent = await Promise.all(orders.slice(0, 5).map(enrichOrder));
    return res.json({ ...stats, recentOrders: recent });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as any;
    const conditions: any[] = [];
    if (status) conditions.push(eq(ordersTable.status, status));
    const orders = await db.select().from(ordersTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(ordersTable.createdAt));
    const enriched = await Promise.all(orders.map(enrichOrder));
    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/orders", optionalAuth, async (req, res) => {
  try {
    const supabaseUserId = (req as any).supabaseUserId ?? null;
    const { productId, guestName, guestEmail, guestPhone, gameDetails, couponCode } = req.body;

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) return res.status(404).json({ error: "Product not found" });

    let baseAmount = parseFloat(product.price);
    const selectedVariantName = gameDetails?.__variantName as string | undefined;
    if (selectedVariantName) {
      const variants = Array.isArray((product as any).variants) ? (product as any).variants : [];
      const matched = variants.find((v: any) => v.name === selectedVariantName);
      if (matched && typeof matched.price === "number") baseAmount = matched.price;
    }

    let totalAmount = baseAmount;
    let discountAmount = 0;
    let validCouponCode: string | null = null;

    if (couponCode) {
      const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode));
      if (coupon && coupon.active) {
        const appIds = Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds as number[] : [];
        if (appIds.length === 0 || appIds.includes(productId)) {
          if (coupon.discountType === "percentage") {
            discountAmount = totalAmount * parseFloat(coupon.discountValue) / 100;
          } else {
            discountAmount = parseFloat(coupon.discountValue);
          }
          totalAmount = Math.max(0, totalAmount - discountAmount);
          validCouponCode = couponCode;
          await db.update(couponsTable).set({ usageCount: (coupon.usageCount || 0) + 1 }).where(eq(couponsTable.id, coupon.id));
        }
      }
    }

    const [order] = await db.insert(ordersTable).values({
      userId: supabaseUserId,
      guestName: guestName ?? null,
      guestEmail: guestEmail ?? null,
      guestPhone: guestPhone ?? null,
      productId,
      gameDetails: gameDetails || {},
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      couponCode: validCouponCode,
      status: "pending",
    }).returning();

    if (supabaseUserId) {
      await db.insert(usersTable).values({
        supabaseId: supabaseUserId,
        email: (req as any).supabaseEmail || guestEmail || "",
        role: "user",
      }).onConflictDoNothing();
    }

    return res.status(201).json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const [order] = await db.update(ordersTable)
      .set({ status, adminNote, updatedAt: new Date() })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(await enrichOrder(order));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
