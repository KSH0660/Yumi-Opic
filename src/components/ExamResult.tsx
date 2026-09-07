"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Exam, ExamItem } from "@/lib/types";
import { isOpicFeedback, type FeedbackCategory, type OpicFeedback } from "@/lib/feedback";
import {
  countEnglishSentences,
  countEnglishWords,
  countUniqueEnglishWords,
  defaultResultFilter,
  filterItemsByAnswer,
  hasAnswerText,
  summarizeAnswers,
  type ResultFilter,
} from "@/lib/answers";
import { pushHistory, updateHistoryResult, type HistoryEntry, type SavedResult } from "@/lib/storage";
import { estimateFeedbackCost, formatKrw } from "@/lib/cost";
import { Badge, Card, SourceBadge } from "./ui";
import Footer from "./Footer";

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

const feedbackCategoryLabel: Record<FeedbackCategory, string> = {
  storytelling: "스토리텔링",
  detail: "활동·디테일",
  emotion: "감정·의미",
  delivery: "전달력",
  pronunciation: "발음 체크",
  grammar: "문법",
};

export interface AnswerRecording {
  url: string;
  mimeType: string;
}

export default function ExamResult({
  exam,
  title,
  answers,
  times,
  hintUse = {},
  replays = {},
  recordings = {},
  historyEntry,
  onRetry,
  onRegenerate,
}: {
  exam: Exam;
  title: string;
  answers: Record<number, string>;
  times: Record<number, number>;
  /** 문항별로 힌트를 꾹 눌러 본 횟수. 실전에서는 없는 도움이라 따로 보여 준다. */
  hintUse?: Record<number, number>;
  /** 문항별 다시 듣기 사용 횟수. */
  replays?: Record<number, number>;
  /** 브라우저에서 녹음한 문항별 답변. URL은 현재 페이지 세션 동안만 유지된다. */
  recordings?: Record<number, AnswerRecording>;
  historyEntry?: HistoryEntry;
  onRetry?: () => void;
  onRegenerate?: () => void;
}) {
  const { answeredSlots, answeredCount, skippedCount, totalWords, averageWords, totalSentences,
    uniqueWords, totalTime, totalHints, totalReplays } = summarizeAnswers(exam.items, answers, times, hintUse, replays);
  const [attempt] = useState(() => ({
    id: historyEntry?.id ?? crypto.randomUUID(),
    finishedAt: historyEntry?.finishedAt ?? Date.now(),
  }));
  const [feedbackBySlot, setFeedbackBySlot] = useState<Record<number, OpicFeedback>>(historyEntry?.result?.feedback ?? {});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(!!historyEntry);
  const saved = useRef(!!historyEntry);
  // 초기 저장 이후 늦게 확정되는 STT도 반영한다. 기록 조회만으로는 다시 저장하지 않는다.
  const latestResult = useRef<SavedResult>({ exam, answers, times, hintUse, replays, feedback: feedbackBySlot });
  latestResult.current = { exam, answers, times, hintUse, replays, feedback: feedbackBySlot };

  useEffect(() => {
    if (historyEntry) return;
    try {
      if (saved.current) {
        updateHistoryResult(attempt.id, latestResult.current);
      } else {
        pushHistory({ ...attempt, mode: exam.mode, label: title, answered: answeredCount,
          totalItems: exam.items.length, result: latestResult.current });
        saved.current = true;
      }
      setPersisted(true);
      setSaveError(null);
    } catch (error) {
      setPersisted(false);
      setSaveError(error instanceof Error ? error.message : "기록을 저장하지 못했습니다.");
    }
  }, [attempt, exam, title, answeredCount, answers, times, historyEntry]);

  function saveFeedback(slot: number, feedback: OpicFeedback) {
    const next = { ...latestResult.current.feedback, [slot]: feedback };
    const result = { ...latestResult.current, feedback: next };
    latestResult.current = result;
    setFeedbackBySlot(next);
    try {
      if (saved.current) updateHistoryResult(attempt.id, result);
      else {
        pushHistory({ ...attempt, mode: exam.mode, label: title, answered: answeredCount,
          totalItems: exam.items.length, result });
        saved.current = true;
      }
      setPersisted(true);
      setSaveError(null);
    } catch (error) {
      setPersisted(false);
      setSaveError(error instanceof Error ? error.message : "피드백을 저장하지 못했습니다.");
    }
  }

  const recordingCount = answeredSlots.filter((slot) => recordings[slot]).length;
  // 미답변 문항이 목록을 채우면 실제로 말한 답변을 다시 보기 어렵다. 기본은 답변한 문항만 보여 준다.
  const [filter, setFilter] = useState<ResultFilter>(() => defaultResultFilter(answeredCount, exam.items.length));
  const visibleItems = filterItemsByAnswer(exam.items, answers, filter);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <Link href="/" className="text-sm text-fg-muted transition hover:text-fg">← 홈</Link>
      <Card className="animate-fade-up mt-5 p-6 sm:p-8">
        <Badge tone="accent">{title}</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{historyEntry ? "지난 연습 결과" : "연습 결과"}</h1>
        <p className="mt-2 text-xs text-fg-subtle">{new Date(attempt.finishedAt).toLocaleString("ko-KR")}</p>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          문항별 질문, 받아쓰기 결과, 녹음본을 확인해 보세요. 원하는 답변만 AI 코칭을 받을 수 있습니다.
        </p>
        {saveError ? <p role="alert" className="mt-3 text-xs text-warn-ink">{saveError}</p> : persisted && (
          <p className="mt-3 text-xs leading-relaxed text-fg-muted">질문·답변·AI 피드백은 이 브라우저에 최근 20회까지 저장됩니다. 주제별 연습·실전 모의고사 화면 아래의 연습 기록에서 다시 볼 수 있습니다. 녹음본은 현재 화면에서만 재생되므로 필요하면 다운로드해 주세요.</p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-center sm:grid-cols-3">
          <div><dt className="text-xs text-fg-muted">답변한 문항</dt><dd className="mt-1 text-lg font-medium tabular-nums">{answeredCount}/{exam.items.length}</dd></div>
          <div><dt className="text-xs text-fg-muted">전체 단어</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalWords}</dd></div>
          <div><dt className="text-xs text-fg-muted">답변당 평균 단어</dt><dd className="mt-1 text-lg font-medium tabular-nums">{averageWords === null ? "—" : Number(averageWords.toFixed(1))}</dd></div>
          <div><dt className="text-xs text-fg-muted">고유 단어</dt><dd className="mt-1 text-lg font-medium tabular-nums">{uniqueWords}</dd></div>
          <div><dt className="text-xs text-fg-muted">문장 수</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalSentences}</dd></div>
          <div><dt className="text-xs text-fg-muted">말한 시간</dt><dd className="mt-1 text-lg font-medium tabular-nums">{formatTime(totalTime)}</dd></div>
          <div><dt className="text-xs text-fg-muted">다시 듣기</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalReplays}회</dd></div>
          <div><dt className="text-xs text-fg-muted">힌트 사용</dt><dd className="mt-1 text-lg font-medium tabular-nums">{totalHints}회</dd></div>
          <div><dt className="text-xs text-fg-muted">녹음본</dt><dd className="mt-1 text-lg font-medium tabular-nums">{recordingCount}개</dd></div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-fg-muted">미답변 {skippedCount}문항은 평균 단어 수를 포함한 모든 답변 통계와 AI 분석에서 제외합니다. 녹음본이 있어도 답변 텍스트가 비어 있으면 미답변으로 처리합니다.</p>

        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          전체 단어는 반복을 포함하고, 고유 단어는 대소문자를 무시한 중복 제거 기준입니다. 문장 수는 받아쓰기 텍스트의 문장부호를 기준으로 계산합니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-fg-muted">
          AI 코칭은 문법 채점보다 <strong className="font-semibold text-fg">핵심 주제 → 활동·예시·디테일 → 감정·의미</strong> 흐름과 전달력을 우선합니다. 문법은 의미 전달을 크게 방해하는 경우만 지적하도록 설정했습니다.
        </p>

        {(onRetry || onRegenerate) && <div className="mt-6 flex flex-wrap gap-3">
          {onRetry && <button type="button" onClick={onRetry} className="rounded-xl border border-line px-4 py-2.5 text-sm text-fg-muted">같은 문제 다시 풀기</button>}
          {onRegenerate && (
            <button type="button" onClick={onRegenerate} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover">문제 다시 뽑기</button>
          )}
        </div>}
      </Card>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-widest text-fg-muted">문항별 답변 다시 보기</h2>
        {skippedCount > 0 && (
          <div role="group" aria-label="문항 보기 범위" className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1">
            <FilterButton active={filter === "answered"} onClick={() => setFilter("answered")}>답변한 문항 {answeredCount}</FilterButton>
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>전체 {exam.items.length}</FilterButton>
          </div>
        )}
      </div>
      {filter === "answered" && skippedCount > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-fg-subtle">답변 없는 {skippedCount}문항은 숨겼습니다. <strong className="font-medium text-fg-muted">전체</strong>를 누르면 다시 볼 수 있습니다.</p>
      )}
      <div className="mt-4 space-y-4">
        {visibleItems.map((item) => (
          <ItemResult
            key={item.slot}
            item={item}
            answer={answers[item.slot] ?? ""}
            elapsed={times[item.slot] ?? 0}
            hints={hintUse[item.slot] ?? 0}
            replays={replays[item.slot] ?? 0}
            recording={recordings[item.slot]}
            feedback={feedbackBySlot[item.slot]}
            onFeedback={(feedback) => saveFeedback(item.slot, feedback)}
          />
        ))}
        {visibleItems.length === 0 && (
          <Card className="px-5 py-6">
            <p className="text-sm text-fg-muted">답변한 문항이 없습니다. <strong className="font-medium text-fg">전체</strong>를 누르면 이번에 받은 질문을 볼 수 있습니다.</p>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  );
}

