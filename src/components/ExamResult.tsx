"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Exam, ExamItem } from "@/lib/types";
import {
  feedbackCategoryLabel,
  readFeedbackResponse,
  requiresFrontLoadedOpening,
  type FeedbackResponse,
  type OpicFeedback,
} from "@/lib/feedback";
import {
  applyAnswerRewrites,
  countEnglishSentences,
  countEnglishWords,
  countUniqueEnglishWords,
  defaultResultFilter,
  filterItemsByAnswer,
  hasAnswerText,
  sameSpokenText,
  summarizeAnswers,
  type ResultFilter,
} from "@/lib/answers";
import { formatHistoryStamp } from "@/lib/history";
import { pushHistory, updateHistoryResult, type HistoryEntry, type SavedResult } from "@/lib/storage";
import { estimateFeedbackCost, formatKrw } from "@/lib/cost";
import {
  draftId,
  expressionFromFeedbackItem,
  expressionFromOverall,
  type ExpressionDraft,
} from "@/lib/expressions";
import { SaveExpressionButton, useSavedExpressions } from "./SavedExpressions";
import { Badge, Card, SourceBadge } from "./ui";
import Footer from "./Footer";

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export interface AnswerRecording {
  url: string;
  mimeType: string;
}

/**
 * 결과 화면에서 바꿔 쓴 답변.
 *
 * AI 분석은 녹음본을 OpenAI 로 한 번 더 받아쓴다. 그쪽이 브라우저 받아쓰기보다
 * 정확한 편이라 답변 정본을 그 텍스트로 바꾸고, 원래 받아쓰기는 되돌리기와
 * 발음 비교용으로 남겨 둔다. 두 값을 한 상태로 묶어 두 문항을 동시에 분석해도
 * 서로의 결과를 덮어쓰지 않는다.
 */
interface AnswerRewrites {
  /** 문항별로 바꿔 쓴 답변. 저장된 답변 위에 이 값이 덮인다. */
  texts: Record<number, string>;
  /** OpenAI 로 다시 받아쓴 문항의 원래 브라우저 받아쓰기. 되돌리면 사라진다. */
  browser: Record<number, string>;
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
  const [attempt] = useState(() => ({
    id: historyEntry?.id ?? crypto.randomUUID(),
    finishedAt: historyEntry?.finishedAt ?? Date.now(),
  }));
  const [rewrites, setRewrites] = useState<AnswerRewrites>(() => ({
    texts: {},
    browser: { ...(historyEntry?.result?.browserAnswers ?? {}) },
  }));
  // 넘겨받은 답변이 바탕이다. 마이크가 늦게 확정한 받아쓰기는 여기로 들어오고,
  // 다시 받아쓴 문항만 위에서 덮으므로 두 경로가 서로를 지우지 않는다.
  const answerBySlot = useMemo(() => applyAnswerRewrites(answers, rewrites.texts), [answers, rewrites.texts]);
  const { answeredSlots, answeredCount, skippedCount, totalWords, averageWords, totalSentences,
    uniqueWords, totalTime, totalHints, totalReplays } = summarizeAnswers(exam.items, answerBySlot, times, hintUse, replays);
  const [feedbackBySlot, setFeedbackBySlot] = useState<Record<number, OpicFeedback>>(historyEntry?.result?.feedback ?? {});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(!!historyEntry);
  const [savedAt, setSavedAt] = useState(() => Math.max(attempt.finishedAt, historyEntry?.updatedAt ?? 0));
  const saved = useRef(!!historyEntry);
  const latestResult = useRef<SavedResult>({ exam, answers: answerBySlot, times, hintUse, replays, feedback: feedbackBySlot });
  // 되돌려서 원본이 하나도 남지 않으면 키 자체를 빼 예전 기록과 같은 모양으로 저장한다.
  latestResult.current = {
    exam, answers: answerBySlot, times, hintUse, replays, feedback: feedbackBySlot,
    ...(Object.keys(rewrites.browser).length ? { browserAnswers: rewrites.browser } : {}),
  };

