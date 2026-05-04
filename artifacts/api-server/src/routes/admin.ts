import { Router, type IRouter } from "express";
import { requireAdmin, requireAdminStrict } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatUser(u: any) {
  return {
    ...u,
    supabaseId: u.supabase_id ?? u.supabaseId,
    avatarUrl: u.avatar_url ?? u.avatarUrl ?? null,
    isBanned: u.is_banned ?? u.isBanned ?? false,
    createdAt: u.created_at ?? u.createdAt,
  };
}

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return res.json((data ?? []).map(formatUser));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/admin/users/:userId/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = String(req.params.userId);
    const { data: user, error } = await supabase.from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("supabase_id", userId)
      .select().single();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/admin/users/:userId/ban", requireAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body as { isBanned: boolean };
    const userId = String(req.params.userId);
    const { data: user, error } = await supabase.from("users")
      .update({ is_banned: isBanned, updated_at: new Date().toISOString() })
      .eq("supabase_id", userId)
      .select().single();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/admin/users/:userId", requireAdminStrict, async (req, res) => {
  try {
    const adminUser = (req as any).dbUser;
    const userId = String(req.params.userId);
    if (adminUser?.supabase_id === userId || adminUser?.supabaseId === userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    const { error } = await supabase.from("users").delete().eq("supabase_id", userId);
    if (error) throw error;
    return res.json({ message: "User deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const [ordersRes, usersRes, productsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("*"),
      supabase.from("products").select("*"),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (usersRes.error) throw usersRes.error;
    if (productsRes.error) throw productsRes.error;

    const allOrders = ordersRes.data ?? [];
    const allUsers = usersRes.data ?? [];
    const allProducts = productsRes.data ?? [];

    const paidOrders = allOrders.filter(o => o.status === "completed" || o.status === "verified");

    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const soldValue = totalRevenue;
    const totalCatalogValue = allProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const inStockValue = allProducts.filter(p => p.in_stock).reduce((sum, p) => sum + parseFloat(p.price), 0);

    const ordersByStatus = {
      pending:   allOrders.filter(o => o.status === "pending").length,
      verified:  allOrders.filter(o => o.status === "verified").length,
      completed: allOrders.filter(o => o.status === "completed").length,
      rejected:  allOrders.filter(o => o.status === "rejected").length,
    };

    const categoryMap: Record<string, { count: number; value: number }> = {};
    for (const p of allProducts) {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, value: 0 };
      categoryMap[p.category].count++;
      categoryMap[p.category].value += parseFloat(p.price);
    }
    const productsByCategory = Object.entries(categoryMap).map(([category, data]) => ({ category, ...data }));

    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      revenueByDay[key] = { revenue: 0, orders: 0 };
    }
    for (const o of paidOrders) {
      const key = (o.created_at ?? "").split("T")[0];
      if (revenueByDay[key]) {
        revenueByDay[key].revenue += parseFloat(o.total_amount);
        revenueByDay[key].orders++;
      }
    }

    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const recentOrders = allOrders.slice(0, 8).map((order) => {
      const product = productMap.get(order.product_id);
      return {
        id: order.id,
        userId: order.user_id,
        productId: order.product_id,
        guestName: order.guest_name,
        guestEmail: order.guest_email,
        guestPhone: order.guest_phone,
        gameDetails: order.game_details || {},
        totalAmount: parseFloat(order.total_amount),
        discountAmount: parseFloat(order.discount_amount),
        couponCode: order.coupon_code,
        status: order.status,
        paymentScreenshotUrl: order.payment_screenshot_url,
        adminNote: order.admin_note,
        product: product ? {
          ...product,
          price: parseFloat(product.price),
          tags: Array.isArray(product.tags) ? product.tags : [],
          dynamicFields: Array.isArray(product.dynamic_fields) ? product.dynamic_fields : [],
          createdAt: product.created_at,
        } : null,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      };
    });

    return res.json({
      totalRevenue,
      soldValue,
      totalCatalogValue,
      inStockValue,
      totalOrders: allOrders.length,
      pendingOrders: ordersByStatus.pending,
      totalUsers: allUsers.length,
      totalProducts: allProducts.length,
      ordersByStatus,
      productsByCategory,
      recentOrders,
      revenueByDay: Object.entries(revenueByDay).map(([date, data]) => ({ date, ...data })),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
