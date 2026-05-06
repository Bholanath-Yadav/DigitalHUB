import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function formatProduct(p: any) {
  return {
    ...p,
    price: parseFloat(p.price),
    imageUrl: p.image_url ?? p.imageUrl ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    dynamicFields: Array.isArray(p.dynamic_fields ?? p.dynamicFields)
      ? p.dynamic_fields ?? p.dynamicFields
      : [],
    inStock: p.in_stock ?? p.inStock ?? false,
    featured: p.featured ?? false,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.updated_at ?? p.updatedAt,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Initialize Supabase client inside handler (so env vars are read at runtime)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  console.log("Supabase URL:", supabaseUrl ? "✓ set" : "✗ MISSING");
  console.log("Supabase Key:", supabaseKey ? "✓ set" : "✗ MISSING");

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
    return res.status(500).json({
      error: "Server configuration error: missing Supabase credentials",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/products (list all or filter by category/search)
    if (req.method === "GET" && !req.query.id) {
      const { category, search, featured } = req.query;

      let query = supabase.from("products").select("*");
      if (category) query = query.eq("category", category as string);
      if (featured === "true") query = query.eq("featured", true);
      if (search) query = query.ilike("name", `%${search}%`);
      query = query.order("created_at", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      console.log("Products fetched:", (data ?? []).length);

      res.setHeader(
        "Cache-Control",
        "public, max-age=600, stale-while-revalidate=3600"
      );
      return res.status(200).json((data ?? []).map(formatProduct));
    }

    // GET /api/products?id=<id> (get single product)
    if (req.method === "GET" && req.query.id) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(req.query.id))
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Not found" });

      res.setHeader(
        "Cache-Control",
        "public, max-age=600, stale-while-revalidate=3600"
      );
      return res.status(200).json(formatProduct(data));
    }

    // POST /api/products (create product - admin only)
    if (req.method === "POST") {
      // TODO: Add auth check if needed (for now, allow all)
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...req.body,
          tags: req.body.tags || [],
          dynamic_fields:
            req.body.dynamicFields || req.body.dynamic_fields || [],
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(formatProduct(data));
    }

    // PUT /api/products?id=<id> (update product - admin only)
    if (req.method === "PUT" && req.query.id) {
      const { data, error } = await supabase
        .from("products")
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(req.query.id))
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(formatProduct(data));
    }

    // DELETE /api/products?id=<id> (delete product - admin only)
    if (req.method === "DELETE" && req.query.id) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", Number(req.query.id));

      if (error) throw error;
      return res.status(200).json({ message: "Deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("API Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
