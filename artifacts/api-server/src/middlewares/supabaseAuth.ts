import { supabase } from "../lib/supabase.js";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: "Unauthorized" }); return; }

  (req as any).supabaseUserId = user.id;
  (req as any).supabaseEmail = user.email ?? "";
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      (req as any).supabaseUserId = user.id;
      (req as any).supabaseEmail = user.email ?? "";
    }
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const { data: dbUser } = await supabase.from("users").select("*").eq("supabase_id", user.id).maybeSingle();
    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "staff")) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    (req as any).supabaseUserId = user.id;
    (req as any).supabaseEmail = user.email ?? "";
    (req as any).dbUser = dbUser;
    next();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function requireAdminStrict(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const { data: dbUser } = await supabase.from("users").select("*").eq("supabase_id", user.id).maybeSingle();
    if (!dbUser || dbUser.role !== "admin") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    (req as any).supabaseUserId = user.id;
    (req as any).supabaseEmail = user.email ?? "";
    (req as any).dbUser = dbUser;
    next();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
