import { Router, type IRouter } from "express";
import { requireAdmin, optionalAuth } from "../middlewares/supabaseAuth.js";
import { db, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const BOT_REPLIES: Record<string, string> = {
  "hello":    "Hello! Welcome to Digital HUB Nepal. How can I help you today? 😊",
  "hi":       "Hi there! How can we assist you with your gaming top-ups?",
  "help":     "I can help with: orders, payments, products, and account issues. What do you need?",
  "order":    "To check your order status, visit 'My Orders' in your profile. For further help, our team will reply shortly!",
  "payment":  "We accept eSewa, Khalti, and IME Pay. After payment, upload your screenshot on the checkout page.",
  "refund":   "For refunds, please contact our support team via WhatsApp at +977 9826749317. Refunds are processed within 3–5 business days.",
  "delivery": "Digital products are delivered after payment verification — typically within 1–2 hours.",
  "discount": "Check our products for available discounts. Use coupon codes at checkout to save more!",
  "account":  "For account issues, visit your profile settings or WhatsApp us at +977 9826749317.",
  "free fire":   "We offer Free Fire Diamonds in multiple denominations. Browse our Game Top-ups category!",
  "pubg":        "We have PUBG UC available! Check out our Game Top-ups section for the latest packages.",
  "mobile legends": "Mobile Legends Diamonds are available in our store. Fast delivery, best price!",
  "tiktok":   "TikTok Coins are available — instant delivery after payment verification!",
  "netflix":  "Netflix subscriptions are available in our Subscriptions category.",
  "spotify":  "Spotify Premium subscriptions available! Check our Subscriptions section.",
  "price":    "Our prices are among the lowest in Nepal. Browse our products to compare. No hidden fees!",
  "status":   "Your order status is shown in 'My Orders' in your profile. If you need a manual update, please share your order number.",
  "esewa":    "Yes! We accept eSewa. After placing your order, you'll see our eSewa QR code and account number.",
  "khalti":   "Yes! We accept Khalti. You'll see our Khalti payment details after placing your order.",
};

function getBotReply(message: string): string {
  const lower = message.toLowerCase();
  for (const [keyword, reply] of Object.entries(BOT_REPLIES)) {
    if (lower.includes(keyword)) return reply;
  }
  return "Thank you for your message! Our support team will reply shortly. For urgent help, WhatsApp us at +977 9826749317. 🎮";
}

function formatMessage(m: any) {
  return { ...m, createdAt: m.createdAt?.toISOString?.() ?? m.createdAt };
}

router.get("/chat/messages", async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId ?? "");
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });
    const messages = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId))
      .orderBy(asc(chatMessagesTable.createdAt));
    return res.json(messages.map(formatMessage));
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
      const [user] = await db.select().from(usersTable).where(eq(usersTable.supabaseId, supabaseId));
      if (user && (user.role === "admin" || user.role === "staff")) {
        senderRole = "staff";
      }
    }

    const [userMsg] = await db.insert(chatMessagesTable).values({
      sessionId,
      userId: supabaseId ?? null,
      guestName: guestName ?? null,
      sender: senderRole,
      content: content.trim(),
      read: senderRole === "staff" ? 1 : 0,
    }).returning();

    if (senderRole === "user") {
      const botReply = getBotReply(content);
      const [botMsg] = await db.insert(chatMessagesTable).values({
        sessionId, userId: null, guestName: null, sender: "bot",
        content: botReply, read: 0,
      }).returning();

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
    await db.delete(chatMessagesTable).where(eq(chatMessagesTable.sessionId, sessionId));
    return res.json({ message: "Session deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

router.get("/chat/sessions", requireAdmin, async (req, res) => {
  try {
    const allMessages = await db.select().from(chatMessagesTable).orderBy(asc(chatMessagesTable.createdAt));
    const sessionMap = new Map<string, any>();
    for (const msg of allMessages) {
      if (!sessionMap.has(msg.sessionId)) {
        sessionMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          userId: msg.userId,
          guestName: msg.guestName,
          lastMessage: null,
          unreadCount: 0,
          updatedAt: msg.createdAt,
        });
      }
      const session = sessionMap.get(msg.sessionId);
      session.lastMessage = msg.content;
      session.updatedAt = msg.createdAt;
      if (msg.sender === "user" && !msg.read) session.unreadCount++;
      if (msg.guestName && !session.guestName) session.guestName = msg.guestName;
    }
    const sessions = Array.from(sessionMap.values())
      .map((s: any) => ({ ...s, updatedAt: s.updatedAt?.toISOString?.() ?? s.updatedAt }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return res.json(sessions);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal error" }); }
});

export default router;
