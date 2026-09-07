"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Exam, ExamItem } from "@/lib/types";
import { countEnglishWords } from "@/lib/answers";
import { pushHistory } from "@/lib/storage";
import { Badge, Card, SourceBadge } from "./ui";
import Footer from "./Footer";

function formatTime(sec: number): string { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }

export default function ExamResult({ exam, title, answers, times, onRetry, onRegenerate }: {
  exam: Exam; title: string; answers: Record<number, string>; times: Record<number, number>;
  onRetry: () => void; onRegenerate?: () => void;
}) {
  const answeredCount = exam.items.filter((it) => (answers[it.slot] ?? "").trim().length > 0).length;
  const totalWords = exam.items.reduce((sum, it) => sum + countEnglishWords(answers[it.slot] ?? ""), 0);
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    pushHistory({ id: exam.id, finishedAt: Date.now(), mode: exam.mode, label: title, answered: answeredCount, totalItems: exam.items.length });
  }, [exam.id, exam.mode, exam.items.length, title, answeredCount]);
  const totalTime = exam.items.reduce((sum, it) => sum + (times[it.slot] ?? 0), 0);

  return <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
    <Link href="/" className="text-sm text-fg-muted transition hover:text-fg">← 홈</Link>
    <Card className="animate-fade-up mt-5 p-6 sm:p-8">
      <Badge tone="accent">{title}</Badge>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">연습 결과</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">문항별 질문과 내가 쓴 답변을 확인하고 소리 내어 다시 말해 보세요.</p>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
        <div><dt className="text-xs text-fg-muted">작성한 문항</dt><dd className="mt-1 text-lg font-medium tabular-nums">{answeredCount}/{exam.items.length}</dd></div>
        <div><dt className="text-xs text-fg-muted">영어 단어 수</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalWords}</dd></div>
        <div><dt className="text-xs text-fg-muted">걸린 시간</dt><dd className="mt-1 text-lg font-medium tabular-nums">{formatTime(totalTime)}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={onRetry} className="rounded-xl border border-line px-4 py-2.5 text-sm text-fg-muted">같은 문제 다시 풀기</button>{onRegenerate && <button type="button" onClick={onRegenerate} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover">문제 다시 뽑기</button>}</div>
    </Card>
    <h2 className="mt-10 text-sm font-semibold tracking-widest text-fg-muted">문항별 답변 다시 보기</h2>
    <div className="mt-4 space-y-4">{exam.items.map((item) => <ItemResult key={item.slot} item={item} answer={answers[item.slot] ?? ""} elapsed={times[item.slot] ?? 0} />)}</div>
    <Footer />
  </main>;
}

function ItemResult({ item, answer, elapsed }: { item: ExamItem; answer: string; elapsed: number }) {
  const [open, setOpen] = useState(false);
  const hasAnswer = answer.trim().length > 0;
  return <Card className="overflow-hidden">
    <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-surface-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-3 text-sm font-semibold text-fg-muted">{item.slot}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-fg">{item.typeLabel}</span><span className="block truncate text-xs text-fg-subtle">{item.emoji} {item.topicKo}</span></span>
      <span className="shrink-0 text-xs text-fg-muted">{hasAnswer ? "작성 완료" : "작성 안 함"}</span>
      <span className="shrink-0 text-fg-subtle">{open ? "▲" : "▼"}</span>
    </button>
    {open && <div className="border-t border-line px-5 py-5">
      <SourceBadge source={item.question.source} />
      <p className="mt-3 text-sm leading-relaxed text-fg">{item.question.en}</p>
      <p className="mt-2 text-xs leading-relaxed text-fg-subtle">{item.question.ko}</p>
      {hasAnswer ? <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3"><p className="text-[11px] tracking-widest text-fg-subtle">내 답변 · {countEnglishWords(answer)}단어 · {formatTime(elapsed)}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{answer}</p></div> : <p className="mt-4 text-sm text-fg-subtle">아직 답변을 작성하지 않았습니다.</p>}
    </div>}
  </Card>;
}
