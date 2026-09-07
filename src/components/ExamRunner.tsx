"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam } from "@/lib/types";
import { countEnglishWords } from "@/lib/answers";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
  startDictation,
  stopSpeaking,
  type DictationHandle,
} from "@/lib/speech";
import { loadSettings, saveSettings } from "@/lib/storage";
import { Badge, Card, ProgressBar, SourceBadge } from "./ui";
import ExamResult from "./ExamResult";

const ICON = "h-3.5 w-3.5 shrink-0";

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.3.2.5.6.5 1V15h6v-.1c0-.4.2-.8.5-1A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={ICON} fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExamRunner({
  exam,
  title,
  onRegenerate,
}: {
  exam: Exam;
  title: string;
  onRegenerate?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const [showKorean, setShowKorean] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [timerOn, setTimerOn] = useState(true);

  const dictationRef = useRef<DictationHandle | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const item = exam.items[index];
  const slot = item.slot;
  const answer = answers[slot] ?? "";
  const elapsed = times[slot] ?? 0;
  const words = countEnglishWords(answer);

  const speechAvailable = useMemo(() => isSpeechSynthesisSupported(), []);
  const micAvailable = useMemo(() => isSpeechRecognitionSupported(), []);

  /* 저장된 설정 불러오기 */
  useEffect(() => {
    const s = loadSettings();
    setShowKorean(s.showKorean);
    setAutoSpeak(s.autoSpeak);
  }, []);

  /* 문제가 바뀌면 받아쓰기를 멈추고 낭독을 정리한다 */
  const stopDictation = useCallback(() => {
    dictationRef.current?.stop();
    dictationRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  useEffect(() => {
    stopDictation();
    stopSpeaking();
    if (autoSpeak && !submitted) speak(item.question.en);
    return () => stopSpeaking();
    // 문제가 바뀔 때만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted]);

  useEffect(() => () => stopDictation(), [stopDictation]);

  /* 타이머 */
  useEffect(() => {
    if (submitted || !timerOn) return;
    const id = window.setInterval(() => {
      setTimes((prev) => ({ ...prev, [slot]: (prev[slot] ?? 0) + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [slot, submitted, timerOn]);

  function toggleMic() {
    if (listening) {
      stopDictation();
      return;
    }
    setMicError(null);
    const handle = startDictation({
      onFinal: (text) => {
        setAnswers((prev) => {
          const current = prev[slot] ?? "";
          const joiner = current && !/\s$/.test(current) ? " " : "";
          return { ...prev, [slot]: `${current}${joiner}${text}` };
        });
        setInterim("");
      },
      onInterim: setInterim,
      onError: (code) => {
        setMicError(
          code === "not-allowed"
            ? "마이크 권한이 꺼져 있습니다. 주소창의 자물쇠 아이콘을 눌러 마이크를 허용해 주세요."
            : "음성 인식에 문제가 생겼습니다. 잠시 후 다시 시도하거나 직접 입력해 주세요.",
        );
        stopDictation();
      },
      onEnd: () => setListening(false),
    });
    if (!handle) {
      setMicError("이 브라우저에서는 음성 입력을 쓸 수 없습니다. Chrome이나 Edge에서 열어 주세요.");
      return;
    }
    dictationRef.current = handle;
    setListening(true);
  }

  function submit() {
    stopDictation();
    stopSpeaking();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <ExamResult
        exam={exam}
        title={title}
        answers={answers}
        times={times}
        onRetry={() => {
          setSubmitted(false);
          setIndex(0);
        }}
        onRegenerate={onRegenerate}
      />
    );
  }

  const answeredCount = exam.items.filter(
    (it) => (answers[it.slot] ?? "").trim().length > 0,
  ).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-32 pt-8 sm:px-8">
      {/* 상단 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm text-fg-muted transition hover:text-fg"
        >
          ← 홈
        </Link>
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <span className="tabular-nums">
            {index + 1} / {exam.items.length}
          </span>
          <span className="text-fg-subtle">·</span>
          <span className="tabular-nums">{answeredCount}문항 작성</span>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={index + 1} max={exam.items.length} />
      </div>

      {/* 문제 카드 */}
      <Card key={slot} className="animate-fade-up mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-sm font-semibold tabular-nums text-primary-ink">
            {slot}
          </span>
          <Badge tone="accent">{item.typeLabel}</Badge>
          <Badge>
            {item.emoji} {item.topicKo}
          </Badge>
          <SourceBadge source={item.question.source} />
          <span className="ml-auto flex items-center gap-2 text-xs tabular-nums">
            <span className="text-fg-muted">
              답변 시간 {formatTime(elapsed)}
            </span>
            <button
              type="button"
              onClick={() => setTimerOn((v) => !v)}
              className="rounded-md border border-line px-2 py-0.5 text-fg-muted transition hover:text-fg"
            >
              {timerOn ? "일시정지" : "이어서"}
            </button>
          </span>
        </div>

        <p className="mt-5 text-[17px] leading-[1.75] text-fg sm:text-lg">
          {item.question.en}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {speechAvailable && (
            <button
              type="button"
              onClick={() => speak(item.question.en)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <SpeakerIcon /> 질문 듣기
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowKorean((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            {showKorean ? "해석 숨기기" : "해석 보기"}
          </button>
          {item.question.hints && item.question.hints.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <BulbIcon /> {showHints ? "힌트 숨기기" : "힌트 보기"}
            </button>
          )}
          {speechAvailable && (
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => {
                  setAutoSpeak(e.target.checked);
                  saveSettings({ ...loadSettings(), autoSpeak: e.target.checked });
                }}
                className="h-3.5 w-3.5 accent-[var(--primary)]"
              />
              문제 자동으로 듣기
            </label>
          )}
        </div>

        {showKorean && (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed text-fg-muted">
            {item.question.ko}
          </p>
        )}

        {showHints && item.question.hints && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {item.question.hints.map((hint) => (
              <li
                key={hint}
                className="rounded-lg bg-primary-tint px-2.5 py-1 text-xs text-primary-ink ring-1 ring-inset ring-primary/20"
              >
                {hint}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 답변 입력 */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <label
            htmlFor="answer"
            className="text-xs font-semibold uppercase tracking-widest text-fg-muted"
          >
            내 답변
          </label>
          <div className="flex items-center gap-3 text-xs">
            <span className="tabular-nums text-fg-muted">
              {words}단어
            </span>
            {micAvailable && (
              <button
                type="button"
                onClick={toggleMic}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors ${
                  listening
                    ? "border-danger-ink/40 bg-danger-tint text-danger-ink"
                    : "border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                {listening ? <><StopIcon /> 음성 입력 중지</> : <><MicIcon /> 음성으로 답변</>}
              </button>
            )}
          </div>
        </div>

        <textarea
          id="answer"
          ref={textareaRef}
          value={answer}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [slot]: e.target.value }))
          }
          placeholder="Well, let me tell you about..."
          rows={10}
          spellCheck
          className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] leading-relaxed text-fg transition-colors placeholder:text-fg-subtle focus:border-line-strong"
        />

        {listening && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-danger-ink">
            <MicIcon /> 듣고 있어요… {interim && <span className="text-fg-muted">{interim}</span>}
          </p>
        )}
        {micError && <p className="mt-2 text-xs text-warn-ink">{micError}</p>}
        {micAvailable === false && (
          <p className="mt-2 text-xs text-fg-subtle">
            이 브라우저에서는 음성 입력을 쓸 수 없습니다. 답변을 직접 입력해
            연습해 주세요.
          </p>
        )}
      </div>

      {/* 하단 내비게이션 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-4 sm:px-8">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-xl border border-line px-4 py-2.5 text-sm text-fg-muted transition enabled:hover:border-line-strong enabled:hover:text-fg disabled:opacity-30"
          >
            이전 문항
          </button>
          <span className="min-w-0 flex-1 truncate text-center text-xs text-fg-subtle">
            {title}
          </span>
          {index < exam.items.length - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
            >
              다음 문항
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="rounded-xl bg-success px-5 py-2.5 text-sm font-medium text-success-fg transition-colors hover:bg-success-hover"
            >
              답변 확인하기
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
