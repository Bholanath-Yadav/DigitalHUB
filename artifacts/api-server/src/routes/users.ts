import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/supabaseAuth.js";
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

router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    let { data: user, error } = await supabase.from("users").select("*").eq("supabase_id", supabaseId).maybeSingle();
    if (error) throw error;

    if (!user) {
      const { data: newUser, error: insertError } = await supabase.from("users").insert({
        supabase_id: supabaseId,
        email: (req as any).supabaseEmail ?? "",
        role: "user",
      }).select().single();
      if (insertError) throw insertError;
      user = newUser;
    }

    if (user.is_banned) return res.status(403).json({ error: "Account banned" });

    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/users/me", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    const { name, phone, avatarUrl } = req.body;
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    const { data: user, error } = await supabase.from("users")
      .update(updateData)
      .eq("supabase_id", supabaseId)
      .select().single();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/users/sync", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    const { email, name, avatarUrl } = req.body;

    let { data: user, error } = await supabase.from("users").select("*").eq("supabase_id", supabaseId).maybeSingle();
    if (error) throw error;

    if (!user) {
      const { data: newUser, error: insertError } = await supabase.from("users").insert({
        supabase_id: supabaseId,
        email: email ?? "",
        name: name ?? null,
        avatar_url: avatarUrl ?? null,
        role: "user",
      }).select().single();
      if (insertError) throw insertError;
      user = newUser;
    } else if (email && !user.email) {
      const { data: updatedUser, error: updateError } = await supabase.from("users")
        .update({ email, updated_at: new Date().toISOString() })
        .eq("supabase_id", supabaseId)
        .select().single();
      if (updateError) throw updateError;
      user = updatedUser;
    }

    if (user.is_banned) return res.status(403).json({ error: "Account banned" });

    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
