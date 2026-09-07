"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam } from "@/lib/types";
import { countEnglishWords } from "@/lib/answers";
import {
  estimateSpeechMs,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
  startDictation,
  stopSpeaking,
  type DictationHandle,
} from "@/lib/speech";
import { mergeTranscript } from "@/lib/transcript";
import { loadSettings, saveSettings } from "@/lib/storage";
import AvaAvatar from "./AvaAvatar";
import ExamResult from "./ExamResult";
import { SourceBadge } from "./ui";

/** 실전에 가까운 낭독 속도. */
const SPEECH_RATE = 0.92;
/** 실제 시험과 같이 재청취는 한 번만 허용한다. */
const MAX_REPLAYS = 1;
/** 낭독이 끝난 뒤 다시 듣기를 누를 수 있는 시간(초). 실제 시험 안내와 같다. */
const REPLAY_WINDOW_SEC = 5;

/**
 * 한 문항의 진행 단계.
 *  ready    : 아직 안 들음. ▶ 를 눌러야 한다.
 *  playing  : 면접관이 질문을 읽는 중.
 *  answering: 질문이 끝나 답변할 차례.
 */
type Phase = "ready" | "playing" | "answering";

type Reveal = "script" | "korean" | "keywords";

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function micMessage(code: string): string {
  if (code === "not-allowed" || code === "service-not-allowed")
    return "마이크 권한이 꺼져 있습니다. 주소창의 자물쇠 아이콘에서 마이크를 허용한 뒤 다시 눌러 주세요.";
  if (code === "audio-capture")
    return "마이크를 찾지 못했습니다. 기기에 마이크가 연결돼 있는지 확인해 주세요.";
  if (code === "network")
    return "음성 인식 서버에 연결하지 못했습니다. 네트워크를 확인하고 다시 녹음해 주세요.";
  return "음성 인식이 잠시 멈췄습니다. 다시 녹음하기를 누르거나 직접 입력으로 바꿔 주세요.";
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

function MicGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
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
  const [replays, setReplays] = useState<Record<number, number>>({});
  const [hintUse, setHintUse] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const [replayLeftSec, setReplayLeftSec] = useState(0);

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const [reveal, setReveal] = useState<Reveal | null>(null);
  /**
   * 연습 도구(답변 기록·지문 힌트)를 펼쳤는지.
   * 기본은 접힌 상태다. 아무것도 없는 실제 응시 화면과 같게 두고, 필요할 때만
   * 눌러서 꺼내 쓰라는 뜻이다. 시험을 새로 시작하면 다시 접힌 상태로 돌아간다.
   */
  const [tools, setTools] = useState(false);
  const [volume, setVolume] = useState(1);

  const dictationRef = useRef<DictationHandle | null>(null);
  /**
   * 받아쓰기 세션 번호.
   *
   * 마이크를 멈춰도 마지막 문장이 조금 뒤에 도착한다. 그 사이에 사용자가 글을
   * 고쳤다면 늦게 온 결과가 고친 글을 덮어써 버리므로, 손으로 고치는 순간 번호를
   * 올려 지난 세션의 결과를 흘려보낸다.
   */
  const dictationSessionRef = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  /** 받아쓰기를 시작한 시점에 이미 적혀 있던 글. 인식 결과는 이 뒤에 붙는다. */
  const baseRef = useRef("");
  const volumeRef = useRef(1);
  const answersRef = useRef<Record<number, string>>({});

  const item = exam.items[index];
  const slot = item.slot;
  const answer = answers[slot] ?? "";
  const elapsed = times[slot] ?? 0;
  const words = countEnglishWords(answer);
  const replaysLeft = MAX_REPLAYS - (replays[slot] ?? 0);
  const canReplay = phase === "answering" && replayLeftSec > 0 && replaysLeft > 0;

  answersRef.current = answers;
  volumeRef.current = volume;

  const speechAvailable = useMemo(() => isSpeechSynthesisSupported(), []);
  const micAvailable = useMemo(() => isSpeechRecognitionSupported(), []);

  useEffect(() => {
    setVolume(loadSettings().volume);
  }, []);

  /* ---------------------------------------------------------------- */
  /* 받아쓰기                                                          */
  /* ---------------------------------------------------------------- */

  const stopDictation = useCallback((mode: "flush" | "discard") => {
    const handle = dictationRef.current;
    dictationRef.current = null;
    setListening(false);
    setInterim("");
    if (!handle) return;
    if (mode === "discard") {
      // 버릴 때는 지난 세션 결과를 아예 받지 않는다
      dictationSessionRef.current += 1;
      handle.abort();
      return;
    }
    // 멈출 때는 말하던 마지막 문장까지 받아야 하므로 세션을 그대로 둔다
    handle.stop();
  }, []);

  /** 손으로 글을 고쳤다. 지난 받아쓰기 결과가 이 글을 덮어쓰지 못하게 한다. */
  const editAnswer = useCallback((targetSlot: number, text: string) => {
    dictationSessionRef.current += 1;
    baseRef.current = text;
    setAnswers((prev) => ({ ...prev, [targetSlot]: text }));
  }, []);

  const beginDictation = useCallback(
    (targetSlot: number) => {
      if (!isSpeechRecognitionSupported()) return;
      stopDictation("discard");
      setMicError(null);
      // 인식 결과는 늘 세션 전체가 통째로 온다. 시작할 때의 글을 기준으로 잡아 두고
      // 매번 덮어쓰면, 같은 결과가 두 번 와도 답변이 늘어나지 않는다.
      baseRef.current = answersRef.current[targetSlot] ?? "";
      const session = (dictationSessionRef.current += 1);
      const handle = startDictation({
        onUpdate: ({ committed, interim: pending }) => {
          if (dictationSessionRef.current !== session) return;
          setAnswers((prev) => ({
            ...prev,
            [targetSlot]: mergeTranscript(baseRef.current, committed),
          }));
          setInterim(pending);
        },
        onError: (code) => setMicError(micMessage(code)),
        onEnd: () => {
          if (dictationSessionRef.current !== session) return;
          setListening(false);
          setInterim("");
        },
      });
      if (!handle) {
        setMicError("이 브라우저에서는 음성 입력을 쓸 수 없습니다. 직접 입력으로 연습해 주세요.");
        return;
      }
      dictationRef.current = handle;
      setListening(true);
    },
    [stopDictation],
  );

  /* ---------------------------------------------------------------- */
  /* 질문 재생                                                         */
  /* ---------------------------------------------------------------- */

  const playQuestion = useCallback(
    (targetSlot: number, text: string, isReplay: boolean) => {
      stopDictation("flush");
      setReplayLeftSec(0);
      setProgress(0);
      setPhase("playing");
      if (isReplay) {
        setReplays((prev) => ({ ...prev, [targetSlot]: (prev[targetSlot] ?? 0) + 1 }));
      }

      const startAnswering = (replaysAfter: number) => {
        setProgress(1);
        setPhase("answering");
        setReplayLeftSec(replaysAfter < MAX_REPLAYS ? REPLAY_WINDOW_SEC : 0);
        if (!typing) beginDictation(targetSlot);
      };
      const used = (replays[targetSlot] ?? 0) + (isReplay ? 1 : 0);

      speak(text, {
        rate: SPEECH_RATE,
        volume: volumeRef.current,
        onEnd: () => startAnswering(used),
        onError: () => {
          setMicError(null);
          startAnswering(used);
        },
      });
    },
    [beginDictation, replays, stopDictation, typing],
  );

  /* 문항이 바뀌면 모두 처음 상태로 되돌린다. 실제 시험처럼 ▶ 를 눌러야 시작한다. */
  useEffect(() => {
    stopDictation("discard");
    stopSpeaking();
    setPhase("ready");
    setProgress(0);
    setReplayLeftSec(0);
    setReveal(null);
    setMicError(null);
    // 문항이 바뀔 때만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted]);

  useEffect(
    () => () => {
      dictationRef.current?.abort();
      stopSpeaking();
    },
    [],
  );

  /* 재생 진행 막대 */
  useEffect(() => {
    if (phase !== "playing") return;
    const total = estimateSpeechMs(item.question.en, SPEECH_RATE);
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(0.97, (Date.now() - startedAt) / total));
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, item.question.en]);

  /* 다시 듣기 5초 창 */
  useEffect(() => {
    if (replayLeftSec <= 0) return;
    const id = window.setTimeout(() => setReplayLeftSec((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [replayLeftSec]);

  /* 답변 시간은 질문이 끝난 뒤부터 잰다 */
  useEffect(() => {
    if (submitted || phase !== "answering") return;
    const id = window.setInterval(() => {
      setTimes((prev) => ({ ...prev, [slot]: (prev[slot] ?? 0) + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [slot, submitted, phase]);

  /* 받아쓴 글이 길어지면 아래쪽이 보이게 따라 내린다 */
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [answer, interim]);

  function goTo(next: number) {
    if (next === index) return;
    stopDictation("discard");
    stopSpeaking();
    setIndex(next);
  }

  function submit() {
    stopDictation("discard");
    stopSpeaking();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function holdReveal(kind: Reveal) {
    setReveal(kind);
    setHintUse((prev) => ({ ...prev, [slot]: (prev[slot] ?? 0) + 1 }));
  }

  /**
   * 손을 뗀 버튼이 자기 것만 닫게 한다.
   * 다른 힌트 버튼을 눌러 옮겨 갈 때, 먼저 눌렀던 버튼의 blur 가 방금 연 힌트를
   * 닫아 버리는 일을 막는다.
   */
  function releaseReveal(kind: Reveal) {
    setReveal((current) => (current === kind ? null : current));
  }

  if (submitted) {
    return (
      <ExamResult
        exam={exam}
        title={title}
        answers={answers}
        times={times}
        hintUse={hintUse}
        replays={replays}
        onRetry={() => {
          setSubmitted(false);
          setIndex(0);
          setPhase("ready");
        }}
        onRegenerate={onRegenerate}
      />
    );
  }

  const bannerText =
    phase === "playing"
      ? "질문을 듣는 중입니다"
      : phase === "ready"
        ? "Click 'PLAY' button to Listen"
        : canReplay
          ? `지금 답변하세요 · 다시 듣기 ${replayLeftSec}초`
          : "지금 답변하세요";

  const playLabel =
    phase === "playing" ? "재생 중" : phase === "ready" ? "질문 듣기" : "다시 듣기";

  const hints = item.question.hints ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Link href="/" className="text-sm text-fg-muted transition hover:text-fg">
          ← 홈
        </Link>
        <span className="text-xs text-fg-subtle">{title}</span>
      </div>

      {/* ── 응시 화면 ────────────────────────────────────────────── */}
      <div className="animate-fade-up overflow-hidden rounded-lg border border-exam-line bg-exam-frame text-exam-ink shadow-raised">
        <div className="px-4 py-5 sm:px-7 sm:py-6">
          <h1 className="text-base font-bold">
            Question {index + 1} of {exam.items.length}
          </h1>
          <div className="mt-3 border-t border-exam-line" />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,17rem)_auto_minmax(0,1fr)] lg:gap-6">
            {/* 면접관 + 재생 컨트롤 */}
            <div className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-none">
              <div className="aspect-square overflow-hidden border border-exam-line">
                <AvaAvatar speaking={phase === "playing"} />
              </div>

              <div className="flex items-stretch border-x border-b border-exam-line">
                <button
                  type="button"
                  onClick={() => playQuestion(slot, item.question.en, phase !== "ready")}
                  disabled={phase === "playing" || (phase === "answering" && !canReplay)}
                  aria-label={playLabel}
                  className="grid w-11 place-items-center bg-exam-accent text-exam-accent-fg transition-colors enabled:hover:bg-exam-accent-hover disabled:bg-exam-accent-soft"
                >
                  <PlayIcon />
                </button>
                <div className="flex flex-1 items-center bg-exam-frame-2 px-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-exam-line">
                    <div
                      className="h-full rounded-full bg-exam-accent transition-[width] duration-100"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <p
                aria-live="polite"
                className="border-x border-b border-exam-line bg-exam-note px-3 py-2 text-center text-xs font-semibold text-exam-note-fg"
              >
                {bannerText}
              </p>

              {!speechAvailable && (
                <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">
                  이 브라우저는 문제 읽어주기를 지원하지 않습니다. 아래 연습 도구에서 지문을 확인해 주세요.
                </p>
              )}
            </div>

            {/* 볼륨 · 마이크 표시 — 실제 화면의 세로 슬라이더 자리 */}
            <div className="flex flex-row items-center justify-center gap-4 lg:flex-col lg:gap-5">
              {/* 세로 슬라이더는 가로 슬라이더를 돌려서 만든다. 회전은 자리 크기를
                  바꾸지 않으므로 감싼 상자 안에 절대 위치로 띄워 가둔다. */}
              <div className="relative h-6 w-full lg:h-40 lg:w-6">
                <input
                  id="exam-volume"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(volume * 100)}
                  aria-label="문제 듣기 음량"
                  onChange={(e) => {
                    const next = Number(e.target.value) / 100;
                    setVolume(next);
                    saveSettings({ ...loadSettings(), volume: next });
                  }}
                  className="exam-volume absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 lg:w-40 lg:-rotate-90"
                />
              </div>
              <span
                title={listening ? "녹음 중" : "대기 중"}
                className={listening ? "text-exam-rec" : "text-exam-ink-muted"}
              >
                <MicGlyph className={listening ? "h-5 w-5 animate-rec-pulse" : "h-5 w-5"} />
              </span>
            </div>

            {/* 문항 진행 · 안내 · 답변 */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-exam-ink-muted">문항 진행:</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {exam.items.map((it, i) => {
                  const state = i < index ? "done" : i === index ? "active" : "todo";
                  return (
                    <button
                      key={it.slot}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={state === "active" ? "step" : undefined}
                      title={`${it.slot}번으로 이동`}
                      className={`h-7 w-8 border text-xs font-semibold tabular-nums transition ${
                        state === "active"
                          ? "border-exam-slot-active bg-exam-slot-active text-exam-slot-active-fg"
                          : state === "done"
                            ? "exam-slot-done border-exam-line text-exam-ink-muted"
                            : "border-exam-line bg-exam-slot text-exam-slot-fg"
                      }`}
                    >
                      {it.slot}
                    </button>
                  );
                })}
              </div>

              {/* 실제 시험도 이 안내는 1번 문항에서만 보여 준다 */}
              {index === 0 && (
                <div className="mt-4 bg-exam-note px-4 py-3 text-sm leading-relaxed text-exam-note-fg">
                  <p>
                    <strong className="font-bold">Play</strong> 아이콘(▶)을 눌러 질문을
                    청취하십시오.
                  </p>
                  <p className="mt-3">
                    <strong className="font-bold">중요!</strong> 5초 이내에 버튼을 누르면 질문
                    다시듣기가 가능하며, 재청취는 한번만 가능합니다.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* ── 연습 도구 ─────────────────────────────────────────
              실제 시험 화면에는 없는 것들이다. 기본은 접어 두고 눌러야 펼쳐진다. */}
          {tools && (
            <div className="mt-6 space-y-4 border-t border-dashed border-exam-line pt-4">
              {/* 답변 기록 */}
              <div className="mt-4 border border-exam-line">
                <div className="flex items-center justify-between gap-2 border-b border-exam-line bg-exam-frame-2 px-3 py-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    {listening ? (
                      <>
                        <span className="h-2 w-2 animate-rec-pulse rounded-full bg-exam-rec" />
                        녹음 중 · 말하는 대로 적힙니다
                      </>
                    ) : (
                      "내 답변"
                    )}
                  </span>
                  <span className="tabular-nums text-exam-ink-muted">
                    {words}단어 · {formatTime(elapsed)}
                  </span>
                </div>

                {typing ? (
                  <textarea
                    value={answer}
                    onChange={(e) => editAnswer(slot, e.target.value)}
                    rows={7}
                    spellCheck
                    placeholder="Well, let me tell you about..."
                    className="w-full resize-y bg-exam-frame px-3 py-3 text-sm leading-relaxed text-exam-ink outline-none placeholder:text-exam-ink-muted/70"
                  />
                ) : (
                  <div
                    ref={transcriptRef}
                    className="max-h-56 min-h-[7rem] overflow-y-auto px-3 py-3 text-sm leading-relaxed"
                  >
                    {answer || interim ? (
                      <p className="whitespace-pre-wrap">
                        {answer}
                        {interim && (
                          <span className="text-exam-ink-muted"> {interim}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-exam-ink-muted">
                        {phase === "answering"
                          ? "마이크에 대고 영어로 답해 보세요."
                          : "재생 버튼을 눌러 질문을 들으면 녹음이 시작됩니다."}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-exam-line bg-exam-frame-2 px-3 py-2">
                  {micAvailable && !typing && (
                    <button
                      type="button"
                      onClick={() =>
                        listening ? stopDictation("flush") : beginDictation(slot)
                      }
                      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition ${
                        listening
                          ? "border-exam-rec text-exam-rec"
                          : "border-exam-line text-exam-ink-muted hover:text-exam-ink"
                      }`}
                    >
                      <MicGlyph className="h-3.5 w-3.5" />
                      {listening ? "녹음 멈추기" : "다시 녹음하기"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!typing) stopDictation("flush");
                      setTyping((v) => !v);
                    }}
                    className="rounded border border-exam-line px-2.5 py-1 text-xs text-exam-ink-muted transition hover:text-exam-ink"
                  >
                    {typing ? "마이크로 돌아가기" : "직접 입력·고쳐 쓰기"}
                  </button>
                  {answer.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        stopDictation("discard");
                        editAnswer(slot, "");
                      }}
                      className="ml-auto rounded border border-exam-line px-2.5 py-1 text-xs text-exam-ink-muted transition hover:text-exam-ink"
                    >
                      지우기
                    </button>
                  )}
                </div>
              </div>

              {micError && (
                <p role="alert" className="mt-2 text-xs leading-relaxed text-exam-rec">
                  {micError}
                </p>
              )}
              {!micAvailable && (
                <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">
                  이 브라우저는 음성 입력을 지원하지 않습니다. 직접 입력으로 연습해 주세요.
                  Chrome이나 Edge에서 열면 마이크로 답할 수 있습니다.
                </p>
              )}

              <div className="h-24 overflow-y-auto rounded border border-exam-line bg-exam-frame-2 px-3 py-2.5 text-sm leading-relaxed">
                {reveal === "script" && (
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-exam-ink-muted">
                      <span className="font-semibold">{item.typeLabel}</span>
                      <span>
                        {item.emoji} {item.topicKo}
                      </span>
                      <SourceBadge source={item.question.source} />
                    </div>
                    <p>{item.question.en}</p>
                  </div>
                )}
                {reveal === "korean" && <p>{item.question.ko}</p>}
                {reveal === "keywords" && (
                  <ul className="flex flex-wrap gap-1.5">
                    {hints.map((hint) => (
                      <li
                        key={hint}
                        className="rounded border border-exam-line bg-exam-frame px-2 py-0.5 text-xs"
                      >
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}
                {reveal === null && (
                  <p className="text-xs text-exam-ink-muted">
                    실전처럼 듣기만으로 풀어 보세요. 막히면 아래 버튼을 꾹 누르고 있는 동안에만
                    지문이 보입니다.
                  </p>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <HoldButton label="지문 보기" active={reveal === "script"} onPress={() => holdReveal("script")} onRelease={() => releaseReveal("script")} />
                <HoldButton label="해석 보기" active={reveal === "korean"} onPress={() => holdReveal("korean")} onRelease={() => releaseReveal("korean")} />
                {hints.length > 0 && (
                  <HoldButton label="키워드 보기" active={reveal === "keywords"} onPress={() => holdReveal("keywords")} onRelease={() => releaseReveal("keywords")} />
                )}
                <span className="ml-auto self-center text-[11px] tabular-nums text-exam-ink-muted">
                  이 문항 힌트 {hintUse[slot] ?? 0}회 · 다시 듣기 {replays[slot] ?? 0}/{MAX_REPLAYS}회
                </span>
              </div>

            </div>
          )}

          {/* ── 이동 ────────────────────────────────────────────── */}
          <div className="mt-6 flex items-center gap-3 border-t border-exam-line pt-4">
            {/* 앞 문항으로 돌아갈 때는 위 번호판을 누른다. 실제 화면에 없는
                버튼을 늘리지 않으려고 따로 두지 않았다. */}
            <button
              type="button"
              aria-expanded={tools}
              onClick={() => setTools((v) => !v)}
              className="text-xs text-exam-ink-muted transition hover:text-exam-ink"
            >
              연습 도구 {tools ? "▴" : "▾"}
            </button>
            {index < exam.items.length - 1 ? (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="ml-auto rounded bg-exam-accent px-7 py-2.5 text-sm font-bold text-exam-accent-fg transition-colors hover:bg-exam-accent-hover"
              >
                Next ›
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="ml-auto rounded bg-exam-accent px-7 py-2.5 text-sm font-bold text-exam-accent-fg transition-colors hover:bg-exam-accent-hover"
              >
                답변 확인하기
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * 꾹 누르고 있는 동안에만 눌린 상태가 되는 버튼.
 * 포인터를 놓거나 손가락이 버튼 밖으로 나가면 바로 풀린다. 키보드는 스페이스·엔터를
 * 누르고 있는 동안 같은 동작을 한다.
 */
function HoldButton({
  label,
  active,
  onPress,
  onRelease,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onPointerDown={(e) => {
        // 지문이 펼쳐지면서 버튼이 밀려도 계속 누른 것으로 치도록 포인터를 붙잡는다.
        // 붙잡지 않으면 버튼이 손가락 아래에서 빠져나가며 pointerleave 가 떠 바로 닫힌다.
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onLostPointerCapture={onRelease}
      onBlur={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (!e.repeat) onPress();
      }}
      onKeyUp={(e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        onRelease();
      }}
      className={`hold-target rounded border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-exam-accent bg-exam-accent text-exam-accent-fg"
          : "border-exam-line text-exam-ink-muted hover:text-exam-ink"
      }`}
    >
      {label} (꾹)
    </button>
  );
}
