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
    provided: "제공 자료",
    textbook: "교재 데이터",
    verified: "기출 복원 기반",
    adapted: "출제 유형 기반",
  };
  const descriptions: Record<QuestionSource, string> = {
    provided: "사용자가 제공한 돌발 주제 자료의 영어 지문과 번호를 그대로 옮긴 연습 문항입니다.",
    textbook: "예전 교재 데이터를 표시하던 값으로, 지금 문제은행에서는 쓰지 않습니다.",
    verified: "공개된 수험자 복원·기출 정리 자료에 반복해서 등장하는 질문을 연습하기 좋게 다듬은 문항입니다. 공식 원문 그대로는 아닙니다.",
    adapted: "이 주제에서 확인되는 복원 문항이 없어, 실제 시험의 출제 유형에 맞춰 새로 만든 연습 문항입니다.",
  };
  return <span title={descriptions[source]} className={`inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${source === "verified" ? "bg-success-tint text-success-ink ring-success-ink/30" : "bg-surface-3 text-fg-muted ring-line-strong/40"}`}>
    {labels[source]}{sourceRef ? ` · p.${sourceRef.page} ${sourceRef.label}` : ""}
  </span>;
}
