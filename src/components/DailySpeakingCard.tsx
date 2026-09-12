"use client";

import { useEffect, useState } from "react";
import { localDay, type SpeakingTotals } from "@/lib/speakingActivity";
import { READ_COVERAGE_PASS } from "@/lib/readAloud";
import { loadTodaySpeaking, type HistoryEntry } from "@/lib/storage";

const number = (value: number) => value.toLocaleString("ko-KR");

export default function DailySpeakingCard({ history }: { history: HistoryEntry[] }) {
  const [today, setToday] = useState<SpeakingTotals | null>(null);

  useEffect(() => {
    let midnightTimer: number;
    const refresh = () => {
      window.clearTimeout(midnightTimer);
      const now = new Date();
      setToday(loadTodaySpeaking(undefined, now.getTime()));
      // 홈을 켜 둔 채 자정을 지나도 어제의 숫자를 오늘처럼 보여 주지 않는다.
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      midnightTimer = window.setTimeout(refresh, midnight.getTime() - now.getTime() + 50);
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(midnightTimer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [history]);

  const totalSentences = today ? today.answerSentences + today.readSentences : 0;
  const hasActivity = today && (today.questions > 0 || today.readCount > 0);
  const hasUndatedReads = history.some((entry) => !entry.result?.readPractices
    && Object.values(entry.result?.readCounts ?? {}).some((count) => count > 0)
    && localDay(entry.finishedAt) !== localDay(Math.max(entry.finishedAt, entry.updatedAt ?? 0)));

  return <section aria-labelledby="daily-speaking-title" className="mt-4 break-keep rounded-2xl border border-line bg-primary-tint px-5 py-4 sm:px-6">
    <h2 id="daily-speaking-title" className="text-sm font-semibold text-fg-muted">오늘의 말하기</h2>
    <div aria-live="polite" aria-atomic="true">
      {!today ? <p className="mt-2 text-sm text-fg-muted">오늘의 연습을 확인하고 있어요…</p>
        : hasActivity ? <>
          <p className="mt-2 text-base font-medium leading-relaxed sm:text-lg">
            오늘 {today.questions > 0 && <><strong className="font-semibold text-primary-ink">{number(today.questions)}문제</strong>에 답{today.readCount > 0 ? "하고, " : "했어요."}</>}
            {today.readCount > 0 && <>After를 <strong className="font-semibold text-primary-ink">{number(today.readCount)}번</strong> 따라 읽었어요.</>}
          </p>
          {totalSentences > 0 && <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs leading-relaxed text-fg-muted">
            <p className="text-sm">총 약 <strong className="font-semibold tabular-nums text-fg">{number(totalSentences)}문장</strong></p>
            <p>문제 답변 {number(today.answerSentences)} + 따라 읽기 {number(today.readSentences)}</p>
          </div>}
        </> : <>
          <p className="mt-2 text-base font-medium leading-relaxed">오늘은 한 문제부터 가볍게 말해 볼까요?</p>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">답변과 After 따라 읽기가 여기에 함께 쌓여요.</p>
        </>}
    </div>
    <details className="mt-1 text-xs leading-relaxed text-fg-subtle">
      <summary className="min-h-11 cursor-pointer content-center rounded-lg focus-visible:outline-offset-2">집계 기준</summary>
      <p>이 브라우저에 저장한 연습 기준이에요. 문제 답변은 연습을 마친 날, After는 따라 읽기 완료가 확인된 날에 더해요. 같은 질문을 새 회차에서 다시 답하거나 After를 반복해서 읽으면 각각 쌓여요.</p>
      <p className="mt-1">문장 수는 저장된 답변과 읽은 After의 문장부호로 계산한 추정치이며, 직접 입력한 답변도 포함해요. 따라 읽기는 원문의 {Math.round(READ_COVERAGE_PASS * 100)}% 이상이 음성으로 확인되면 1회로 인정해요.</p>
      {hasUndatedReads && <p className="mt-1">날짜를 알 수 없는 이전 따라 읽기 횟수는 오늘 합계에서 제외했어요.</p>}
    </details>
  </section>;
}
