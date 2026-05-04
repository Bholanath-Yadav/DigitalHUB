import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   DH Monogram — letter shapes via SVG text + clipPath
   so D and H always render as perfect, crisp letterforms.
   D: bold cyan-to-blue gradient
   H: vivid cyan-violet-orange rainbow gradient
   + shimmer sweep + rotating glow ring
   ───────────────────────────────────────────────────────────── */
export function LogoMark({ size = 36 }: { size?: number }) {
  /* unique prefix so multiple instances don't clash */
  const p = "dh";

  return (
    <motion.div
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      {/* Rotating conic glow ring */}
      <motion.div
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "22%",
          background:
            "conic-gradient(from 0deg, transparent 50%, rgba(56,189,248,0.6) 68%, rgba(168,85,247,0.55) 82%, rgba(249,115,22,0.45) 92%, transparent 100%)",
          zIndex: 0,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 56 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", position: "relative", zIndex: 1 }}
      >
        <defs>
          {/* ── Gradients ── */}
          <linearGradient id={`${p}-dg`} x1="0" y1="0" x2="28" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#7dd3fc" /> {/* sky-300 */}
            <stop offset="55%"  stopColor="#38bdf8" /> {/* sky-400 */}
            <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
          </linearGradient>

          <linearGradient id={`${p}-hg`} x1="26" y1="0" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#22d3ee" /> {/* cyan-400 */}
            <stop offset="38%"  stopColor="#a855f7" /> {/* purple-500 */}
            <stop offset="70%"  stopColor="#ec4899" /> {/* pink-500 */}
            <stop offset="100%" stopColor="#fb923c" /> {/* orange-400 */}
          </linearGradient>

          {/* Shimmer strip */}
          <linearGradient id={`${p}-sh`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="50%"  stopColor="white" stopOpacity="0.32" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${p}-glow`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── ClipPaths using real letter shapes ── */}
          {/* D: font-size 40, x=1, baseline at y=41 */}
          <clipPath id={`${p}-dc`}>
            <text
              fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', Arial, sans-serif"
              fontWeight="900"
              fontSize="41"
              x="1" y="42"
              letterSpacing="-1"
            >D</text>
          </clipPath>

          {/* H: font-size 40, x=27, baseline at y=41 */}
          <clipPath id={`${p}-hc`}>
            <text
              fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', Arial, sans-serif"
              fontWeight="900"
              fontSize="41"
              x="27" y="42"
              letterSpacing="-1"
            >H</text>
          </clipPath>

          {/* Combined DH clip for shimmer */}
          <clipPath id={`${p}-all`}>
            <text
              fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', Arial, sans-serif"
              fontWeight="900"
              fontSize="41"
              x="1" y="42"
              letterSpacing="-2"
            >DH</text>
          </clipPath>
        </defs>

        {/* Background pill */}
        <rect width="56" height="48" rx="10" fill="#0a0f1e" />
        <rect width="56" height="48" rx="10" fill="url(#bg-shine)" opacity="0.07" />

        {/* ── D letter with cyan-blue gradient ── */}
        <rect
          x="0" y="0" width="56" height="48"
          fill={`url(#${p}-dg)`}
          clipPath={`url(#${p}-dc)`}
          filter={`url(#${p}-glow)`}
        />

        {/* ── H letter with rainbow gradient ── */}
        <rect
          x="0" y="0" width="56" height="48"
          fill={`url(#${p}-hg)`}
          clipPath={`url(#${p}-hc)`}
          filter={`url(#${p}-glow)`}
        />

        {/* ── Shimmer sweep ── */}
        <motion.rect
          x="0" y="0" width="20" height="48"
          fill={`url(#${p}-sh)`}
          clipPath={`url(#${p}-all)`}
          animate={{ x: [-22, 70] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Subtle inner border */}
        <rect x="0.5" y="0.5" width="55" height="47" rx="9.5"
          stroke="white" strokeWidth="0.7" strokeOpacity="0.08" fill="none" />
      </svg>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   LogoText — "Digital HUB"
   Each letter of HUB has its own vivid color so
   it reads clearly on both light and dark backgrounds.
   ───────────────────────────────────────────── */
export function LogoText({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const digital = { sm: "text-[14px]", md: "text-[16px]", lg: "text-[18px]" }[size];
  const hub     = { sm: "text-[15px]", md: "text-[18px]", lg: "text-[21px]" }[size];
  return (
    <span className="flex items-baseline gap-[3px] select-none leading-none">
      <span className={`font-semibold tracking-wide ${digital} text-foreground/80`}>
        Digital
      </span>
      <span className={`font-black tracking-tight ${hub} flex items-baseline`} style={{ lineHeight: 1 }}>
        <span style={{ color: "#0ea5e9" }}>H</span>
        <span style={{ color: "#a855f7" }}>U</span>
        <span style={{ color: "#f97316" }}>B</span>
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Full Logo
   ───────────────────────────────────────────── */
export function Logo({
  size = "md",
  href = "/",
  showText = true,
  markSize,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
  markSize?: number;
}) {
  const ms = markSize ?? (size === "sm" ? 30 : size === "lg" ? 44 : 36);
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0 select-none">
      <LogoMark size={ms} />
      {showText && <LogoText size={size} />}
    </Link>
  );
}
