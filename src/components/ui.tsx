import type { ReactNode } from "react";
import type { QuestionSource, SourceReference } from "@/lib/types";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "success" | "warn" }) {
  const tones = {
    default: "bg-ink-800 text-ink-300 ring-ink-700",
    accent: "bg-accent-600/15 text-accent-400 ring-accent-600/30",
    success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
    warn: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-ink-700/70 bg-ink-900/70 backdrop-blur-sm ${className}`}>{children}</div>;
}
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-accent-500 transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>;
}
export function SourceBadge({ source = "adapted", sourceRef }: { source?: QuestionSource; sourceRef?: SourceReference }) {
  const labels: Record<QuestionSource, string> = { textbook: "교재 수록", verified: "기존 공개 복원", adapted: "형식 기반" };
  const descriptions: Record<QuestionSource, string> = {
    textbook: "제공된 파고다 교재의 영어 질문입니다. 공식 원본 또는 2026년 최신 기출로 검증한 자료는 아닙니다. 교재 분석 범위: 2020년 7월까지.",
    verified: "기존 은행의 외부 복원 문항입니다. 이번 교재 대조 범위가 아니며 교재 모의고사에서는 제외됩니다.",
    adapted: "자체 제작 또는 재구성한 연습 문항입니다. 교재 원문 모의고사에 섞이지 않습니다.",
  };
  return <span title={descriptions[source]} className={`inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${source === "textbook" ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25" : "bg-ink-800 text-ink-400 ring-ink-700"}`}>
    {labels[source]}{sourceRef ? ` · p.${sourceRef.page} ${sourceRef.label}` : ""}
  </span>;
}