  const persist = useCallback((result: SavedResult) => {
    try {
      if (saved.current) updateHistoryResult(attempt.id, result);
      else {
        pushHistory({ ...attempt, mode: exam.mode, label: title,
          answered: result.exam.items.filter((item) => hasAnswerText(result.answers[item.slot])).length,
          totalItems: exam.items.length, result });
        saved.current = true;
      }
      setPersisted(true);
      setSaveError(null);
      setSavedAt(Date.now());
    } catch (error) {
      setPersisted(false);
      setSaveError(error instanceof Error ? error.message : "기록을 저장하지 못했습니다.");
    }
  }, [attempt, exam, title]);

  /**
   * 지난 기록을 열어 보기만 할 때는 다시 저장하지 않는다. 답변을 다시 받아쓰거나
   * AI 피드백을 받은 뒤부터 같은 회차에 덧붙인다.
   */
  const readOnly = useRef(!!historyEntry);

  // 저장은 이 한 곳에서만 한다. 초기 저장, 늦게 확정되는 받아쓰기, 다시 받아쓴 답변,
  // AI 피드백이 모두 같은 회차로 모인다.
  useEffect(() => {
    if (readOnly.current) return;
    persist(latestResult.current);
  }, [persist, answerBySlot, times, rewrites, feedbackBySlot]);

  /**
   * AI 분석 결과를 반영한다. 녹음본 전사가 오면 답변 정본도 그 텍스트로 바꾼다.
   * 브라우저 받아쓰기와 사실상 같은 문장이면 굳이 바꾸지 않는다.
   */
  function applyFeedback(slot: number, response: FeedbackResponse) {
    readOnly.current = false;
    setFeedbackBySlot((current) => ({ ...current, [slot]: response.feedback }));
    const transcript = response.audioTranscript;
    if (!hasAnswerText(transcript)) return;
    setRewrites((current) => {
      const shown = applyAnswerRewrites(answers, current.texts)[slot] ?? "";
      if (sameSpokenText(transcript, shown)) return current;
      return {
        texts: { ...current.texts, [slot]: transcript },
        // 다시 분석해도 맨 처음 브라우저 받아쓰기를 원본으로 지킨다.
        browser: current.browser[slot] === undefined ? { ...current.browser, [slot]: shown } : current.browser,
      };
    });
  }

  /** 다시 받아쓴 답변을 물리고 브라우저 받아쓰기로 돌아간다. */
  function revertAnswer(slot: number) {
    readOnly.current = false;
    setRewrites((current) => {
      const original = current.browser[slot];
      if (original === undefined) return current;
      const browser = { ...current.browser };
      delete browser[slot];
      return { texts: { ...current.texts, [slot]: original }, browser };
    });
  }

  // 별표로 저장한 피드백은 회차가 아니라 문항에 붙는다. 같은 문항을 다시 풀 때 연습 도구에 나온다.
  const expressions = useSavedExpressions();

  const recordingCount = answeredSlots.filter((slot) => recordings[slot]).length;
  // 미답변 문항이 목록을 채우면 실제로 말한 답변을 다시 보기 어렵다. 기본은 답변한 문항만 보여 준다.
  const [filter, setFilter] = useState<ResultFilter>(() => defaultResultFilter(answeredCount, exam.items.length));
  const visibleItems = filterItemsByAnswer(exam.items, answerBySlot, filter);
  const rewrittenCount = Object.keys(rewrites.browser).length;
  // 연습을 마친 뒤 답변이나 피드백을 덧붙였다면 언제 저장한 회차인지 함께 적는다.
  const finishedStamp = formatHistoryStamp({ finishedAt: attempt.finishedAt });
  const savedStamp = formatHistoryStamp({ finishedAt: attempt.finishedAt, updatedAt: savedAt });

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <Link href="/" className="text-sm text-fg-muted transition hover:text-fg">← 홈</Link>
      <Card className="animate-fade-up mt-5 p-6 sm:p-8">
        <Badge tone="accent">{title}</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{historyEntry ? "지난 연습 결과" : "연습 결과"}</h1>
        <p className="mt-2 text-xs text-fg-subtle">{savedStamp}{savedStamp === finishedStamp ? "" : ` 저장 · 연습 ${finishedStamp}`}</p>
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

