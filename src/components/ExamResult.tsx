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
    pushHistory({ id: exam.id, finishedAt: Date.now(), mode: exam.mode, label: title,
      answered: answeredCount, totalItems: exam.items.length });
  }, [exam.id, exam.mode, exam.items.length, title, answeredCount]);
  const totalTime = exam.items.reduce((sum, it) => sum + (times[it.slot] ?? 0), 0);
  return <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
    <Link href="/" className="text-sm text-ink-400 transition hover:text-ink-100">← 홈</Link>
    <Card className="animate-fade-up mt-5 p-6 sm:p-8">
      <Badge tone="accent">{title}</Badge>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">답변 돌아보기</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">문항별로 작성한 답변을 확인하고 다시 연습해 보세요.</p>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-800 pt-5 text-center">
        <div><dt className="text-xs text-ink-400">작성한 문항</dt><dd className="mt-1 text-lg font-medium tabular-nums">{answeredCount}/{exam.items.length}</dd></div>
        <div><dt className="text-xs text-ink-400">총 영어 단어 수</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalWords}</dd></div>
        <div><dt className="text-xs text-ink-400">총 소요 시간</dt><dd className="mt-1 text-lg font-medium tabular-nums">{formatTime(totalTime)}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={onRetry} className="rounded-xl border border-ink-700 px-4 py-2.5 text-sm text-ink-300">같은 시험지 다시 풀기</button>{onRegenerate && <button type="button" onClick={onRegenerate} className="rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white">새 시험지 뽑기</button>}</div>
    </Card>
    <h2 className="mt-10 text-sm font-semibold tracking-widest text-ink-400">문항별 답변·교재 출처</h2>
    <div className="mt-4 space-y-4">{exam.items.map((item) => <ItemResult key={item.slot} item={item} answer={answers[item.slot] ?? ""} elapsed={times[item.slot] ?? 0} />)}</div>
    <Footer />
  </main>;
}
function ItemResult({ item, answer, elapsed }: { item: ExamItem; answer: string; elapsed: number }) {
  const [open, setOpen] = useState(false);
  const hasAnswer = answer.trim().length > 0;
  return <Card className="overflow-hidden">
    <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-ink-850/60">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-800 text-sm font-semibold text-ink-300">{item.slot}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink-200">{item.typeLabel}</span><span className="block truncate text-xs text-ink-500">{item.emoji} {item.topicKo}</span></span>
      <span className="shrink-0 text-xs text-ink-400">{hasAnswer ? "작성함" : "미작성"}</span>
      <span className="shrink-0 text-ink-500">{open ? "▲" : "▼"}</span>
    </button>
    {open && <div className="border-t border-ink-800 px-5 py-5">
      <SourceBadge source={item.question.source} sourceRef={item.question.sourceRef} />
      {item.setSource && <p className="mt-2 text-xs text-ink-400">SET 표: p.{item.setSource.page} {item.setSource.label} · 세트 내 {item.setPosition}번째 질문</p>}
      <p className="mt-3 text-sm leading-relaxed text-ink-200">{item.question.en}</p><p className="mt-2 text-xs leading-relaxed text-ink-500">{item.question.ko}</p>
      {hasAnswer ? <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950/60 px-4 py-3"><p className="text-[11px] tracking-widest text-ink-500">내 답변 · 영어 {countEnglishWords(answer)}단어 · {formatTime(elapsed)}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-300">{answer}</p></div> : <p className="mt-4 text-sm text-ink-500">작성한 답변이 없습니다.</p>}
    </div>}
  </Card>;
}
