import { useMemo, useState } from "react";
import { useListPendingReviews, useModerateReview } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Search, RefreshCcw, MessageSquareQuote, Star } from "lucide-react";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { data: reviews = [], isLoading } = useListPendingReviews({ query: { queryKey: ["admin-reviews"] } });
  const moderateReview = useModerateReview();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((review) => {
      return [review.guestName, review.guestEmail, review.content].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [reviews, search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const handleModerate = (id: number, approved: boolean) => {
    moderateReview.mutate(
      { id, data: { approved, rejected: !approved } },
      {
        onSuccess: () => {
          toast({ title: approved ? "Review approved" : "Review rejected" });
          invalidate();
          queryClient.invalidateQueries({ queryKey: ["reviews", "approved"] });
        },
        onError: () => toast({ title: "Failed to update review", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquareQuote className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Reviews</h2>
            <p className="text-xs text-muted-foreground">{filteredReviews.length} pending reviews</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or content..." className="pl-9" />
          </div>
          <Button variant="outline" onClick={invalidate} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No pending reviews found.</div>
        ) : (
          filteredReviews.map((review) => (
            <article key={review.id} className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {(review.guestName || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">{review.guestName}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Pending</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{review.guestEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} />
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/85">{review.content}</p>
                </div>

                <div className="flex flex-col gap-2 md:w-40 md:shrink-0">
                  <Button
                    className="gap-2"
                    onClick={() => handleModerate(review.id, true)}
                    disabled={moderateReview.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleModerate(review.id, false)}
                    disabled={moderateReview.isPending}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}