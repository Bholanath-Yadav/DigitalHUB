import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function OrderRealtimeNotifier() {
  const { user, isSignedIn } = useAuth();
  const { toast } = useToast();
  const lastStatusRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    let mounted = true;

    const primeCache = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, user_id")
        .eq("user_id", user.id);
      if (error || !mounted) return;
      const next = new Map<number, string>();
      for (const row of data ?? []) next.set(row.id, row.status);
      lastStatusRef.current = next;
    };

    void primeCache();

    const channel = supabase
      .channel(`order-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const next = payload.new as any;
          const previous = payload.old as any;
          const previousStatus = previous?.status ?? lastStatusRef.current.get(next?.id);
          const nextStatus = next?.status;

          if (next?.id && nextStatus) {
            lastStatusRef.current.set(next.id, nextStatus);
          }

          queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          queryClient.invalidateQueries({ queryKey: ["order", next?.id] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });

          if (payload.eventType === "INSERT") {
            toast({ title: `Order #${next?.id} created`, description: "Your order is now visible in My Orders." });
            return;
          }

          if (payload.eventType === "UPDATE" && nextStatus && nextStatus !== previousStatus) {
            toast({
              title: `Order #${next?.id} updated`,
              description: `Status changed to ${String(nextStatus).replace(/_/g, " ")}.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [isSignedIn, user?.id, toast]);

  return null;
}
