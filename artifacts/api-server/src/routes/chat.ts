import { Router, type IRouter } from "express";
import { requireAdmin, optionalAuth } from "../middlewares/supabaseAuth.js";
import { supabase } from "../lib/supabase.js";
import { getAIResponseWithContext } from "../lib/gemini.js";

const router: IRouter = Router();

function formatMessage(m: any) {
  return { ...m, createdAt: m.created_at ?? m.createdAt };
}

router.get("/chat/messages", async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId ?? "");
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });
    const { data, error } = await supabase.from("chat_messages").select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return res.json((data ?? []).map(formatMessage));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.post("/chat/messages", optionalAuth, async (req, res) => {
  try {
    const { sessionId, content, guestName, isStaff } = req.body;
    if (!sessionId || !content?.trim()) {
      return res.status(400).json({ error: "sessionId and content are required" });
    }

    const supabaseId = (req as any).supabaseUserId;
    let senderRole: "user" | "staff" = "user";
    if (isStaff && supabaseId) {
      const { data: user } = await supabase.from("users").select("role").eq("supabase_id", supabaseId).maybeSingle();
      if (user && (user.role === "admin" || user.role === "staff")) {
        senderRole = "staff";
      }
    }

    const { data: userMsg, error: msgError } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: supabaseId ?? null,
      guest_name: guestName ?? null,
      sender: senderRole,
      content: content.trim(),
      read: senderRole === "staff" ? 1 : 0,
    }).select().single();
    if (msgError) throw msgError;

    if (senderRole === "user") {
      const { data: recentRows } = await supabase
        .from("chat_messages")
        .select("sender, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(8);

      const recentMessages = (recentRows ?? []).reverse().map((row: any) => ({
        sender: row.sender,
        content: row.content,
      }));

      const botReply = await getAIResponseWithContext(content, recentMessages);
      const { data: botMsg, error: botError } = await supabase.from("chat_messages").insert({
        session_id: sessionId,
        user_id: null,
        guest_name: null,
        sender: "bot",
        content: botReply,
        read: 0,
      }).select().single();
      if (botError) throw botError;

      return res.status(201).json({
        userMessage: formatMessage(userMsg),
        botMessage: formatMessage(botMsg),
      });
    }

    return res.status(201).json({ userMessage: formatMessage(userMsg), botMessage: null });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.delete("/chat/sessions/:sessionId", requireAdmin, async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId);
    const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionId);
    if (error) throw error;
    return res.json({ message: "Session deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/chat/sessions", requireAdmin, async (req, res) => {
  try {
    const { data: allMessages, error } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    const sessionMap = new Map<string, any>();
    for (const msg of (allMessages ?? [])) {
      const sid = msg.session_id;
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          sessionId: sid,
          userId: msg.user_id,
          guestName: msg.guest_name,
          lastMessage: null,
          unreadCount: 0,
          updatedAt: msg.created_at,
        });
      }
      const session = sessionMap.get(sid);
      session.lastMessage = msg.content;
      session.updatedAt = msg.created_at;
      if (msg.sender === "user" && !msg.read) session.unreadCount++;
      if (msg.guest_name && !session.guestName) session.guestName = msg.guest_name;
    }
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return res.json(sessions);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