        {rewrittenCount > 0 && <p className="mt-2 text-xs leading-relaxed text-fg-muted">AI 분석에 녹음본을 보낸 {rewrittenCount}문항은 OpenAI 가 다시 받아쓴 텍스트를 답변으로 씁니다. 위 통계도 그 텍스트 기준이며, 문항을 펼치면 원래 브라우저 받아쓰기를 보거나 되돌릴 수 있습니다.</p>}

        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          전체 단어는 반복을 포함하고, 고유 단어는 대소문자를 무시한 중복 제거 기준입니다. 문장 수는 받아쓰기 텍스트의 문장부호를 기준으로 계산합니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-fg-muted">
          AI 코칭은 문법 채점보다 <strong className="font-semibold text-fg">핵심 주제 → 활동·예시·디테일 → 감정·의미</strong> 흐름과 전달력을 우선합니다. 답변 첫 1~2문장에서 질문에 바로 답하는 <strong className="font-semibold text-fg">두괄식</strong>인지도 함께 봅니다. 롤플레이 11~13번은 전화 대화에 가까워 두괄식을 요구하지 않고, 요청·문제가 일찍 드러나는지만 봅니다. 문법은 의미 전달을 크게 방해하는 경우만 지적하도록 설정했습니다.
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
            answer={answerBySlot[item.slot] ?? ""}
            browserAnswer={rewrites.browser[item.slot]}
            elapsed={times[item.slot] ?? 0}
            hints={hintUse[item.slot] ?? 0}
            replays={replays[item.slot] ?? 0}
            recording={recordings[item.slot]}
            feedback={feedbackBySlot[item.slot]}
            onFeedback={(response) => applyFeedback(item.slot, response)}
            onRevertAnswer={() => revertAnswer(item.slot)}
            savedIds={expressions.savedIds}
            onToggleExpression={expressions.toggle}
            expressionError={expressions.error}
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
  browserAnswer,
  elapsed,
  hints,
  replays,
  recording,
  feedback,
  onFeedback,
  onRevertAnswer,
  savedIds,
  onToggleExpression,
  expressionError,
}: {
  item: ExamItem;
  /** 화면에 보여 줄 답변 정본. 다시 받아쓴 문항은 OpenAI 텍스트다. */
  answer: string;
  /** 다시 받아쓰기 전의 브라우저 받아쓰기. 값이 있으면 답변이 바뀐 문항이다. */
  browserAnswer?: string;
  elapsed: number;
  hints: number;
  replays: number;
  recording?: AnswerRecording;
  feedback?: OpicFeedback;
  onFeedback: (response: FeedbackResponse) => void;
  onRevertAnswer: () => void;
  /** 이미 저장한 조언의 키. 별표 버튼의 켜짐/꺼짐을 정한다. */
  savedIds: ReadonlySet<string>;
  onToggleExpression: (draft: ExpressionDraft) => void;
  expressionError: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showBrowserAnswer, setShowBrowserAnswer] = useState(false);
  const hasAnswer = hasAnswerText(answer);
  const extension = recording?.mimeType.includes("ogg") ? "ogg" : "webm";
  // 롤플레이는 전화 대화에 가까워 두괄식을 요구하지 않는다. 칩 라벨도 기준에 맞춰 바뀐다.
  const frontLoaded = requiresFrontLoadedOpening(item.question.type);
  const expressionContext = {
    questionId: item.question.id, questionEn: item.question.en,
    topicId: item.topicId, topicKo: item.topicKo,
  };
  const overallDraft = feedback ? expressionFromOverall(feedback, expressionContext) : undefined;

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
      body.append("questionType", item.question.type);
      // 발음 점검은 브라우저 받아쓰기와 새 전사를 견주어 본다. 이미 바꿔 쓴 문항은
      // 원래 받아쓰기를 보내야 두 인식 결과의 차이가 그대로 남는다.
      body.append("transcript", browserAnswer ?? answer);
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
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      const result = response.ok ? readFeedbackResponse(payload) : null;
      if (!result) throw new Error(payload?.error || "AI 피드백을 불러오지 못했습니다.");
      onFeedback(result);
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

          {/*
            녹음본 자리가 말없이 비어 있으면 노트북에서 쓰던 사람은 무엇이 빠졌는지
            모른다. AI 피드백은 답변 텍스트만 있으면 되므로 그대로 된다는 것부터 밝힌다.
          */}
          {hasAnswer && !recording && (
            <p className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-xs leading-relaxed text-fg-muted">
              이 문항에는 녹음본이 없습니다. <strong className="font-semibold text-fg">AI 피드백은 그대로 받을 수 있고</strong>, 녹음본 재생과
              녹음본 재전사(발음 비교·답변 텍스트 교정)만 빠집니다. 휴대폰은 마이크를 한 번에 한 곳에서만 쓸 수 있어 받아쓰기를 먼저 켜기 때문입니다.
            </p>
          )}

          {hasAnswer ? (
            <>
              <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3">
                <p className="text-[11px] tracking-widest text-fg-subtle">
                  내 답변 · {countEnglishWords(answer)}단어 · 고유 {countUniqueEnglishWords(answer)}단어 · {countEnglishSentences(answer)}문장 · {formatTime(elapsed)} · 다시 듣기 {replays}회 · 힌트 {hints}회
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{answer}</p>

                {browserAnswer !== undefined && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[11px] leading-relaxed text-fg-subtle">
                      <span className="mr-1.5 rounded-md border border-line bg-surface px-1.5 py-0.5 font-semibold text-fg-muted">OpenAI 받아쓰기</span>
                      AI 분석에 보낸 녹음본을 다시 받아쓴 결과입니다. 브라우저 받아쓰기보다 정확한 편이라 위 답변과 단어 수를 이 텍스트로 바꿔 저장했습니다.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" aria-expanded={showBrowserAnswer} onClick={() => setShowBrowserAnswer((value) => !value)}
                        className="min-h-9 rounded-lg border border-line px-2.5 text-[11px] text-fg-muted transition hover:text-fg">
                        브라우저 받아쓰기 {showBrowserAnswer ? "접기" : "보기"}
                      </button>
                      <button type="button" onClick={() => { setShowBrowserAnswer(false); onRevertAnswer(); }}
                        className="min-h-9 rounded-lg border border-line px-2.5 text-[11px] text-fg-muted transition hover:text-fg">
                        브라우저 받아쓰기로 되돌리기
                      </button>
                    </div>
                    {showBrowserAnswer && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-fg-subtle">
                        {browserAnswer}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-line px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">AI 스토리텔링 코치</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-subtle">최대 5개만, 전달력에 영향이 큰 것부터 봅니다.</p>
                    {recording && <p className="mt-1 text-xs leading-relaxed text-fg-subtle">녹음본을 함께 보내 OpenAI 가 답변을 다시 받아씁니다. 브라우저 받아쓰기보다 정확하면 위 답변도 그 텍스트로 바뀝니다.</p>}
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
                      <FlowChip label={frontLoaded ? "두괄식 도입" : "요청·문제 전달"} good={feedback.structure.topic === "good"} />
                      <FlowChip label="활동·디테일" good={feedback.structure.detail === "good"} />
                      <FlowChip label="감정·의미" good={feedback.structure.feeling === "good"} />
                    </div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-fg">{feedback.overall}</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-muted">{feedback.structure.note}</p>

                    {overallDraft && <div className="mt-3 flex flex-wrap items-center gap-2">
                      <SaveExpressionButton draft={overallDraft} saved={savedIds.has(draftId(overallDraft))} onToggle={onToggleExpression} />
                      <span className="text-[11px] leading-relaxed text-fg-subtle">★ 로 저장한 조언은 같은 문항이나 같은 주제를 다시 풀 때 연습 도구에 나옵니다.</span>
                    </div>}
                    {expressionError && <p role="alert" className="mt-2 text-xs text-warn-ink">{expressionError}</p>}

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
                        {feedback.items.slice(0, 5).map((detail, idx) => {
                          const draft = expressionFromFeedbackItem(detail, expressionContext);
                          return (
                            <li key={`${detail.category}-${idx}`} className="rounded-lg bg-surface-2 px-3.5 py-3">
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle">
                                  {feedbackCategoryLabel[detail.category]}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-fg">{detail.title}</p>
                                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">{detail.message}</p>
                                  {detail.example && (
                                    <p className="mt-2 rounded-md border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-fg">
                                      {detail.example}
                                    </p>
                                  )}
                                </div>
                                <SaveExpressionButton draft={draft} saved={savedIds.has(draftId(draft))} onToggle={onToggleExpression} />
                              </div>
                            </li>
                          );
                        })}
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
