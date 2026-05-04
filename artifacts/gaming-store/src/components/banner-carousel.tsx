import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

type BannerItem = {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
};

const INTERVAL = 1500;

const FALLBACK_GRADIENTS = [
  { from: "#0c1a3a", via: "#0f2952", to: "#0a1628", accent: "#00c4ff" },
  { from: "#1a0c3a", via: "#2d0f5c", to: "#120a28", accent: "#a855f7" },
  { from: "#3a0c1a", via: "#5c0f2a", to: "#280a12", accent: "#f43f5e" },
  { from: "#1a2a0c", via: "#2a4a0f", to: "#0f1a08", accent: "#22c55e" },
];

function getBadge(title: string, idx: number): string {
  const t = title.toLowerCase();
  if (t.includes("sale") || t.includes("off") || t.includes("discount")) return "MEGA SALE";
  if (t.includes("new") || t.includes("launch")) return "NEW ARRIVAL";
  if (t.includes("free") || t.includes("gift")) return "FREE OFFER";
  if (t.includes("hot") || t.includes("popular") || t.includes("trending")) return "TRENDING";
  if (t.includes("limited") || t.includes("exclusive")) return "EXCLUSIVE";
  const defaults = ["HOT DEAL", "LIMITED TIME", "EXCLUSIVE", "MUST BUY"];
  return defaults[idx % defaults.length];
}

