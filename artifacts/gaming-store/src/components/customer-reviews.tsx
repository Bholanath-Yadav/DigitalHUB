import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Star, Send, MessageSquareQuote, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useGetMyProfile, useCreateReview, useListApprovedReviews } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

function renderStars(value: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <Star key={index} className={`h-3.5 w-3.5 ${index < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`} />
  ));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function CustomerReviewsPanel() {
  const { isSignedIn } = useAuth();
  const { data: profile } = useGetMyProfile({
    query: { queryKey: ["my-profile"], retry: false, enabled: isSignedIn },
  });
  const { data: reviews = [], isLoading } = useListApprovedReviews({
    query: { queryKey: ["reviews", "approved"], staleTime: 2 * 60 * 1000 },
  });
  const createReview = useCreateReview();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setGuestName((current) => current || profile?.name || "");
    setGuestEmail((current) => current || profile?.email || "");
  }, [profile?.email, profile?.name]);

  const featuredReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !content.trim()) {
      toast({ title: "Complete the form", description: "Name, email, and review message are required.", variant: "destructive" });
      return;
    }

    createReview.mutate(
      { data: { guestName: guestName.trim(), guestEmail: guestEmail.trim(), rating, content: content.trim() } },
      {
        onSuccess: () => {
          toast({ title: "Review submitted", description: "Thanks. It will appear after admin approval." });
          setRating(5);
          setContent("");
          queryClient.invalidateQueries({ queryKey: ["reviews", "approved"] });
        },
        onError: () => toast({ title: "Submission failed", variant: "destructive" }),
      }
    );
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-background/80 backdrop-blur-sm p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.24em]">
            <MessageSquareQuote className="h-4 w-4" /> Customer Reviews
          </div>
          <div className="max-w-xl">
            <h3 className="text-lg md:text-xl font-black tracking-tight">Verified reviews from real players</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Submissions appear here only after moderation, so the footer stays clean and trustworthy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {isLoading && featuredReviews.length === 0 ? (
              <div className="sm:col-span-3 rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                Loading reviews...
              </div>
            ) : featuredReviews.length > 0 ? (
              featuredReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_34px_-28px_rgba(14,165,233,0.55)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(review.guestName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{review.guestName}</p>
                      <p className="truncate text-xs text-muted-foreground">{review.guestEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">{renderStars(review.rating)}</div>
                  <p className="mt-3 text-sm leading-6 text-foreground/85 line-clamp-4">{review.content}</p>
                </article>
              ))
            ) : (
              <div className="sm:col-span-3 rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium">No approved reviews yet</p>
                <p className="text-xs text-muted-foreground">Be the first to leave feedback after your next order.</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-card/70 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Leave a review</h4>
              <p className="text-xs text-muted-foreground">Submitted reviews are verified before they go live.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="review-name">Name</Label>
              <Input id="review-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="review-email">Email</Label>
              <Input id="review-email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Rating</Label>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 py-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index + 1)}
                    className="rounded-full p-0.5 transition-transform hover:scale-110"
                    aria-label={`${index + 1} star${index === 0 ? "" : "s"}`}
                  >
                    <Star className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`} />
                  </button>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">{rating} / 5</span>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="review-content">Review</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell other players what you liked about the service..."
                className="min-h-24 resize-none"
              />
            </div>
          </div>

          <Button type="submit" className="mt-4 w-full gap-2" disabled={createReview.isPending}>
            {createReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for review
          </Button>
        </form>
      </div>
    </section>
  );
}