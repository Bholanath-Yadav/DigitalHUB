// 1 INR ≈ 1.6 NPR  (standard mid-market rate)
const NPR_TO_INR = 1 / 1.6;

export function toINR(npr: number): number {
  return Math.round(npr * NPR_TO_INR);
}

export function fmtNPR(npr: number): string {
  return `NPR ${Math.round(npr).toLocaleString("en-IN")}`;
}

export function fmtINR(inr: number): string {
  return `₹${inr.toLocaleString("en-IN")}`;
}

export function DualPrice({ npr, className = "" }: { npr: number; className?: string }) {
  return null; // Used as data helper only — see PriceTag component
}

export function formatDual(npr: number): { npStr: string; inStr: string } {
  return {
    npStr: fmtNPR(npr),
    inStr: fmtINR(toINR(npr)),
  };
}
