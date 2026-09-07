import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "warn";
}) {
  const tones = {
    default: "bg-ink-800 text-ink-300 ring-ink-700",
    accent: "bg-accent-600/15 text-accent-400 ring-accent-600/30",
    success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
    warn: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-700/70 bg-ink-900/70 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "accent",
}: {
  value: number;
  max: number;
  tone?: "accent" | "score";
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const color =
    tone === "score"
      ? pct >= 75
        ? "bg-emerald-400"
        : pct >= 50
          ? "bg-amber-400"
          : "bg-rose-400"
      : "bg-accent-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 75 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#fb7185";
  return (
    <div
      className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, var(--color-ink-800) 0deg)`,
      }}
    >
      <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-ink-900">
        <span className="text-2xl font-semibold tabular-nums">{score}</span>
      </div>
    </div>
  );
}

/**
 * 문항 출처 표시.
 * OPIc 공식 문제은행은 공개되지 않으므로 "기출 복원"도 응시 후기를 모은
 * 복원본이라는 점을 문구에 그대로 드러낸다.
 */
export function SourceBadge({ source }: { source?: "verified" | "adapted" }) {
  const verified = source === "verified";
  return (
    <span
      title={
        verified
          ? "응시자들이 복원해 공개한 실제 출제 문항입니다. OPIc 공식 문제은행은 비공개라 이것도 복원본이며 원문과 다를 수 있습니다."
          : "실제 출제 문항이 아니라, OPIc 형식을 따라 만든 연습 문항입니다."
      }
      className={`inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        verified
          ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25"
          : "bg-ink-800 text-ink-400 ring-ink-700"
      }`}
    >
      {verified ? "기출 복원" : "형식 기반"}
    </span>
  );
}
