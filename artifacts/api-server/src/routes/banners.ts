import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

function formatBanner(b: any) {
  return { ...b, createdAt: b.createdAt?.toISOString?.() ?? b.createdAt };
}

router.get("/banners", async (req, res) => {
  try {
    const banners = await db.select().from(bannersTable)
      .where(eq(bannersTable.active, true))
      .orderBy(asc(bannersTable.sortOrder));
    return res.json(banners.map(formatBanner));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/banners", requireAdmin, async (req, res) => {
  try {
    const [banner] = await db.insert(bannersTable).values(req.body).returning();
    return res.status(201).json(formatBanner(banner));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/banners/:id", requireAdmin, async (req, res) => {
  try {
    const [banner] = await db.update(bannersTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(bannersTable.id, Number(req.params.id)))
      .returning();
    if (!banner) return res.status(404).json({ error: "Not found" });
    return res.json(formatBanner(banner));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/banners/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, Number(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