function ItemResult({
  item,
  answer,
  elapsed,
  hints,
  replays,
  recording,
  feedback,
  onFeedback,
}: {
  item: ExamItem;
  answer: string;
  elapsed: number;
  hints: number;
  replays: number;
  recording?: AnswerRecording;
  feedback?: OpicFeedback;
  onFeedback: (feedback: OpicFeedback) => void;
}) {
  const [open, setOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const hasAnswer = hasAnswerText(answer);
  const extension = recording?.mimeType.includes("ogg") ? "ogg" : "webm";

  // 버튼 한 번이 관리자 지갑에서 나가는 돈이라 누르기 전에 대략적인 금액을 알린다.
  const cost = estimateFeedbackCost({
    questionChars: item.question.en.length,
    transcriptChars: answer.length,
    audioSec: recording ? elapsed : 0,
  });

  async function requestFeedback() {
    if (!hasAnswer || feedbackLoading) return;
    if (!window.confirm(
      `이 버튼을 누르면 최대 약 ${formatKrw(cost.krw)}이 관리자의 지갑에서 지출될 예정입니다.\n\n`
      + `· 피드백 생성 ${formatKrw(cost.modelKrw)}\n`
      + (cost.transcribeKrw > 0 ? `· 녹음본 발음 비교 ${formatKrw(cost.transcribeKrw)}\n` : "")
      + `\n실제 청구액은 보통 이보다 적습니다. 계속할까요?`,
    )) return;
    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const body = new FormData();
      body.append("question", item.question.en);
      body.append("topic", `${item.topicKo} / ${item.topicEn}`);
      body.append("type", item.typeLabel);
      body.append("transcript", answer);
      body.append("elapsedSec", String(elapsed));

      if (recording) {
        try {
          const audioResponse = await fetch(recording.url);
          const blob = await audioResponse.blob();
          if (blob.size > 0) {
            body.append("audio", blob, `yumi-opic-question-${item.slot}.${extension}`);
          }
        } catch {
          // 녹음본 전송이 실패해도 텍스트 피드백은 받을 수 있다.
        }
      }

      const response = await fetch("/api/feedback", { method: "POST", body });
      const payload = (await response.json().catch(() => null)) as (OpicFeedback & { error?: string }) | null;
      if (!response.ok || !isOpicFeedback(payload) || payload?.error) {
        throw new Error(payload?.error || "AI 피드백을 불러오지 못했습니다.");
      }
      onFeedback(payload);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "AI 피드백을 불러오지 못했습니다.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-surface-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-3 text-sm font-semibold text-fg-muted">{item.slot}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-fg">{item.typeLabel}</span>
          <span className="block truncate text-xs text-fg-subtle">{item.emoji} {item.topicKo}</span>
        </span>
        <span className="shrink-0 text-xs text-fg-muted">{feedback ? "피드백 있음" : hasAnswer ? "답변함" : "답변 없음"}</span>
        <span className="shrink-0 text-fg-subtle">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-line px-5 py-5">
          <SourceBadge source={item.question.source} />
          <p className="mt-3 text-sm leading-relaxed text-fg">{item.question.en}</p>
          <p className="mt-2 text-xs leading-relaxed text-fg-subtle">{item.question.ko}</p>

          {recording && (
            <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <audio controls preload="metadata" src={recording.url} className="max-w-full flex-1" />
                <a
                  href={recording.url}
                  download={`yumi-opic-question-${item.slot}.${extension}`}
                  className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-fg-muted transition hover:text-fg"
                >
                  녹음본 다운로드
                </a>
              </div>
            </div>
          )}

          {hasAnswer ? (
            <>
              <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3">
                <p className="text-[11px] tracking-widest text-fg-subtle">
                  내 답변 · {countEnglishWords(answer)}단어 · 고유 {countUniqueEnglishWords(answer)}단어 · {countEnglishSentences(answer)}문장 · {formatTime(elapsed)} · 다시 듣기 {replays}회 · 힌트 {hints}회
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{answer}</p>
              </div>

              <div className="mt-4 rounded-xl border border-line px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">AI 스토리텔링 코치</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-subtle">최대 5개만, 전달력에 영향이 큰 것부터 봅니다.</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-subtle">한 번 요청할 때마다 최대 약 {formatKrw(cost.krw)}이 듭니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={requestFeedback}
                    disabled={feedbackLoading}
                    className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                  >
                    {feedbackLoading ? "분석 중…" : feedback ? "다시 분석" : "AI 피드백 받기"}
                  </button>
                </div>

                {feedbackError && (
                  <p role="alert" className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs leading-relaxed text-fg-muted">
                    {feedbackError}
                  </p>
                )}

                {feedback && (
                  <div className="mt-4 border-t border-line pt-4">
                    <div className="flex flex-wrap gap-2">
                      <FlowChip label="핵심 주제" good={feedback.structure.topic === "good"} />
                      <FlowChip label="활동·디테일" good={feedback.structure.detail === "good"} />
                      <FlowChip label="감정·의미" good={feedback.structure.feeling === "good"} />
                    </div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-fg">{feedback.overall}</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-muted">{feedback.structure.note}</p>

                    {feedback.pronunciationBasis === "audio_compare" ? (
                      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
                        발음 항목은 녹음본을 별도로 재전사해 브라우저 받아쓰기와 비교한 점검 신호입니다. 두 음성인식 모두 틀릴 수 있으므로 확정 판정으로 보지는 마세요.
                      </p>
                    ) : (
                      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
                        별도 녹음 재전사가 없으면 텍스트만 보고 발음 오류를 추정하지 않습니다.
                      </p>
                    )}

                    {feedback.items.length > 0 ? (
                      <ol className="mt-4 space-y-3">
                        {feedback.items.slice(0, 5).map((entry, idx) => (
                          <li key={`${entry.category}-${idx}`} className="rounded-lg bg-surface-2 px-3.5 py-3">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle">
                                {feedbackCategoryLabel[entry.category]}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-fg">{entry.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-fg-muted">{entry.message}</p>
                                {entry.example && (
                                  <p className="mt-2 rounded-md border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-fg">
                                    {entry.example}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-4 text-xs text-fg-muted">지금 답변에서 꼭 고칠 만한 큰 문제는 찾지 않았습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4">
              <p className="text-sm text-fg-muted">답변 텍스트가 없어 통계와 AI 분석에서 제외한 문항입니다.</p>
              <button type="button" disabled className="mt-3 min-h-11 cursor-not-allowed rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-fg opacity-50">AI 피드백 받기</button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums transition ${active ? "bg-primary text-primary-fg" : "text-fg-muted hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

function FlowChip({ label, good }: { label: string; good: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] text-fg-muted">
      <span className="font-semibold text-fg">{good ? "✓" : "△"}</span>
      {label} {good ? "좋음" : "보강"}
    </span>
  );
}
