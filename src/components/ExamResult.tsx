"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Exam, ScoreResult } from "@/lib/types";
import { summarizeExam } from "@/lib/scoring";
import { pushHistory } from "@/lib/storage";
import { Badge, Card, ProgressBar, ScoreRing } from "./ui";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExamResult({
  exam,
  title,
  answers,
  times,
  scores,
  onRetry,
  onRegenerate,
}: {
  exam: Exam;
  title: string;
  answers: Record<number, string>;
  times: Record<number, number>;
  scores: Record<number, ScoreResult>;
  onRetry: () => void;
  onRegenerate?: () => void;
}) {
  const scored = exam.items
    .map((it) => scores[it.slot])
    .filter((s): s is ScoreResult => Boolean(s));
  const summary = summarizeExam(scored);
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    pushHistory({
      id: exam.id,
      finishedAt: Date.now(),
      mode: exam.mode,
      label: title,
      answered: scored.length,
      totalItems: exam.items.length,
      average: summary.average,
      level: summary.level,
    });
    // 결과 화면 진입 시 한 번만 저장한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalTime = exam.items.reduce((sum, it) => sum + (times[it.slot] ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <Link href="/" className="text-sm text-ink-400 transition hover:text-ink-100">
        ← 홈
      </Link>

      {/* 총평 */}
      <Card className="animate-fade-up mt-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={summary.average} />
          <div className="min-w-0 flex-1">
            <Badge tone="accent">추정 등급 · {summary.level}</Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              평균 {summary.average}점
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              {summary.levelNote}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-800 pt-5 text-center">
          <div>
            <dt className="text-xs text-ink-400">작성한 문항</dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">
              {scored.length}/{exam.items.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">총 단어 수</dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">
              {summary.totalWords}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">총 소요 시간</dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">
              {formatTime(totalTime)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-ink-700 px-4 py-2.5 text-sm text-ink-300 transition hover:border-ink-600 hover:text-ink-100"
          >
            같은 시험지 다시 풀기
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500"
            >
              새 시험지 뽑기
            </button>
          )}
        </div>
      </Card>

      {/* 문항별 결과 */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink-400">
        문항별 채점
      </h2>
      <div className="mt-4 space-y-4">
        {exam.items.map((item) => (
          <ItemResult
            key={item.slot}
            slot={item.slot}
            typeLabel={item.typeLabel}
            topic={`${item.emoji} ${item.topicKo}`}
            questionEn={item.question.en}
            questionKo={item.question.ko}
            answer={answers[item.slot] ?? ""}
            elapsed={times[item.slot] ?? 0}
            score={scores[item.slot]}
          />
        ))}
      </div>
    </main>
  );
}

function ItemResult({
  slot,
  typeLabel,
  topic,
  questionEn,
  questionKo,
  answer,
  elapsed,
  score,
}: {
  slot: number;
  typeLabel: string;
  topic: string;
  questionEn: string;
  questionKo: string;
  answer: string;
  elapsed: number;
  score?: ScoreResult;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-ink-850/60"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-800 text-sm font-semibold tabular-nums text-ink-300">
          {slot}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink-200">{typeLabel}</span>
          <span className="block truncate text-xs text-ink-500">{topic}</span>
        </span>
        {score ? (
          <span
            className={`shrink-0 text-lg font-semibold tabular-nums ${
              score.total >= 75
                ? "text-emerald-400"
                : score.total >= 50
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          >
            {score.total}
          </span>
        ) : (
          <span className="shrink-0 text-xs text-ink-500">미작성</span>
        )}
        <span className="shrink-0 text-ink-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-ink-800 px-5 py-5">
          <p className="text-sm leading-relaxed text-ink-200">{questionEn}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">{questionKo}</p>

          {score ? (
            <>
              <div className="mt-5 space-y-3">
                {score.breakdown.map((b) => (
                  <div key={b.key}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-ink-300">{b.label}</span>
                      <span className="tabular-nums text-ink-400">
                        {b.score} / {b.max}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={b.score} max={b.max} tone="score" />
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                      {b.comment}
                    </p>
                  </div>
                ))}
              </div>

              {score.good.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-emerald-400">잘한 점</p>
                  <ul className="mt-2 space-y-1">
                    {score.good.map((g) => (
                      <li key={g} className="text-xs leading-relaxed text-ink-300">
                        · {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {score.improve.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-amber-400">보완할 점</p>
                  <ul className="mt-2 space-y-1">
                    {score.improve.map((i) => (
                      <li key={i} className="text-xs leading-relaxed text-ink-300">
                        · {i}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest text-ink-500">
                  내 답변 · {formatTime(elapsed)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-300">
                  {answer}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-500">
              답변을 작성하지 않아 채점하지 않았습니다.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