function FadeUp({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ArtFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, x: 28 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.52, delay: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [, setLocation] = useLocation();

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setActive(idx);
  }, []);

  const next = useCallback(
    () => goTo((active + 1) % banners.length, 1),
    [active, banners.length, goTo]
  );
  const prev = useCallback(
    () => goTo((active - 1 + banners.length) % banners.length, -1),
    [active, banners.length, goTo]
  );

  useEffect(() => {
    if (paused || banners.length < 2) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [paused, next, banners.length]);

  const handleClick = (linkUrl?: string | null) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    } else {
      setLocation(linkUrl);
    }
  };

  if (!banners.length) return null;

  const banner = banners[active];
  const g = FALLBACK_GRADIENTS[active % FALLBACK_GRADIENTS.length];
  const badge = getBadge(banner.title, active);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10"
      style={{ height: "clamp(200px, 28vw, 420px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ───────────────────────────────────── */}
      <AnimatePresence custom={direction} mode="wait" initial={false}>
        <motion.div
          key={active}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.46, ease: "easeInOut" }}
          className={`absolute inset-0 ${banner.linkUrl ? "cursor-pointer" : ""}`}
          onClick={() => handleClick(banner.linkUrl)}
        >
          {/* ── Backgrounds ───────────────────────────── */}
          {/* Base colour gradient */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${g.from} 0%, ${g.via} 50%, ${g.to} 100%)` }}
          />

          {/* Full bleed image (desaturated/dimmed) */}
          {banner.imageUrl && (
            <img
              src={banner.imageUrl} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.28, mixBlendMode: "luminosity" }}
            />
          )}

          {/* Sharp right-side image panel */}
          {banner.imageUrl && (
            <div
              className="absolute right-0 top-0 bottom-0 w-[52%] hidden sm:block"
              style={{ maskImage: "linear-gradient(to left, black 50%, transparent 100%)" }}
            >
              <img
                src={banner.imageUrl} alt=""
                className="w-full h-full object-cover object-center"
                style={{ opacity: 0.75 }}
              />
            </div>
          )}

          {/* Left dark overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.04) 100%)"
          }} />
          {/* Bottom vignette */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)"
          }} />

          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none">
            <defs>
              <pattern id={`g${active}`} width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#g${active})`} />
          </svg>

          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(to right, ${g.accent}, ${g.accent}44 60%, transparent)` }} />

          {/* Left glow orb */}
          <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: g.accent }} />

          {/* ── Left content panel ──────────────────── */}
          <div className="relative z-10 flex items-center h-full px-6 md:px-10 lg:px-14">
            <div className="flex-1 max-w-[60%] min-w-0 space-y-2.5 md:space-y-3.5">

              {/* Badge */}
              <FadeUp delay={0}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] border select-none"
                  style={{ background: `${g.accent}1a`, borderColor: `${g.accent}44`, color: g.accent }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: g.accent }} />
                  {badge}
                </span>
              </FadeUp>

              {/* Headline */}
              <FadeUp delay={0.07}>
                <h2
                  className="font-black text-white leading-[1.06] tracking-tight"
                  style={{
                    fontSize: "clamp(1.2rem, 3.4vw, 2.6rem)",
                    textShadow: `0 2px 30px ${g.accent}33, 0 0 80px ${g.accent}18`,
                  }}
                >
                  {banner.title}
                </h2>
              </FadeUp>

              {/* Subtitle */}
              {banner.subtitle && (
                <FadeUp delay={0.14}>
                  <p
                    className="text-white/65 leading-relaxed"
                    style={{ fontSize: "clamp(0.72rem, 1.5vw, 0.97rem)" }}
                  >
                    {banner.subtitle}
                  </p>
                </FadeUp>
              )}

              {/* CTA */}
              {banner.linkUrl && (
                <FadeUp delay={0.22}>
                  <button
                    onClick={e => { e.stopPropagation(); handleClick(banner.linkUrl); }}
                    className="inline-flex items-center gap-2 font-bold rounded-xl border-0 transition-all duration-200 hover:scale-[1.05] hover:brightness-110 active:scale-95 shadow-lg mt-1 select-none"
                    style={{
                      background: `linear-gradient(135deg, ${g.accent}ee, ${g.accent}aa)`,
                      color: "#000c",
                      padding: "clamp(7px, 1.1vw, 13px) clamp(16px, 2.4vw, 30px)",
                      fontSize: "clamp(0.7rem, 1.3vw, 0.875rem)",
                      boxShadow: `0 6px 28px ${g.accent}44`,
                    }}
                  >
                    Shop Now
                    {banner.linkUrl.startsWith("http") ? (
                      <ExternalLink style={{ width: "clamp(10px, 1.1vw, 13px)", height: "clamp(10px, 1.1vw, 13px)" }} />
                    ) : (
                      <ChevronRight style={{ width: "clamp(11px, 1.2vw, 15px)", height: "clamp(11px, 1.2vw, 15px)" }} />
                    )}
                  </button>
                </FadeUp>
              )}
            </div>

            {/* ── Right artwork ──────────────────────── */}
            {banner.imageUrl && (
              <div className="absolute right-0 top-0 bottom-0 w-[44%] pointer-events-none hidden md:flex items-center justify-end pr-8 lg:pr-14">
                <ArtFrame>
                  <div
                    className="relative"
                    style={{ width: "clamp(140px, 20vw, 290px)", height: "clamp(140px, 20vw, 290px)" }}
                  >
                    {/* Glow behind */}
                    <div
                      className="absolute -inset-4 rounded-2xl opacity-35 blur-2xl"
                      style={{ background: g.accent }}
                    />
                    {/* Image frame */}
                    <div
                      className="relative w-full h-full rounded-2xl overflow-hidden"
                      style={{ border: `1.5px solid ${g.accent}44`, boxShadow: `0 0 0 1px ${g.accent}18 inset` }}
                    >
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      {/* Tint overlay */}
                      <div className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, transparent 55%, ${g.accent}18 100%)` }} />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6" style={{
                      borderTop: `2px solid ${g.accent}`, borderRight: `2px solid ${g.accent}`,
                      borderRadius: "0 8px 0 0",
                    }} />
                    <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6" style={{
                      borderBottom: `2px solid ${g.accent}`, borderLeft: `2px solid ${g.accent}`,
                      borderRadius: "0 0 0 8px",
                    }} />
                  </div>
                </ArtFrame>
              </div>
            )}

            {/* No-image decorative spinner */}
            {!banner.imageUrl && (
              <div className="absolute right-8 md:right-14 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block opacity-20">
                <div
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full border-2"
                  style={{ borderColor: `${g.accent}60`, borderStyle: "dashed", animation: "spin 24s linear infinite" }}
                />
                <div className="absolute inset-6 rounded-full border" style={{ borderColor: `${g.accent}40` }} />
                <div className="absolute inset-14 rounded-full"
                  style={{ background: `radial-gradient(circle, ${g.accent}50, transparent)` }} />
              </div>
            )}
          </div>

          {/* Bottom gradient for control area readability */}
          <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20 bg-white/10">
        {!paused && (
          <div
            key={`pb-${active}`}
            className="h-full rounded-full"
            style={{
              background: g.accent,
              animation: `ad-progress ${INTERVAL}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* ── Controls ──────────────────────────────────── */}
      <div className="absolute bottom-3.5 left-4 md:left-6 right-4 md:right-6 z-20 flex items-center justify-between">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {banners.length > 1 && banners.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); goTo(i, i > active ? 1 : -1); }}
              className="rounded-full transition-all duration-300 flex-shrink-0"
              style={{
                width: i === active ? 22 : 6,
                height: 6,
                background: i === active ? g.accent : "rgba(255,255,255,0.30)",
                boxShadow: i === active ? `0 0 8px ${g.accent}` : "none",
              }}
            />
          ))}
          {banners.length > 1 && (
            <span className="text-[10px] text-white/40 font-mono ml-0.5 hidden sm:block tabular-nums">
              {active + 1}/{banners.length}
            </span>
          )}
        </div>

        {/* Arrow buttons */}
        {banners.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-white/20 bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 hover:border-white/40 transition-all duration-150 active:scale-90"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-white/20 bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 hover:border-white/40 transition-all duration-150 active:scale-90"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
