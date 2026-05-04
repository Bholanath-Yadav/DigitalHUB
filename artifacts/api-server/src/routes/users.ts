import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/supabaseAuth.js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatUser(u: any) {
  return { ...u, createdAt: u.createdAt?.toISOString?.() ?? u.createdAt };
}

router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    let [user] = await db.select().from(usersTable).where(eq(usersTable.supabaseId, supabaseId));

    if (!user) {
      [user] = await db.insert(usersTable).values({
        supabaseId,
        email: (req as any).supabaseEmail ?? "",
        role: "user",
      }).returning();
    }

    if (user.isBanned) return res.status(403).json({ error: "Account banned" });

    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.put("/users/me", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    const { name, phone, avatarUrl } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const [user] = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.supabaseId, supabaseId))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/users/sync", requireAuth, async (req, res) => {
  try {
    const supabaseId = (req as any).supabaseUserId;
    const { email, name, avatarUrl } = req.body;

    let [user] = await db.select().from(usersTable).where(eq(usersTable.supabaseId, supabaseId));

    if (!user) {
      [user] = await db.insert(usersTable).values({
        supabaseId,
        email: email ?? "",
        name: name ?? null,
        avatarUrl: avatarUrl ?? null,
        role: "user",
      }).returning();
    } else if (email && !user.email) {
      [user] = await db.update(usersTable)
        .set({ email, updatedAt: new Date() })
        .where(eq(usersTable.supabaseId, supabaseId))
        .returning();
    }

    if (user.isBanned) return res.status(403).json({ error: "Account banned" });

    return res.json(formatUser(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
