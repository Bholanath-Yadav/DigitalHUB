import { Router, type IRouter } from "express";
import { requireAdminStrict } from "../middlewares/supabaseAuth.js";
import { db, paymentSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_SETTINGS = [
  { method: "esewa",      label: "eSewa",        sortOrder: 0, enabled: true, accountName: "GameStore Nepal", accountNumber: "9800000000" },
  { method: "khalti",     label: "Khalti",       sortOrder: 1, enabled: true, accountName: "GameStore Nepal", accountNumber: "9800000000" },
  { method: "connectips", label: "ConnectIPS",   sortOrder: 2, enabled: true, accountName: "GameStore Nepal", accountNumber: "123456789"  },
  { method: "bank",       label: "Bank Transfer", sortOrder: 3, enabled: true, accountName: "GameStore Nepal", accountNumber: "0123456789012" },
];

async function ensureDefaults() {
  for (const d of DEFAULT_SETTINGS) {
    const [existing] = await db.select().from(paymentSettingsTable).where(eq(paymentSettingsTable.method, d.method));
    if (!existing) await db.insert(paymentSettingsTable).values(d);
  }
}

function fmt(s: any) {
  return { ...s, updatedAt: s.updatedAt?.toISOString?.() ?? s.updatedAt };
}

router.get("/payment-settings", async (req, res) => {
  try {
    await ensureDefaults();
    const settings = await db.select().from(paymentSettingsTable).orderBy(paymentSettingsTable.sortOrder);
    return res.json(settings.map(fmt));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/admin/payment-settings/:method", requireAdminStrict, async (req, res) => {
  try {
    const method = String(req.params.method);
    const { label, enabled, accountName, accountNumber, qrImageUrl, instructions, sortOrder } = req.body;
    const [existing] = await db.select().from(paymentSettingsTable).where(eq(paymentSettingsTable.method, method));

    if (!existing) {
      const [created] = await db.insert(paymentSettingsTable).values({
        method, label: label ?? method, enabled: enabled ?? true,
        accountName, accountNumber, qrImageUrl, instructions, sortOrder: sortOrder ?? 0,
      }).returning();
      return res.json(fmt(created));
    }

    const [updated] = await db.update(paymentSettingsTable)
      .set({
        ...(label !== undefined && { label }),
        ...(enabled !== undefined && { enabled }),
        ...(accountName !== undefined && { accountName }),
        ...(accountNumber !== undefined && { accountNumber }),
        ...(qrImageUrl !== undefined && { qrImageUrl }),
        ...(instructions !== undefined && { instructions }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(paymentSettingsTable.method, method))
      .returning();

    return res.json(fmt(updated));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
