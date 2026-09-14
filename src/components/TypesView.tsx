"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PRACTICE_TYPE_GROUPS,
  defaultTypePracticeDraws,
  isTypePracticeSet,
  typePracticeDrawChoices,
  typePracticeSupply,
  type PracticeTypeGroup,
} from "@/lib/exam";
import { typePracticeCounts } from "@/lib/history";
import { RANDOM_SCOPES, RANDOM_SCOPE_LABELS, typePracticeLink } from "@/lib/nav";
import type { RandomScope } from "@/lib/types";
import Footer from "./Footer";
import { HistoryList, usePracticeHistory } from "./PracticeHistory";
import ThemeToggle from "./ThemeToggle";
import { Badge, Card } from "./ui";

/** 한 번 뽑을 때 나오는 문항 수를 사람이 읽는 말로. 세트는 몇 문항이 딸려 오는지 함께 적는다. */
function drawLabel(group: PracticeTypeGroup, draws: number): string {
  return isTypePracticeSet(group) ? `${draws}세트 · ${draws * group.types.length}문항` : `${draws}문항`;
}

/**
 * 유형별 연습은 약한 유형 하나만 골라 여러 주제로 반복해서 말해 보는 자리다.
 * 주제별 연습이 한 주제의 2~15번을 도는 것과 짝을 이룬다.
 */
export default function TypesView() {
  const [scope, setScope] = useState<RandomScope>("all");
  /** 유형마다 마지막으로 고른 추첨 횟수. 고르지 않은 유형은 기본값을 쓴다. */
  const [draws, setDraws] = useState<Record<string, number>>({});
  const { history, error, remove, removeAll, removeSelected } = usePracticeHistory();
  const entries = useMemo(() => history.filter((entry) => entry.mode === "type"), [history]);
  const counts = useMemo(() => typePracticeCounts(history), [history]);
  const supplies = useMemo(
    () => new Map(PRACTICE_TYPE_GROUPS.map((group) => [group.id, typePracticeSupply(group, scope)])),
    [scope],
  );

  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-sm text-fg-muted transition-colors hover:text-fg">← 홈</Link>
      <ThemeToggle />
    </div>
    <header className="mt-5">
      <Badge tone="accent">문제 유형별 연습</Badge>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">유형별 연습</h1>
        <Link href="/topics" className="text-xs text-primary-ink">주제별 연습 →</Link>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">묘사·경험처럼 유형 하나를 골라 여러 주제에서 이어서 냅니다. 같은 말하기 틀을 주제만 바꿔 가며 반복할 수 있어, 약한 유형만 집중해서 연습할 때 씁니다.</p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">롤플레이(11~13번)와 비교·이슈(14~15번)는 한 주제에서 이어지는 세트로 냅니다. 문항 번호는 실제 시험 번호가 아니라 연습 순서인 1번부터이며, 원하는 문항만 답변하고 나머지는 건너뛰어도 됩니다.</p>
    </header>

    <div role="group" aria-label="연습 범위" className="mt-7 flex flex-wrap gap-2">
      {RANDOM_SCOPES.map((value) => <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${scope === value ? "border-primary/50 bg-primary-tint text-primary-ink" : "border-line text-fg-muted hover:bg-surface-2"}`}>
        {RANDOM_SCOPE_LABELS[value]}
      </button>)}
    </div>
    <p className="mt-3 text-xs leading-relaxed text-fg-muted">범위를 고르면 그 범위의 주제에서만 뽑습니다. 걷기·콘서트·조깅은 모의고사·랜덤 연습과 마찬가지로 빠지며, 주제별 연습에서 풀 수 있습니다.</p>

    <div className="mt-5 grid items-start gap-3 sm:grid-cols-2">{PRACTICE_TYPE_GROUPS.map((group) => {
      const supply = supplies.get(group.id)!;
      const count = counts[group.id] ?? 0;
      // 가진 문항보다 많이 뽑을 수는 없다. 고를 수 있는 값만 남기고, 하나도 없으면 가진 만큼만 둔다.
      const choices = typePracticeDrawChoices(group).filter((value) => value <= supply.draws);
      const options = choices.length ? choices : supply.draws > 0 ? [supply.draws] : [];
      const preferred = draws[group.id] ?? defaultTypePracticeDraws(group);
      const selected = options.includes(preferred) ? preferred : options[options.length - 1];
      const link = selected ? typePracticeLink(group, scope, selected) : undefined;

      return <Card key={group.id} className="p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{group.label}</span>
          <span className="text-xs text-fg-subtle">{group.slots}</span>
          {count > 0 && <span className="text-xs text-primary-ink">{count}회 연습</span>}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-fg-muted">{group.note}</p>
        <p className="mt-2 text-xs leading-relaxed text-fg-subtle">{supply.draws > 0
          ? `${RANDOM_SCOPE_LABELS[scope]} 범위에 ${supply.topics}개 주제 · ${isTypePracticeSet(group) ? `세트 ${supply.draws}개` : `${supply.questions}문항`}`
          : `${RANDOM_SCOPE_LABELS[scope]} 범위에는 이 유형으로 낼 문항이 없습니다. 범위를 바꿔 보세요.`}</p>

        {link && <>
          <div role="group" aria-label={`${group.label} 문항 수`} className="mt-3 flex flex-wrap gap-2">{options.map((value) => (
            <button key={value} type="button" aria-pressed={value === selected} onClick={() => setDraws((current) => ({ ...current, [group.id]: value }))} className={`min-h-11 rounded-lg border px-3 text-xs font-medium transition-colors ${value === selected ? "border-primary/50 bg-primary-tint text-primary-ink" : "border-line text-fg-muted hover:bg-surface-2"}`}>
              {drawLabel(group, value)}
            </button>
          ))}</div>
          <Link aria-label={`${link.label} ${drawLabel(group, selected)}`} href={link.href} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary-tint px-3 py-2 text-xs font-medium text-primary-ink transition-colors hover:bg-surface-3">연습하기 →</Link>
        </>}
      </Card>;
    })}</div>

    <HistoryList title="유형별 연습 기록" entries={entries} error={error} onRemove={remove} onRemoveAll={removeAll} onRemoveSelected={removeSelected} />
    <Footer />
  </main>;
}
