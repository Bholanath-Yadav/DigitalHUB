import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";
import { Zap, ShieldCheck, Star, Trophy, Users, Ticket, Loader2, Eye, EyeOff } from "lucide-react";
import { LogoMark, LogoText } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SIGN_IN_FEATURES = [
  { icon: Zap,         label: "Instant delivery",  desc: "Get your top-ups in seconds" },
  { icon: ShieldCheck, label: "100% Secure",        desc: "eSewa, Khalti & IME Pay accepted" },
  { icon: Star,        label: "Best prices",        desc: "Lowest rates in Nepal, guaranteed" },
];

const SIGN_UP_PERKS = [
  { icon: Trophy, label: "Exclusive deals", desc: "Members-only discounts every week" },
  { icon: Ticket, label: "Coupon codes",    desc: "Save more with special promo codes" },
  { icon: Users,  label: "Community",       desc: "Join 10,000+ Nepali gamers" },
];

const ORBS = [
  { size: 360, top: "-8%",  left: "-10%", color: "rgba(0,212,255,0.18)",   dur: 14 },
  { size: 280, top: "55%",  left: "70%",  color: "rgba(139,92,246,0.20)",  dur: 18 },
  { size: 220, top: "75%",  left: "5%",   color: "rgba(244,63,94,0.14)",   dur: 12 },
  { size: 200, top: "20%",  left: "55%",  color: "rgba(16,185,129,0.13)",  dur: 16 },
];

export default function SignInPage() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (isSignedIn) setLocation("/");
  }, [isSignedIn, setLocation]);

  const isSignIn = tab === "sign-in";
  const features = isSignIn ? SIGN_IN_FEATURES : SIGN_UP_PERKS;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Welcome back!" });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message ?? "Invalid email or password.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name || email.split("@")[0] } },
      });
      if (error) throw error;
      if (data.session) {
        const { error: profileError } = await supabase.from("users").upsert({
          supabase_id: data.session.user.id,
          email,
          name: name || email.split("@")[0],
          role: "user",
          is_banned: false,
        }, { onConflict: "supabase_id" });
        if (profileError) throw profileError;

        toast({ title: "Account created!", description: "Welcome to Digital HUB Nepal." });
        setLocation("/");
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link. Click it to activate your account." });
        setTab("sign-in");
      }
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email first", description: "We'll send you a reset link.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sign-in`,
      });
      if (error) throw error;
      toast({ title: "Reset link sent", description: "Check your email for the password reset link." });
    } catch (err: any) {
      toast({ title: "Failed to send reset link", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-[100dvh] flex overflow-hidden">

      {/* ── Full-page gaming background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/gaming-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* ── Animated floating orbs ── */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none blur-3xl z-0"
          style={{
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            background: orb.color,
            animation: `orb-float-${i % 2 === 0 ? "a" : "b"} ${orb.dur}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Subtle grid overlay ── */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative z-10 flex-col px-12 py-10">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <LogoMark size={38} />
          <LogoText size="lg" />
        </Link>

        <div className="flex-1 flex flex-col justify-center mt-8">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit
            bg-white/10 border border-white/20 text-cyan-300 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {isSignIn ? "Nepal's #1 Gaming Store" : "Free to join, forever"}
          </div>

          <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-4 text-white select-none">
            {isSignIn ? (
              <>Level Up<br />
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Your Game
                </span>
              </>
            ) : (
              <>Join the<br />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Gaming Arena
                </span>
              </>
            )}
          </h1>

          <p className="text-base xl:text-lg mb-10 leading-relaxed max-w-sm text-white/60">
            {isSignIn
              ? "Instant top-ups for Free Fire, PUBG, TikTok & more — delivered in seconds."
              : "Create your free account and start topping up your favourite games at the best prices in Nepal."}
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  bg-white/10 border border-white/15 backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!isSignIn && (
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#22d3ee","#a78bfa","#34d399","#fb923c"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-black/40 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: c }}>
                    {["A","B","C","D"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/50">
                <span className="font-semibold text-white">10,000+</span> gamers already joined
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-white/30">© 2026 Digital HUB Nepal. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-6 sm:px-8">

        {/* Mobile logo */}
        <div className="lg:hidden mb-6 self-start ml-2">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={32} />
            <LogoText size="sm" />
          </Link>
        </div>

        {/* Glass card */}
        <div className="w-full max-w-[min(420px,100%)] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl p-5 sm:p-8 mx-auto">

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 gap-1 mb-6 bg-black/20 border border-white/10 overflow-hidden">
            {(["sign-in", "sign-up"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={tab === t
                  ? { background: "rgba(255,255,255,0.15)", color: "hsl(190,100%,70%)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.45)" }
                }
              >
                {t === "sign-in" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-black text-white mb-1">
              {isSignIn ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-white/50">
              {isSignIn ? "Sign in to your Digital HUB account" : "Join Digital HUB Nepal for free"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
            {!isSignIn && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-white/80 text-sm">Full Name</Label>
                <Input
                  id="name" type="text" placeholder="Aarav Sharma"
                  value={name} onChange={e => setName(e.target.value)}
                  disabled={loading} autoComplete="name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400/60 focus:bg-white/15 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/80 text-sm">Email address</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required disabled={loading} autoComplete="email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400/60 focus:bg-white/15 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                {isSignIn && (
                  <button type="button" onClick={handleForgotPassword} disabled={loading}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password" type={showPass ? "text" : "password"}
                  placeholder={isSignIn ? "Your password" : "Min. 8 characters"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={isSignIn ? 1 : 8} disabled={loading}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400/60 focus:bg-white/15 transition-colors pr-10"
                />
                <button
                  type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-white border-none shadow-lg bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 hover:opacity-100 transition-all duration-200"
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isSignIn ? "Signing in…" : "Creating account…"}</>
                : (isSignIn ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <p className="text-center text-sm text-white/50 mt-4">
            {isSignIn ? (
              <>Don't have an account?{" "}
                <button onClick={() => setTab("sign-up")} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">Sign up free</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("sign-in")} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">Sign in</button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-white/30 mt-3">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white/50 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/refund-policy" className="underline hover:text-white/50 transition-colors">Refund Policy</Link>.
          </p>
        </div>
      </div>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes orb-float-a {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(24px,-18px) scale(1.07); }
          66%      { transform: translate(-16px,22px) scale(0.94); }
        }
        @keyframes orb-float-b {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-20px,16px) scale(1.05); }
          70%      { transform: translate(18px,-24px) scale(0.96); }
        }
      `}</style>
    </div>
  );
}
