import type { ReactNode } from "react";
import type { QuestionSource, SourceReference } from "@/lib/types";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "success" | "warn" }) {
  const tones = {
    default: "bg-surface-3 text-fg-muted ring-line-strong/40",
    accent: "bg-primary-tint text-primary-ink ring-primary/25",
    success: "bg-success-tint text-success-ink ring-success-ink/30",
    warn: "bg-warn-tint text-warn-ink ring-warn-ink/30",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}>{children}</div>;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>;
}

export function SourceBadge({ source = "adapted", sourceRef }: { source?: QuestionSource; sourceRef?: SourceReference }) {
  const labels: Record<QuestionSource, string> = {
    textbook: "이전 교재 데이터",
    verified: "공개 복원 기반",
    adapted: "출제형식 기반",
  };
  const descriptions: Record<QuestionSource, string> = {
    textbook: "이전 버전의 교재 데이터 표시용 값입니다. 현재 활성 서베이 은행에서는 사용하지 않습니다.",
    verified: "공개된 수험자 복원·기출 정리 자료에서 반복 확인되는 질문 문형을 연습하기 쉽게 다듬었습니다. 공식 원문 인증을 뜻하지 않습니다.",
    adapted: "해당 토픽에서 직접 확인되는 복원이 부족해 실제 OPIc의 비교·이슈·경험 형식에 맞춰 만든 연습 문항입니다.",
  };
  return <span title={descriptions[source]} className={`inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${source === "verified" ? "bg-success-tint text-success-ink ring-success-ink/30" : "bg-surface-3 text-fg-muted ring-line-strong/40"}`}>
    {labels[source]}{sourceRef ? ` · p.${sourceRef.page} ${sourceRef.label}` : ""}
  </span>;
}
