import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { db, paymentsTable, ordersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function formatPayment(p: any) {
  return { ...p, createdAt: p.createdAt?.toISOString?.() ?? p.createdAt };
}

router.post("/payments/upload", async (req, res) => {
  try {
    const { orderId, screenshotUrl, paymentMethod } = req.body;
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return res.status(404).json({ error: "Order not found" });

    await db.update(ordersTable).set({ paymentScreenshotUrl: screenshotUrl, updatedAt: new Date() }).where(eq(ordersTable.id, orderId));

    const [payment] = await db.insert(paymentsTable).values({
      orderId, screenshotUrl, paymentMethod, status: "pending",
    }).returning();

    return res.json(formatPayment(payment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/payments", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as any;
    const conditions: any[] = [];
    if (status) conditions.push(eq(paymentsTable.status, status));
    const payments = await db.select().from(paymentsTable)
      .where(conditions.length ? and(...conditions) : undefined);
    return res.json(payments.map(formatPayment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/payments/:id/verify", requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const [payment] = await db.update(paymentsTable)
      .set({ status, adminNote, updatedAt: new Date() } as any)
      .where(eq(paymentsTable.id, Number(req.params.id)))
      .returning();
    if (!payment) return res.status(404).json({ error: "Not found" });

    if (status === "verified") {
      await db.update(ordersTable).set({ status: "verified", updatedAt: new Date() }).where(eq(ordersTable.id, payment.orderId));
    } else if (status === "rejected") {
      await db.update(ordersTable).set({ status: "rejected", updatedAt: new Date() }).where(eq(ordersTable.id, payment.orderId));
    }

    return res.json(formatPayment(payment));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
