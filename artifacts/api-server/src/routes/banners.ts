import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";

const router: IRouter = Router();

function formatBanner(b: any) {
  return {
    ...b,
    imageUrl: b.image_url ?? b.imageUrl,
    linkUrl: b.link_url ?? b.linkUrl,
    sortOrder: b.sort_order ?? b.sortOrder,
    createdAt: b.created_at ?? b.createdAt,
    updatedAt: b.updated_at ?? b.updatedAt,
  };
}

router.get("/banners", async (req, res) => {
  try {
    const { data, error } = await supabase.from("banners").select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return res.json((data ?? []).map(formatBanner));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/banners", requireAdmin, async (req, res) => {
  try {
    const insertData = {
      title: req.body.title,
      subtitle: req.body.subtitle || null,
      image_url: req.body.imageUrl || null,
      link_url: req.body.linkUrl || null,
      active: req.body.active,
      sort_order: req.body.sortOrder
    };
    const { data, error } = await supabase.from("banners").insert(insertData).select().single();
    if (error) throw error;
    return res.status(201).json(formatBanner(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/banners/:id", requireAdmin, async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      subtitle: req.body.subtitle || null,
      image_url: req.body.imageUrl || null,
      link_url: req.body.linkUrl || null,
      active: req.body.active,
      sort_order: req.body.sortOrder,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from("banners")
      .update(updateData)
      .eq("id", Number(req.params.id))
      .select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    return res.json(formatBanner(data));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/banners/:id", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("banners").delete().eq("id", Number(req.params.id));
    if (error) throw error;
    return res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
