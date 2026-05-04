import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    ...p,
    price: parseFloat(p.price),
    tags: Array.isArray(p.tags) ? p.tags : [],
    dynamicFields: Array.isArray(p.dynamicFields) ? p.dynamicFields : [],
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
  };
}

router.get("/products", async (req, res) => {
  try {
    const { category, search, featured } = req.query as any;
    const conditions: any[] = [];
    if (category) conditions.push(eq(productsTable.category, category));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

    const products = await db.select().from(productsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(productsTable.createdAt);

    if (!search) res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json(products.map(formatProduct));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/products/stats/summary", requireAdmin, async (req, res) => {
  try {
    const all = await db.select().from(productsTable);
    const byCategory: Record<string, number> = {};
    let inStock = 0, outOfStock = 0;
    for (const p of all) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      if (p.inStock) inStock++; else outOfStock++;
    }
    return res.json({ total: all.length, byCategory, inStock, outOfStock });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/products/:id", async (req, res) => {
  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, Number(req.params.id)));
    if (!product) return res.status(404).json({ error: "Not found" });
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json(formatProduct(product));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const [product] = await db.insert(productsTable).values({
      ...req.body,
      tags: req.body.tags || [],
      dynamicFields: req.body.dynamicFields || [],
    }).returning();
    return res.status(201).json(formatProduct(product));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const [product] = await db.update(productsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(productsTable.id, Number(req.params.id)))
      .returning();
    if (!product) return res.status(404).json({ error: "Not found" });
    return res.json(formatProduct(product));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
