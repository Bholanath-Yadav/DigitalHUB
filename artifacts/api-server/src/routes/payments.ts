import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatPayment(p: any) {
  return {
    ...p,
    orderId: p.order_id ?? p.orderId,
    screenshotUrl: p.screenshot_url ?? p.screenshotUrl ?? null,
    paymentMethod: p.payment_method ?? p.paymentMethod,
    adminNote: p.admin_note ?? p.adminNote ?? null,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.updated_at ?? p.updatedAt,
  };
}

router.post("/payments/upload", async (req, res) => {
  try {
    const { orderId, screenshotUrl, paymentMethod } = req.body;
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ payment_screenshot_url: screenshotUrl, updated_at: new Date().toISOString() }).eq("id", orderId);

    const { data: payment, error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      screenshot_url: screenshotUrl,
      payment_method: paymentMethod,
      status: "pending",
    }).select().single();
    if (paymentError) throw paymentError;

    return res.json(formatPayment(payment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/payments", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as any;
    let query = supabase.from("payments").select("*");
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return res.json((data ?? []).map(formatPayment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/payments/:id/verify", requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const { data: payment, error } = await supabase.from("payments")
      .update({ status, admin_note: adminNote, updated_at: new Date().toISOString() })
      .eq("id", Number(req.params.id))
      .select().single();
    if (error) throw error;
    if (!payment) return res.status(404).json({ error: "Not found" });

    if (status === "verified") {
      await supabase.from("orders").update({ status: "verified", updated_at: new Date().toISOString() }).eq("id", payment.order_id);
    } else if (status === "rejected") {
      await supabase.from("orders").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", payment.order_id);
    }

    return res.json(formatPayment(payment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
