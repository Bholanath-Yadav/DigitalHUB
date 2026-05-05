import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    ...p,
    price: parseFloat(p.price),
    imageUrl: p.image_url ?? p.imageUrl ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    dynamicFields: Array.isArray(p.dynamic_fields ?? p.dynamicFields) ? (p.dynamic_fields ?? p.dynamicFields) : [],
    inStock: p.in_stock ?? p.inStock ?? false,
    featured: p.featured ?? false,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.updated_at ?? p.updatedAt,
  };
}

router.get("/products", async (req, res) => {
  try {
    const { category, search, featured } = req.query as any;
    let query = supabase.from("products").select("*");
    if (category) query = query.eq("category", category);
    if (featured === "true") query = query.eq("featured", true);
    if (search) query = query.ilike("name", `%${search}%`);
    query = query.order("created_at", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    res.set("Cache-Control", "public, max-age=600, stale-while-revalidate=3600"); // 10 min cache, 1 hr stale
    return res.json((data ?? []).map(formatProduct));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/products/stats/summary", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    const all = data ?? [];
    const byCategory: Record<string, number> = {};
    let inStock = 0, outOfStock = 0;
    for (const p of all) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      if (p.in_stock) inStock++; else outOfStock++;
    }
    return res.json({ total: all.length, byCategory, inStock, outOfStock });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", Number(req.params.id)).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.set("Cache-Control", "public, max-age=600, stale-while-revalidate=3600"); // 10 min cache, 1 hr stale
    return res.json(formatProduct(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").insert({
      ...req.body,
      tags: req.body.tags || [],
      dynamic_fields: req.body.dynamicFields || req.body.dynamic_fields || [],
    }).select().single();
    if (error) throw error;
    return res.status(201).json(formatProduct(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", Number(req.params.id))
      .select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    return res.json(formatProduct(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", Number(req.params.id));
    if (error) throw error;
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
