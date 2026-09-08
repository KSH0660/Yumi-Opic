"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { surveyTopics } from "@/data";
import { selectPracticeQuestions, TYPE_LABELS } from "@/lib/exam";
import { topicPracticeCounts } from "@/lib/history";
import Footer from "./Footer";
import { HistoryList, usePracticeHistory } from "./PracticeHistory";
import ThemeToggle from "./ThemeToggle";
import { Badge, Card, SourceBadge } from "./ui";

export default function TopicsView() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { history, error, remove, removeAll, removeSelected } = usePracticeHistory();
  const entries = useMemo(() => history.filter((entry) => entry.mode === "practice" || entry.mode === "single"), [history]);
  const counts = useMemo(() => topicPracticeCounts(history, surveyTopics), [history]);

  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-sm text-fg-muted transition-colors hover:text-fg">← 홈</Link>
      <ThemeToggle />
    </div>
    <header className="mt-5">
      <Badge tone="accent">실제 시험 번호로 연습</Badge>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">주제별 연습</h1>
        <Link href="/exam?mode=single" className="text-xs text-primary-ink">1문제 연습 →</Link>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">선택한 주제의 문제를 2~15번에 실제 시험 유형대로 배정합니다. 같은 유형의 문제는 무작위로 고르며 중복될 수 있습니다. 기출 복원 문항을 우선하고, 없는 유형은 출제 유형 기반 문항으로 채웁니다. 원하는 문제만 답변하고, 나머지는 다음 버튼으로 건너뛰세요.</p>
    </header>

    <div className="mt-9 grid gap-3 sm:grid-cols-2">{surveyTopics.map((topic) => {
      const open = openId === topic.id;
      const count = counts[topic.id] ?? 0;
      const questions = selectPracticeQuestions(topic, () => 0);
      return <Card key={topic.id} className="overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : topic.id)} className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-medium">{topic.emoji} {topic.ko}{count > 0 && <span className="ml-2 text-xs font-normal text-primary-ink">{count}회 연습</span>}</span>
            <span className="mt-1 block text-xs text-fg-subtle">{topic.en} · 2~15번 14문항 · {open ? "접기" : "유형별 예시 보기"}</span>
          </button>
          <Link className="rounded-lg bg-primary-tint px-3 py-2 text-xs font-medium text-primary-ink" href={`/exam?mode=practice&topic=${encodeURIComponent(topic.id)}`}>연습하기 →</Link>
        </div>
        {open && <div className="divide-y divide-line border-t border-line">{questions.map((q) => <div key={q.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-primary-ink">{TYPE_LABELS[q.type]}</span><SourceBadge source={q.source} /></div>
          <p className="mt-2 text-sm leading-relaxed text-fg">{q.en}</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-subtle">{q.ko}</p>
        </div>)}</div>}
      </Card>;
    })}</div>

    <HistoryList title="연습 기록" entries={entries} error={error} onRemove={remove} onRemoveAll={removeAll} onRemoveSelected={removeSelected} />
    <Footer />
  </main>;
}
