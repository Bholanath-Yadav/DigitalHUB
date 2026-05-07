import { useState, useRef, useEffect } from "react";
import { useListChatSessions, useGetChatMessages, useDeleteChatSession } from "@/lib/api-hooks";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminChat() {
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: sessions, isLoading } = useListChatSessions({
    query: { queryKey: ["admin-chat-sessions"], refetchInterval: 5000 },
  });

  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useGetChatMessages(
    { sessionId: selectedSession ?? "" },
    {
      query: {
        queryKey: ["admin-chat-messages", selectedSession],
        enabled: !!selectedSession,
        refetchInterval: 3000,
      },
    }
  );

  const deleteSession = useDeleteChatSession();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedSession || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    try {
      // Insert staff message directly to Supabase
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: selectedSession,
          sender: "staff",
          content: text,
        });
      
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", selectedSession] });
        queryClient.invalidateQueries({ queryKey: ["admin-chat-sessions"] });
      } else {
        setReply(text);
        toast({ title: "Failed to send message", variant: "destructive" });
      }
    } catch {
      setReply(text);
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSession.mutate(
      deleteTarget,
      {
        onSuccess: () => {
          toast({ title: "Chat deleted" });
          if (selectedSession === deleteTarget) setSelectedSession(null);
          setDeleteTarget(null);
          queryClient.invalidateQueries({ queryKey: ["admin-chat-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", deleteTarget] });
        },
        onError: () => toast({ title: "Failed to delete chat", variant: "destructive" }),
      }
    );
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const selectedSessionData = sessions?.find(s => s.sessionId === selectedSession);

  return (
    <div className="relative p-4 md:p-6 h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Support Chat</h2>
          <p className="text-xs text-muted-foreground">{sessions?.length ?? 0} active sessions</p>
        </div>
      </div>

      <div className="flex gap-3 flex-1 min-h-0 overflow-hidden" style={{ height: "calc(100vh - 14rem)" }}>
        {/* Sessions list */}
        <div className="w-64 shrink-0 border rounded-xl bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 text-sm font-semibold">Conversations</div>
          <div className="overflow-y-auto flex-1">
            {isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
            {!isLoading && sessions?.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No active chats</div>
            )}
            {sessions?.map(session => (
              <div key={session.sessionId}
                className={`group relative border-b transition-colors hover:bg-muted/50
                  ${selectedSession === session.sessionId ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
                <button onClick={() => setSelectedSession(session.sessionId)} className="w-full text-left p-3 pr-10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{session.guestName || "Guest User"}</span>
                    {(session.unreadCount ?? 0) > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-[10px] px-1.5">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{session.lastMessage || "No messages yet"}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(session.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(session.sessionId); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  title="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 border rounded-xl bg-card flex flex-col overflow-hidden min-w-0">
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 opacity-30" />
              </div>
              <p className="text-sm">Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(selectedSessionData?.guestName?.[0] ?? "G").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none">{selectedSessionData?.guestName || "Guest User"}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Session: {selectedSession.slice(0, 8)}…</p>
                </div>
                <button
                  onClick={() => setDeleteTarget(selectedSession)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete this chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages?.map(msg => {
                  const isStaff = msg.sender === "staff" || msg.sender === "bot";
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] flex flex-col gap-0.5 ${isStaff ? "items-end" : "items-start"}`}>
                        {!isStaff && (
                          <span className="text-[9px] text-muted-foreground px-1 mb-0.5">Customer</span>
                        )}
                        <div className={`px-3 py-2 rounded-2xl text-sm leading-snug
                          ${isStaff
                            ? msg.sender === "bot"
                              ? "bg-muted text-foreground rounded-br-sm"
                              : "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-gray-100 dark:bg-white/10 text-foreground rounded-bl-sm"}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">
                          {isStaff ? (msg.sender === "bot" ? "Bot · " : "You · ") : ""}{formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(!messages || messages.length === 0) && (
                  <p className="text-center text-xs text-muted-foreground pt-6">No messages in this session yet.</p>
                )}
              </div>

              <div className="px-4 py-3 border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply…"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || sending}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" /> {sending ? "Sending…" : "Send"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete this chat?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            All messages in this conversation will be permanently deleted and cannot be recovered.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSession.isPending}>
              Delete Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
