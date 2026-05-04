import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

type ChatMsg = {
  id: number;
  sessionId: string;
  sender: "user" | "bot" | "staff";
  content: string;
  createdAt: string;
};

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch { return ""; }
}

function ChatBubbleIcon() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="10" width="42" height="30" rx="10" fill="url(#backBubble)" opacity="0.85" />
      <path d="M44 40 L50 48 L38 40Z" fill="url(#backBubble)" opacity="0.85" />
      <rect x="4" y="2" width="44" height="32" rx="10" fill="url(#frontBubble)" />
      <path d="M16 34 L10 44 L24 34Z" fill="url(#frontBubble)" />
      <text x="13" y="18" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="8.5" letterSpacing="1" fill="white" opacity="0.95">LIVE</text>
      <circle cx="11" cy="26" r="2.5" fill="#ff4444">
        <animate attributeName="r" values="2.5;3.5;2.5" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <text x="16" y="29" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="8.5" letterSpacing="1" fill="white" opacity="0.95">CHAT</text>
      <defs>
        <linearGradient id="frontBubble" x1="4" y1="2" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="backBubble" x1="14" y1="10" x2="56" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const GREETING: ChatMsg = {
  id: -1,
  sessionId: "",
  sender: "bot",
  content: "👋 Welcome to Digital HUB Nepal! How can we help you today? Ask about orders, payments, game top-ups, or anything else!",
  createdAt: new Date().toISOString(),
};

export function ChatWidget() {
  const [isOpen, setIsOpen]     = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage]   = useState("");
  const [unread, setUnread]     = useState(1);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Init session ID from localStorage
  useEffect(() => {
    let stored = localStorage.getItem("chat_session_id");
    if (!stored) {
      stored = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("chat_session_id", stored);
    }
    setSessionId(stored);
  }, []);

  // Load messages from server
  const fetchMessages = useCallback(async (sid: string) => {
    if (!sid) return;
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sid)}`);
      if (!res.ok) return;
      const data: ChatMsg[] = await res.json();
      setMessages(data.length > 0 ? data : [GREETING]);
    } catch { /* network error — keep existing messages */ }
  }, []);

  // Fetch on open
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchMessages(sessionId);
    }
  }, [isOpen, sessionId, fetchMessages]);

  // Poll every 4s while open
  useEffect(() => {
    if (!isOpen || !sessionId) return;
    const id = setInterval(() => fetchMessages(sessionId), 4000);
    return () => clearInterval(id);
  }, [isOpen, sessionId, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    setMessage("");
    setSending(true);

    // Optimistic: add user message immediately
    const optimisticUserMsg: ChatMsg = {
      id: Date.now(),
      sessionId,
      sender: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => {
      const base = prev.filter(m => m.id !== -1); // Remove greeting placeholder
      return [...base, optimisticUserMsg];
    });

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: text }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic message + add bot reply
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== optimisticUserMsg.id);
          const next = [...filtered];
          if (data.userMessage) next.push(data.userMessage);
          if (data.botMessage)  next.push(data.botMessage);
          return next;
        });
        // Also invalidate any cached queries
        queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
      } else {
        // Remove optimistic on error
        setMessages(prev => prev.filter(m => m.id !== optimisticUserMsg.id));
        setMessage(text);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMsg.id));
      setMessage(text);
    } finally {
      setSending(false);
    }
  };

  const displayMessages = messages.length === 0 ? [GREETING] : messages;

  return (
    <>
      {/* ── Floating bubble button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-btn"
            onClick={handleOpen}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.93 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1 select-none"
            aria-label="Open live chat"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-40 scale-110"
                style={{ background: "radial-gradient(circle, #06b6d4 0%, #7c3aed 100%)" }} />
              <div className="relative drop-shadow-2xl"><ChatBubbleIcon /></div>
              {unread > 0 && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.3 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 border-2 border-white dark:border-[hsl(228,38%,7%)] flex items-center justify-center text-white text-[10px] font-black px-1 shadow-lg"
                  style={{ boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
                >
                  {unread}
                </motion.div>
              )}
            </div>
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[11px] font-bold tracking-wide shadow-lg"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              LIVE SUPPORT
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: "min(340px, calc(100vw - 2rem))", height: "min(520px, calc(100dvh - 5rem))" }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: "linear-gradient(135deg, #0e7490 0%, #6d28d9 100%)" }}>
              <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-black text-gray-800 shrink-0 shadow z-10">
                CS
              </div>
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm leading-tight">Customer Support</p>
                  <span className="flex items-center gap-1 bg-red-500/30 border border-red-400/50 text-red-300 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow shadow-green-400/50" />
                  <span className="text-white/80 text-xs">Online · replies in minutes</span>
                </div>
              </div>
              <div className="relative z-10">
                <button onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-white dark:bg-[hsl(228,38%,9%)]">
              {displayMessages.map((msg, idx) => {
                const isUser  = msg.sender === "user";
                const isStaff = msg.sender === "staff";
                return (
                  <div key={msg.id ?? idx} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    {!isUser && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mb-3 ${isStaff ? "bg-primary text-white" : "bg-yellow-400 text-gray-800"}`}>
                        {isStaff ? "ST" : "CS"}
                      </div>
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-snug
                          ${isUser
                            ? "text-white rounded-br-sm"
                            : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                          }`}
                        style={isUser ? { background: "linear-gradient(135deg, #06b6d4, #7c3aed)" } : {}}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-black text-gray-800 shrink-0 mb-3">CS</div>
                  <div className="bg-gray-100 dark:bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 py-3 bg-white dark:bg-[hsl(228,38%,9%)] border-t border-gray-100 dark:border-white/10">
              <form onSubmit={handleSend}
                className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100 min-w-0"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-30 hover:opacity-80"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #7c3aed)" }}
                >
                  {sending
                    ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Send className="h-3.5 w-3.5" />
                  }
                </button>
              </form>
              <p className="text-center text-[10px] text-gray-400 mt-1.5">
                WhatsApp: <a href="https://wa.me/9779826749317" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">+977 9826749317</a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
