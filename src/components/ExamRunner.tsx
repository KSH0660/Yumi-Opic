"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam } from "@/lib/types";
import { countEnglishWords, hasAnswerText } from "@/lib/answers";
import {
  estimateSpeechMs,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
  startDictation,
  stopSpeaking,
  type DictationActivity,
  type DictationHandle,
} from "@/lib/speech";
import { requestScreenWakeLock, type WakeLockHandle } from "@/lib/wakeLock";
import {
  createMicProbe,
  isDesktopAgent,
  isMicConflict,
  loadMicMode,
  observeMicLevel,
  observeMicResult,
  resolveMicMode,
  saveMicMode,
  usesDictation,
  usesRecording,
  type MicFallback,
  type MicMode,
  type MicProbe,
  type ResolvedMicMode,
} from "@/lib/micShare";
import {
  buildVoiceAnalysis,
  createVad,
  observeVadLevel,
  vadSignals,
  CHUNK_GAP_MS,
  LONG_PAUSE_MS,
  type VadState,
  type VoiceAnalysis,
  type VoiceSignals,
} from "@/lib/voiceAnalysis";
import { probeTranscription, transcribeRecording, TranscribeError } from "@/lib/transcribeClient";
import { runInPool } from "@/lib/feedbackBatch";
import { itemNumber, parsePracticeTypeGroup } from "@/lib/exam";
import { recordFullExamQuestion } from "@/lib/storage";
import { topicById } from "@/data";
import { examExitLink, randomPracticeLink, typePracticeTitle } from "@/lib/nav";
import { joinTranscript } from "@/lib/transcript";
import AvaAvatar from "./AvaAvatar";
import MicLevelMeter from "./MicLevelMeter";
import ExamResult, { type AnswerRecording } from "./ExamResult";
import { SavedExpressionsPanel } from "./SavedExpressions";
import { SourceBadge } from "./ui";
import FixedPracticeNavigation from "./FixedPracticeNavigation";
import QuestionContextReveal from "./QuestionContextReveal";

/** 실전에 가까운 낭독 속도. */
const SPEECH_RATE = 0.92;
/** 실제 시험과 같이 재청취는 한 번만 허용한다. */
const MAX_REPLAYS = 1;
/** 낭독이 끝난 뒤 다시 듣기를 누를 수 있는 시간(초). */
const REPLAY_WINDOW_SEC = 5;
/** 기록은 결과 화면에서 처음 저장된다. 그전에 나가면 답변이 남지 않는다. */
const LEAVE_CONFIRM = "아직 저장하지 않은 답변이 있습니다. 지금 나가면 이 회차의 답변과 녹음이 사라집니다. 나갈까요?";
/** 마칠 때 한 번에 글로 옮길 녹음본 수. 한 문항에 몇 초가 걸려 차례로만 보내면 너무 오래 기다린다. */
const TRANSCRIBE_CONCURRENCY = 3;
/** 녹음을 멈춘 뒤 `onstop` 을 기다려 보는 시간. 이보다 늦으면 기다리지 않고 넘어간다. */
const RECORDER_STOP_TIMEOUT_MS = 3_000;

type Phase = "ready" | "playing" | "answering";
type Reveal = "script" | "korean" | "keywords";

interface AudioSession {
  slot: number;
  recorder: MediaRecorder;
  stream: MediaStream;
  context: AudioContext;
  analyser: AnalyserNode;
  chunks: Blob[];
  frame: number;
  saveOnStop: boolean;
  /** 녹음을 마치는 대로 글로 옮길지. 받아쓰기 없이 녹음만 하는 문항이 그렇다. */
  autoTranscribe: boolean;
  /**
   * 녹음만 하는 기기에서 입력 레벨로 말한 구간을 가르는 저울.
   * 받아쓰기가 함께 도는 기기는 낱말이 늘어나는 간격으로 재므로 null 이다.
   */
  vad: VadState | null;
  /** 녹음이 멈추고 녹음본 저장까지 끝났을 때 풀린다. 마칠 때 이것을 기다린다. */
  stopped: Promise<void>;
  resolveStopped: () => void;
}

interface VoiceAnalysisSession {
  slot: number;
  startedAt: number;
  lastSpeechAt: number;
  transcript: string;
  longPauseCount: number;
  currentChunkWords: number;
  chunkWordCounts: number[];
  cadenceSamples: number[];
  energySamples: number[];
  lastEnergySampleAt: number;
  completion: Promise<void>;
  resolveCompletion: () => void;
}

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
  if (code === "start-blocked")
    return "이 브라우저는 버튼을 누른 직후에만 받아쓰기를 켤 수 있습니다. 마이크 아래 받아쓰기 다시 켜기를 눌러 주세요.";
  if (code === "mic-silent")
    return "받아쓰기가 마이크를 열지 못했습니다. 통화·녹음처럼 마이크를 쓰는 다른 앱을 닫고, 마이크 아래 받아쓰기 다시 켜기를 눌러 주세요.";
  if (code === "restart-limit")
    return "음성 인식이 한 글자도 받지 못한 채 계속 끊깁니다. 받아쓰기 다시 켜기를 누르거나 직접 입력으로 바꿔 주세요.";
  return "음성 인식이 잠시 멈췄습니다. 받아쓰기 다시 켜기를 누르거나 직접 입력으로 바꿔 주세요.";
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

/** 첫 청취 뒤 실제 시험처럼 보이는 원형 화살표 + 재생 아이콘. */
function ReplayIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 9.5A9.5 9.5 0 1 0 23 18" />
      <path d="M18.5 5.5h5v5" />
      <path d="M11.5 9.5v9l7-4.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MicGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

/**
 * 이 브라우저가 녹음할 형식.
 *
 * 사파리(iOS·macOS)는 webm 을 만들지 못하고 mp4(AAC)로 녹음한다. 후보에 넣지 않으면
 * 기본 생성자로 떨어져 형식을 브라우저가 알아서 정하는데, 그러면 어떤 파일을 손에 쥐고
 * 있는지 모른 채 이름만 `.webm` 으로 붙여 보내게 된다. 형식은 우리가 정해 둔다.
 */
function preferredRecordingMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return candidates.find((mime) => MediaRecorder.isTypeSupported?.(mime));
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
  const isTopicPractice = exam.mode === "practice";
  const isTypePractice = exam.mode === "type";
  // 주제별·유형별 연습은 둘 다 원하는 문항만 골라 풀고 음성 분석도 함께 본다.
  const isPractice = isTopicPractice || isTypePractice;
  const fixedPracticeSets = isTopicPractice ? topicById.get(exam.focusTopicId ?? "")?.fixedPracticeSets : undefined;
  const isFixedPractice = !!fixedPracticeSets;
  const [index, setIndex] = useState(0);
  const exposureAttemptRef = useRef(exam.id);
  const exposedSlotsRef = useRef(new Set<number>());
  const rememberQuestion = useCallback((targetSlot: number) => {
    if (exposedSlotsRef.current.has(targetSlot)) return;
    const entry = exam.items.find(entry => entry.slot === targetSlot);
    if (!entry) return;
    recordFullExamQuestion(exam, entry.question, exposureAttemptRef.current);
    exposedSlotsRef.current.add(targetSlot);
  }, [exam]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const [replays, setReplays] = useState<Record<number, number>>({});
  const [hintUse, setHintUse] = useState<Record<number, number>>({});
  const [recordings, setRecordings] = useState<Record<number, AnswerRecording>>({});
  const [voiceAnalyses, setVoiceAnalyses] = useState<Record<number, VoiceAnalysis>>({});
  const [analyzingSlot, setAnalyzingSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const [replayLeftSec, setReplayLeftSec] = useState(0);
  /** 낭독 파일의 실제 길이(ms). mp3 를 틀 때만 채워지고, 없으면 어림값을 쓴다. */
  const [speechMs, setSpeechMs] = useState(0);

  const [listening, setListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  /** 오류는 아니고 마이크를 지금 어떻게 쓰고 있는지 알리는 안내. */
  const [micNotice, setMicNotice] = useState<string | null>(null);
  /** 이 기기에서 답변을 어떻게 받는지. 서버에 그린 첫 화면과 맞추려고 share 로 시작한다. */
  const [micMode, setMicMode] = useState<MicMode>("share");
  /** 고른 모드를 그대로 쓸 수 없어 다른 모드로 내려왔다면 그 까닭. */
  const [micFallback, setMicFallback] = useState<MicFallback | null>(null);
  /** 지금 녹음본을 글로 옮기고 있는 문항. */
  const [transcribingSlots, setTranscribingSlots] = useState<ReadonlySet<number>>(() => new Set());
  /** 문항별 전사 실패 안내. 다시 녹음하거나 결과 화면에서 다시 시도할 수 있다. */
  const [transcribeErrors, setTranscribeErrors] = useState<Record<number, string>>({});
  /** 연습을 마치며 남은 녹음본을 한꺼번에 옮기는 동안의 진행 상황. */
  const [transcribeBatch, setTranscribeBatch] = useState<{ done: number; total: number } | null>(null);
  /**
   * 받아쓰기가 실제로 돌고 있는지. `listening` 은 녹음만 켜진 경우에도 참이라
   * 「말하면 글자가 남는가」를 가리지 못한다.
   */
  const [dictating, setDictating] = useState(false);
  /** 인식기가 지금 무엇을 하고 있는지. 입력 레벨을 못 재는 휴대폰의 유일한 단서다. */
  const [micActivity, setMicActivity] = useState<DictationActivity | null>(null);
  const [typing, setTyping] = useState(false);

  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [tools, setTools] = useState(false);

  const dictationRef = useRef<DictationHandle | null>(null);
  const dictationSessionRef = useRef(0);
  const voiceAnalysisSessionRef = useRef<VoiceAnalysisSession | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef("");
  const answersRef = useRef<Record<number, string>>({});
  const audioRef = useRef<AudioSession | null>(null);
  const audioTokenRef = useRef(0);
  const micModeRef = useRef<MicMode>("share");
  /** 사용자가 고른(또는 이 기기의 기본) 모드. 실제로 쓰는 모드는 여기서 내려올 수 있다. */
  const requestedModeRef = useRef<MicMode>("share");
  /** 이 기기에서 실제로 할 수 있는 것. 전사 가능 여부는 서버에 물어 채운다. */
  const capsRef = useRef({ dictation: false, recording: false, transcription: false });
  /** 함께 켜 본 뒤 받아쓰기가 소리를 못 받고 있는지 지켜보는 저울. */
  const probeRef = useRef<MicProbe | null>(null);
  /** 녹음만 하는 기기에서 문항별로 재어 둔 말하기 신호. 전사가 오면 음성 분석이 된다. */
  const voiceSignalsRef = useRef<Record<number, VoiceSignals>>({});
  /** 문항마다 지금 살아 있는 녹음의 번호. 다시 녹음하면 앞 녹음의 전사 결과를 버린다. */
  const transcribeTokenRef = useRef<Record<number, number>>({});
  /** 지금 돌고 있는 전사. 연습을 마칠 때 이것부터 기다린다. */
  const transcribePendingRef = useRef(new Map<number, Promise<void>>());
  /** 직접 고쳐 쓴 문항. 뒤늦게 도착한 전사가 사용자의 글을 덮지 않게 한다. */
  const typedSlotsRef = useRef(new Set<number>());
  /** 이미 실패한 문항은 마칠 때 다시 보내지 않는다. 결과 화면에서 직접 다시 시도한다. */
  const transcribeErrorsRef = useRef<Record<number, string>>({});
  /**
   * 녹음이 곧 답변인 문항. 마칠 때 남은 녹음본을 옮기는 것은 이 문항들뿐이다.
   *
   * 받아쓰기가 함께 돈 문항(노트북)은 받아쓰기가 빈손이어도 여기 들어오지 않는다.
   * 묻지도 않고 녹음을 서버로 보내 값을 쓰지 않기 위해서다. 그런 문항은 결과 화면에서
   * 사용자가 직접 `녹음본 글로 옮기기` 를 누를 수 있다.
   */
  const autoTranscribeSlotsRef = useRef(new Set<number>());
  const recordingsRef = useRef<Record<number, AnswerRecording>>({});
  /** 낭독을 시작한 시각. 길이가 뒤늦게 와도 진행 막대의 기준점은 여기로 고정한다. */
  const playStartedAtRef = useRef(0);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);

  const item = exam.items[index];
  const slot = item.slot;
  const isSurprisePractice = isTopicPractice && item.question.source === "provided";
  const answer = answers[slot] ?? "";
  /** 질문이 나오는 동안에는 답변 시간을 세지 않는다. 음성이 끝나면 0:00 부터 다시 센다. */
  const elapsed = phase === "playing" ? 0 : times[slot] ?? 0;
  const words = countEnglishWords(answer);
  const voiceAnalysis = voiceAnalyses[slot];
  const replaysLeft = MAX_REPLAYS - (replays[slot] ?? 0);
  const canReplay = phase === "answering" && replayLeftSec > 0 && replaysLeft > 0;

  answersRef.current = answers;
  recordingsRef.current = recordings;
  transcribeErrorsRef.current = transcribeErrors;

  const exit = useMemo(() => examExitLink(exam.mode), [exam.mode]);
  const typeGroup = useMemo(() => parsePracticeTypeGroup(exam.typeGroupId), [exam.typeGroupId]);
  /** 답변은 결과 화면에 닿아야 저장된다. 그 전에 나가면 말한 내용이 사라진다. */
  const unsaved = !submitted && exam.items.some((entry) => hasAnswerText(answers[entry.slot]) || recordings[entry.slot]);

  // 새로고침·창 닫기에는 브라우저 기본 확인창이 뜬다. 화면 안의 나가기 링크는 아래에서 따로 묻는다.
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const speechAvailable = useMemo(() => isSpeechSynthesisSupported(), []);
  const micAvailable = useMemo(() => isSpeechRecognitionSupported(), []);
  const recordingAvailable = useMemo(
    () => typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined",
    [],
  );

  const applyResolvedMode = useCallback((resolved: ResolvedMicMode) => {
    // 다음 그림을 기다리지 않고 바로 읽는 자리가 있어 ref 도 함께 옮긴다.
    micModeRef.current = resolved.mode;
    setMicMode(resolved.mode);
    setMicFallback(resolved.fallback);
  }, []);

  /** 지금 알고 있는 것으로 실제로 쓸 모드를 다시 정한다. */
  const settleMicMode = useCallback((requested: MicMode) => {
    requestedModeRef.current = requested;
    applyResolvedMode(resolveMicMode(requested, capsRef.current));
  }, [applyResolvedMode]);

  /** 사용자가 고른 모드. 다음 연습에도 쓰도록 남긴다. */
  const chooseMicMode = useCallback((mode: MicMode) => {
    saveMicMode(mode);
    settleMicMode(mode);
  }, [settleMicMode]);

  /*
   * 이 기기에서 무엇을 할 수 있는지는 브라우저에서만 알 수 있다. 서버에서 그린 첫
   * 화면과 어긋나지 않도록 붙은 뒤에 읽는다.
   *
   * 녹음만 켜는 모드는 서버 전사가 살아 있어야 답변이 글로 남는다. 답을 듣기 전에는
   * 없는 셈 치고 받아쓰기 쪽에 붙여 두었다가, 된다는 답이 오면 그때 녹음으로 올린다.
   * 질문을 듣고 답변이 시작되기까지 몇 초가 있어 첫 문항부터 녹음으로 도는 것이 보통이고,
   * 늦어져도 그 문항만 받아쓰기로 받을 뿐 답변을 잃지는 않는다.
   */
  useEffect(() => {
    const requested = loadMicMode();
    capsRef.current = {
      dictation: isSpeechRecognitionSupported(),
      recording: recordingAvailable,
      transcription: false,
    };
    settleMicMode(requested);
    // 고른 모드와 상관없이 한 번 물어본다. 받아쓰기로 시작한 기기도 도중에 녹음으로
    // 바꿀 수 있고, 마이크를 뺏긴 것을 알아챘을 때 어느 쪽을 살릴지도 이 답에 달렸다.
    const controller = new AbortController();
    let alive = true;
    void probeTranscription(controller.signal).then((available) => {
      if (!alive || !available) return;
      capsRef.current = { ...capsRef.current, transcription: true };
      settleMicMode(requested);
    });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [recordingAvailable, settleMicMode]);

  const disposeAudioSession = useCallback((session: AudioSession) => {
    window.cancelAnimationFrame(session.frame);
    session.stream.getTracks().forEach((track) => track.stop());
    void session.context.close().catch(() => undefined);
    setMicLevel(0);
  }, []);

  const finishVoiceAnalysis = useCallback((targetSlot: number) => {
    const session = voiceAnalysisSessionRef.current;
    if (!session || session.slot !== targetSlot) return;
    voiceAnalysisSessionRef.current = null;
    setAnalyzingSlot((current) => current === targetSlot ? null : current);
    const chunkWords = session.currentChunkWords > 0
      ? [...session.chunkWordCounts, session.currentChunkWords]
      : session.chunkWordCounts;
    const analysis = buildVoiceAnalysis(session.transcript, {
      speakingTimeSec: (Date.now() - session.startedAt) / 1_000,
      longPauseCount: session.longPauseCount,
      chunks: { kind: "words", values: chunkWords },
      cadenceSamples: session.cadenceSamples,
      energySamples: session.energySamples,
    });
    if (analysis) setVoiceAnalyses((current) => ({ ...current, [targetSlot]: analysis }));
    session.resolveCompletion();
  }, []);

  /** 녹음만 하는 기기의 음성 분석. 텍스트가 없으면 잴 수 없어 전사가 도착한 뒤에 만든다. */
  const applyRecordedVoiceAnalysis = useCallback((targetSlot: number, transcript: string) => {
    const signals = voiceSignalsRef.current[targetSlot];
    if (!signals) return;
    const analysis = buildVoiceAnalysis(transcript, signals);
    if (analysis) setVoiceAnalyses((current) => ({ ...current, [targetSlot]: analysis }));
  }, []);

  /** 전사가 도착했다. 녹음만 하는 기기는 답변 텍스트와 음성 분석이 여기서 생긴다. */
  const applyTranscript = useCallback((targetSlot: number, text: string) => {
    // 직접 고쳐 쓴 문항은 사용자의 글이 정본이다. 늦게 온 전사가 그것을 덮지 않는다.
    if (typedSlotsRef.current.has(targetSlot)) return;
    setAnswers((prev) => ({ ...prev, [targetSlot]: text }));
    applyRecordedVoiceAnalysis(targetSlot, text);
  }, [applyRecordedVoiceAnalysis]);

  /**
   * 전사를 쓸 수 없게 됐다. 남은 문항은 받아쓰기로 받는다.
   *
   * 녹음만 켜 둔 채로 계속 가면 남은 문항은 소리만 남고 글이 하나도 남지 않는다.
   * 덜 정확해도 글이 남는 쪽이 연습이 된다.
   */
  const fallBackToDictation = useCallback(() => {
    if (!capsRef.current.transcription) return;
    capsRef.current = { ...capsRef.current, transcription: false };
    settleMicMode(requestedModeRef.current);
  }, [settleMicMode]);

  /**
   * 녹음본 하나를 글로 옮긴다.
   *
   * 녹음만 하는 기기에서는 이것이 답변이 텍스트로 남는 유일한 길이다. 그래서 문항을
   * 마치는 대로 곧바로 시작해 두고, 연습을 마칠 때는 아직 안 끝난 것만 기다린다.
   */
  const startTranscription = useCallback((targetSlot: number, recording: AnswerRecording): Promise<void> => {
    const token = transcribeTokenRef.current[targetSlot] ?? 0;
    setTranscribingSlots((current) => new Set(current).add(targetSlot));
    setTranscribeErrors((current) => {
      if (!(targetSlot in current)) return current;
      const next = { ...current };
      delete next[targetSlot];
      return next;
    });

    const run = (async () => {
      try {
        const text = await transcribeRecording(recording, targetSlot);
        // 그 사이 이 문항을 다시 녹음했다. 지난 녹음의 결과는 버린다.
        if (transcribeTokenRef.current[targetSlot] !== token) return;
        if (!text) {
          setTranscribeErrors((current) => ({
            ...current,
            [targetSlot]: "녹음본에서 말소리를 찾지 못했습니다. 다시 녹음하거나 직접 입력해 주세요.",
          }));
          return;
        }
        applyTranscript(targetSlot, text);
      } catch (error) {
        if (transcribeTokenRef.current[targetSlot] !== token) return;
        const message = error instanceof TranscribeError
          ? error.message
          : "녹음본을 글로 옮기지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
        setTranscribeErrors((current) => ({ ...current, [targetSlot]: message }));
        // 키가 없거나 연결이 끊겼다. 남은 문항은 받아쓰기로 받아 답변을 잃지 않게 한다.
        if (error instanceof TranscribeError && error.stopsBatch) fallBackToDictation();
      } finally {
        transcribePendingRef.current.delete(targetSlot);
        setTranscribingSlots((current) => {
          if (!current.has(targetSlot)) return current;
          const next = new Set(current);
          next.delete(targetSlot);
          return next;
        });
      }
    })();
    transcribePendingRef.current.set(targetSlot, run);
    return run;
  }, [applyTranscript, fallBackToDictation]);

  const stopAudioCapture = useCallback((save: boolean): Promise<void> => {
    audioTokenRef.current += 1;
    probeRef.current = null;
    const session = audioRef.current;
    audioRef.current = null;
    setMicLevel(0);
    if (!session) return Promise.resolve();
    session.saveOnStop = save;
    if (session.recorder.state !== "inactive") {
      // onstop 이 녹음본을 저장하고 전사를 띄운 뒤 이 약속을 푼다.
      session.recorder.stop();
    } else {
      disposeAudioSession(session);
      session.resolveStopped();
    }
    // onstop 이 끝내 오지 않는 기기가 있어도 결과 화면으로 넘어가지 못하는 일은 없어야 한다.
    // 250ms 마다 조각을 받아 두므로 이만큼 기다렸는데 안 오면 더 기다려도 오지 않는다.
    return Promise.race([
      session.stopped,
      new Promise<void>((resolve) => { window.setTimeout(resolve, RECORDER_STOP_TIMEOUT_MS); }),
    ]);
  }, [disposeAudioSession]);

  const stopDictation = useCallback((mode: "flush" | "discard") => {
    const handle = dictationRef.current;
    dictationRef.current = null;
    setListening(false);
    setDictating(false);
    setMicActivity(null);
    setInterim("");
    if (!handle) return;
    if (mode === "discard") {
      dictationSessionRef.current += 1;
      voiceAnalysisSessionRef.current?.resolveCompletion();
      voiceAnalysisSessionRef.current = null;
      setAnalyzingSlot(null);
      handle.abort();
      return;
    }
    handle.stop();
  }, []);

  /**
   * 받아쓰기만 새로 켠다. 녹음과 따로 떼어 두어야 마이크를 뺏긴 것을 알아챈 뒤
   * 녹음만 접고 받아쓰기를 이어서 켤 수 있다.
   */
  const startDictationFor = useCallback((targetSlot: number): boolean => {
    if (!isSpeechRecognitionSupported()) return false;
    const previous = dictationRef.current;
    dictationRef.current = null;
    // 번호를 먼저 올려 두면 지금 끊는 인식기의 늦은 결과가 새 세션에 섞이지 않는다.
    const session = (dictationSessionRef.current += 1);
    previous?.abort();

    baseRef.current = answersRef.current[targetSlot] ?? "";
    setInterim("");
    if (isPractice && voiceAnalysisSessionRef.current?.slot !== targetSlot) {
      let resolveCompletion: () => void = () => undefined;
      const completion = new Promise<void>((resolve) => { resolveCompletion = resolve; });
      voiceAnalysisSessionRef.current = {
        slot: targetSlot,
        startedAt: Date.now(),
        lastSpeechAt: 0,
        transcript: baseRef.current,
        longPauseCount: 0,
        currentChunkWords: 0,
        chunkWordCounts: [],
        cadenceSamples: [],
        energySamples: [],
        lastEnergySampleAt: 0,
        completion,
        resolveCompletion,
      };
      setAnalyzingSlot(targetSlot);
    }

    const handle = startDictation({
      onUpdate: ({ committed, interim: pending }) => {
        if (dictationSessionRef.current !== session) return;
        // 한 글자라도 왔으면 이 기기는 받아쓰기와 녹음을 함께 쓸 수 있다.
        if (probeRef.current && (committed || pending)) {
          probeRef.current = observeMicResult(probeRef.current);
        }
        const transcript = joinTranscript(baseRef.current, joinTranscript(committed, pending));
        const analysisSession = voiceAnalysisSessionRef.current;
        if (analysisSession?.slot === targetSlot && transcript !== analysisSession.transcript) {
          const now = Date.now();
          const previousWords = countEnglishWords(analysisSession.transcript);
          const nextWords = countEnglishWords(transcript);
          const addedWords = Math.max(0, nextWords - previousWords);
          if (analysisSession.lastSpeechAt > 0) {
            const gap = now - analysisSession.lastSpeechAt;
            if (gap >= LONG_PAUSE_MS) analysisSession.longPauseCount += 1;
            if (gap >= CHUNK_GAP_MS && analysisSession.currentChunkWords > 0) {
              analysisSession.chunkWordCounts.push(analysisSession.currentChunkWords);
              analysisSession.currentChunkWords = 0;
            }
            if (addedWords > 0 && gap >= 250) {
              analysisSession.cadenceSamples.push(addedWords / (gap / 1_000));
            }
          }
          analysisSession.currentChunkWords += addedWords;
          analysisSession.lastSpeechAt = now;
          analysisSession.transcript = transcript;
        }
        setAnswers((prev) => ({
          ...prev,
          [targetSlot]: joinTranscript(baseRef.current, committed),
        }));
        setInterim(pending);
      },
      onActivity: (next) => {
        if (dictationSessionRef.current !== session) return;
        setMicActivity(next);
        // 마이크가 열렸다면 앞서 알린 「마이크를 열지 못했다」는 지난 이야기다.
        if (next === "listening" || next === "speaking") setMicError(null);
      },
      onError: (code) => setMicError(micMessage(code)),
      onEnd: () => {
        if (dictationSessionRef.current !== session) return;
        setListening(false);
        setDictating(false);
        setMicActivity(null);
        setInterim("");
        finishVoiceAnalysis(targetSlot);
      },
    });

    if (!handle) {
      // 인식기는 있는데 시작이 막혔다. 버튼을 누른 직후에만 켤 수 있는 브라우저다.
      if (voiceAnalysisSessionRef.current?.slot === targetSlot) {
        voiceAnalysisSessionRef.current.resolveCompletion();
        voiceAnalysisSessionRef.current = null;
        setAnalyzingSlot(null);
      }
      setMicError(micMessage("start-blocked"));
      setDictating(false);
      setMicActivity(null);
      return false;
    }
    dictationRef.current = handle;
    setListening(true);
    setDictating(true);
    setMicActivity("starting");
    return true;
  }, [finishVoiceAnalysis, isPractice]);

  /**
   * 녹음이 마이크를 쥐는 바람에 받아쓰기가 한 글자도 못 받고 있다. 이 기기는 마이크를
   * 한 곳에서만 쓴다는 뜻이므로 둘 중 하나를 접어야 한다.
   *
   * 전사를 쓸 수 있으면 **녹음 쪽을 살린다.** 지금 마이크를 쥐고 있는 것이 녹음이라 다시
   * 켤 것도 없고, 답변 텍스트도 전사 쪽이 더 정확하다. 전사를 쓸 수 없을 때만 예전처럼
   * 녹음을 접고 받아쓰기를 다시 켠다. 그때는 받아쓰기가 답변을 남기는 유일한 길이다.
   */
  const handleMicConflict = useCallback((targetSlot: number) => {
    probeRef.current = null;
    if (capsRef.current.transcription) {
      chooseMicMode("recording-only");
      stopDictation("discard");
      transcribeTokenRef.current[targetSlot] = (transcribeTokenRef.current[targetSlot] ?? 0) + 1;
      typedSlotsRef.current.delete(targetSlot);
      const session = audioRef.current;
      if (session?.slot === targetSlot) {
        session.autoTranscribe = true;
        // 말한 구간은 여기서부터라도 잰다. 앞부분은 놓치지만 없는 것보다 낫다.
        session.vad ??= createVad(performance.now());
      }
      setListening(true);
      setMicNotice("이 기기는 마이크를 한 곳에서만 쓸 수 있습니다. 녹음을 살리고, 답변은 녹음본을 글로 옮겨 만듭니다.");
      return;
    }
    chooseMicMode("dictation-only");
    stopAudioCapture(false);
    startDictationFor(targetSlot);
    setMicNotice("녹음이 마이크를 쥐고 있어 받아쓰기가 한 글자도 받지 못했습니다. 녹음을 끄고 받아쓰기를 다시 켰습니다.");
  }, [chooseMicMode, startDictationFor, stopAudioCapture, stopDictation]);

  const beginAudioCapture = useCallback(async (targetSlot: number, autoTranscribe: boolean) => {
    if (!recordingAvailable) return;
    stopAudioCapture(false);
    const token = ++audioTokenRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioTokenRef.current !== token) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      context.createMediaStreamSource(stream).connect(analyser);

      const mimeType = preferredRecordingMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      let resolveStopped: () => void = () => undefined;
      const stopped = new Promise<void>((resolve) => { resolveStopped = resolve; });
      const session: AudioSession = {
        slot: targetSlot,
        recorder,
        stream,
        context,
        analyser,
        chunks: [],
        frame: 0,
        saveOnStop: false,
        autoTranscribe,
        // 받아쓰기가 없으면 말한 구간을 입력 레벨로 가른다. 있으면 낱말이 늘어나는
        // 간격으로 재는 쪽이 정확하므로 켜지 않는다.
        vad: autoTranscribe ? createVad(performance.now()) : null,
        stopped,
        resolveStopped,
      };
      audioRef.current = session;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) session.chunks.push(event.data);
      };
      recorder.onstop = () => {
        disposeAudioSession(session);
        if (session.vad) voiceSignalsRef.current[session.slot] = vadSignals(session.vad, performance.now());
        if (!session.saveOnStop || session.chunks.length === 0) {
          session.resolveStopped();
          return;
        }
        const blob = new Blob(session.chunks, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const recording: AnswerRecording = { url, mimeType: blob.type };
        setRecordings((prev) => {
          const old = prev[session.slot];
          if (old) URL.revokeObjectURL(old.url);
          return { ...prev, [session.slot]: recording };
        });
        // 이 녹음이 곧 답변인 문항이다. 결과 화면까지 미루지 않고 지금 글로 옮긴다.
        if (session.autoTranscribe) {
          autoTranscribeSlotsRef.current.add(session.slot);
          void startTranscription(session.slot, recording);
        }
        session.resolveStopped();
      };

      const samples = new Uint8Array(analyser.fftSize);
      let smoothedLevel = 0;
      let lastFrameAt = performance.now();
      const draw = () => {
        if (audioRef.current !== session) return;
        analyser.getByteTimeDomainData(samples);
        let squareSum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          squareSum += normalized * normalized;
        }
        const rms = Math.sqrt(squareSum / samples.length);
        // 일반적인 대화 음성의 RMS 범위를 세로 미터 전체에 자연스럽게 펼친다.
        const now = performance.now();
        const frameSec = (now - lastFrameAt) / 1000;
        lastFrameAt = now;
        const targetLevel = Math.min(1, Math.max(0, (rms - 0.01) * 7.5));
        const analysisSession = voiceAnalysisSessionRef.current;
        if (analysisSession?.slot === session.slot && targetLevel > 0.03 && now - analysisSession.lastEnergySampleAt >= 100) {
          analysisSession.energySamples.push(targetLevel);
          analysisSession.lastEnergySampleAt = now;
        }
        // 받아쓰기가 없는 문항은 이 레벨이 말의 흐름을 재는 유일한 단서다.
        if (session.vad) session.vad = observeVadLevel(session.vad, targetLevel, now);

        // 소리는 이만큼 들어오는데 받아쓰기가 한 글자도 없다면 이 녹음이 마이크를
        // 쥐고 있는 것이다. 그때는 녹음을 접고 받아쓰기에 마이크를 넘긴다.
        const probe = probeRef.current;
        if (probe) {
          probeRef.current = observeMicLevel(probe, targetLevel, now);
          if (isMicConflict(probeRef.current)) {
            handleMicConflict(session.slot);
            return;
          }
        }

        smoothedLevel += (targetLevel - smoothedLevel) * (1 - Math.exp(-frameSec / 0.08));
        setMicLevel(smoothedLevel);
        session.frame = window.requestAnimationFrame(draw);
      };

      // 받아쓰기가 실제로 돌고 있을 때만, 정말 함께 쓸 수 있는 기기인지 지켜본다.
      // 받아쓰기가 없는데 지켜보면 소리만 듣고 애먼 녹음을 끄게 된다. 데스크톱은
      // 둘을 함께 열어 주므로 지켜보지 않는다. 그곳에서 받아쓰기가 비는 까닭은 녹음이 아니다.
      probeRef.current = dictationRef.current && !isDesktopAgent(navigator) ? createMicProbe(performance.now()) : null;
      recorder.start(250);
      draw();
    } catch {
      if (audioTokenRef.current !== token) return;
      setMicError(autoTranscribe
        // 녹음이 곧 답변인 기기다. 녹음이 안 열리면 이 문항은 아무것도 남지 않는다.
        ? "마이크를 열지 못했습니다. 주소창의 자물쇠 아이콘에서 마이크를 허용한 뒤 다시 녹음해 주세요."
        : "마이크 녹음 권한을 확인해 주세요. 음성 인식은 되더라도 녹음본 저장이 제한될 수 있습니다.");
    }
  }, [disposeAudioSession, handleMicConflict, recordingAvailable, startTranscription, stopAudioCapture]);

  const stopAnswerCapture = useCallback((mode: "save" | "discard"): Promise<void> => {
    const analysisSession = voiceAnalysisSessionRef.current;
    stopDictation(mode === "save" ? "flush" : "discard");
    // 녹음본 저장과 전사 시작은 recorder.onstop 에서 일어난다. 마칠 때 그 전에 넘어가면
    // 마지막 문항의 답변이 통째로 빠지므로 이 약속을 함께 기다린다.
    const audioStopped = stopAudioCapture(mode === "save");
    if (!analysisSession) return audioStopped;
    if (mode === "discard") {
      if (voiceAnalysisSessionRef.current === analysisSession) {
        analysisSession.resolveCompletion();
        voiceAnalysisSessionRef.current = null;
        setAnalyzingSlot(null);
      }
      return audioStopped;
    }
    const analysisDone = new Promise<void>((resolve) => {
      const fallback = window.setTimeout(() => {
        if (voiceAnalysisSessionRef.current === analysisSession) finishVoiceAnalysis(analysisSession.slot);
        resolve();
      }, 1_500);
      void analysisSession.completion.then(() => {
        window.clearTimeout(fallback);
        resolve();
      });
    });
    return Promise.all([audioStopped, analysisDone]).then(() => undefined);
  }, [finishVoiceAnalysis, stopAudioCapture, stopDictation]);

  const editAnswer = useCallback((targetSlot: number, text: string) => {
    dictationSessionRef.current += 1;
    baseRef.current = text;
    // 직접 쓴 글이 이 문항의 정본이다. 늦게 도착한 전사가 이것을 덮지 않는다.
    typedSlotsRef.current.add(targetSlot);
    setAnswers((prev) => ({ ...prev, [targetSlot]: text }));
  }, []);

  const beginAnswerCapture = useCallback((targetSlot: number) => {
    stopAnswerCapture("discard");
    setMicError(null);

    // 위의 `dictating` 상태와 다르다. 저쪽은 지금 돌고 있는지, 이쪽은 이 브라우저가
    // 받아쓰기를 할 수 있는지다.
    const canDictate = isSpeechRecognitionSupported();
    const mode = micModeRef.current;
    // 녹음만 켜는 모드에서는 받아쓰기를 열지 않는다. 마이크를 한 곳에서만 쓰는 기기에서
    // 둘을 함께 열면 나중에 연 쪽이 마이크를 가져간다.
    const dictationOn = canDictate && usesDictation(mode) ? startDictationFor(targetSlot) : false;
    if (!dictationOn) baseRef.current = answersRef.current[targetSlot] ?? "";

    // 받아쓰기가 아예 없는 브라우저라면 모드와 상관없이 녹음이라도 남긴다.
    const recordingOn = recordingAvailable && (usesRecording(mode) || !canDictate);
    // 이 문항은 녹음이 곧 답변이다. 멈추는 대로 글로 옮겨야 기록에 남는다.
    const autoTranscribe = recordingOn && mode === "recording-only" && capsRef.current.transcription;
    if (autoTranscribe) {
      // 다시 녹음하면 앞 녹음으로 만든 답변은 새 전사가 대신한다.
      transcribeTokenRef.current[targetSlot] = (transcribeTokenRef.current[targetSlot] ?? 0) + 1;
      typedSlotsRef.current.delete(targetSlot);
    } else {
      autoTranscribeSlotsRef.current.delete(targetSlot);
    }
    if (recordingOn) void beginAudioCapture(targetSlot, autoTranscribe);
    setListening(dictationOn || recordingOn);
  }, [beginAudioCapture, recordingAvailable, startDictationFor, stopAnswerCapture]);

  /**
   * 연습을 마치기 전에 남은 녹음본을 모두 글로 옮긴다.
   *
   * 결과 화면도 기록도 통계도 전부 답변 텍스트 위에 선다. 녹음만 남긴 채 넘어가면
   * "말은 했는데 아무것도 남지 않은 회차"가 되므로, 여기서 한 번에 옮기고 넘어간다.
   * 실패한 문항은 녹음본을 그대로 들고 가 결과 화면에서 다시 시도할 수 있다.
   */
  const flushTranscriptions = useCallback(async () => {
    const running = [...transcribePendingRef.current.values()];
    const missing = exam.items.map((entry) => entry.slot).filter((targetSlot) =>
      autoTranscribeSlotsRef.current.has(targetSlot)
      && !transcribePendingRef.current.has(targetSlot)
      && !!recordingsRef.current[targetSlot]
      && !hasAnswerText(answersRef.current[targetSlot])
      && !transcribeErrorsRef.current[targetSlot]);
    if (running.length === 0 && missing.length === 0) return;

    let done = 0;
    const total = running.length + missing.length;
    setTranscribeBatch({ done, total });
    const bump = () => setTranscribeBatch({ done: (done += 1), total });
    // 이미 돌고 있는 것부터 기다린다. 문항을 넘길 때마다 미리 띄워 둔 전사들이다.
    await Promise.all(running.map((task) => task.then(bump, bump)));
    await runInPool(missing, TRANSCRIBE_CONCURRENCY, async (targetSlot) => {
      const recording = recordingsRef.current[targetSlot];
      if (recording) await startTranscription(targetSlot, recording);
      bump();
    });
    setTranscribeBatch(null);
  }, [exam.items, startTranscription]);

  const playQuestion = useCallback((targetSlot: number, questionId: string, text: string, isReplay: boolean) => {
    // 다시 듣기를 누르면 직전 몇 초의 답변 녹음은 버리고, 재청취가 끝난 뒤 새로 시작한다.
    stopAnswerCapture(isReplay ? "discard" : "save");
    setReplayLeftSec(0);
    setProgress(0);
    setSpeechMs(0);
    playStartedAtRef.current = Date.now();
    setPhase("playing");
    if (isReplay) {
      setReplays((prev) => ({ ...prev, [targetSlot]: (prev[targetSlot] ?? 0) + 1 }));
    }

    const used = (replays[targetSlot] ?? 0) + (isReplay ? 1 : 0);
    const startAnswering = () => {
      // 답변 시간은 마지막 질문 청취가 끝난 시점부터 0:00 으로 잰다. 처음 듣기·리플레이·
      // 이미 답한 문항에 돌아와 다시 듣기 모두 같다.
      setTimes((prev) => ({ ...prev, [targetSlot]: 0 }));
      setProgress(1);
      setPhase("answering");
      setReplayLeftSec(used < MAX_REPLAYS ? REPLAY_WINDOW_SEC : 0);
      if (!typing) beginAnswerCapture(targetSlot);
    };

    speak(text, {
      // 문항 id 로 미리 만들어 둔 mp3 를 먼저 찾는다. 없으면 브라우저가 읽는다.
      audioId: questionId,
      rate: SPEECH_RATE,
      onDuration: setSpeechMs,
      onStart: () => rememberQuestion(targetSlot),
      onEnd: startAnswering,
      onError: startAnswering,
    });
  }, [beginAnswerCapture, rememberQuestion, replays, stopAnswerCapture, typing]);

  useEffect(() => {
    stopAnswerCapture("discard");
    stopSpeaking();
    setPhase("ready");
    setProgress(0);
    setSpeechMs(0);
    setReplayLeftSec(0);
    setReveal(null);
    setMicError(null);
    setMicNotice(null);
    // 문항 전환 때만 초기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted]);

  useEffect(() => () => {
    dictationRef.current?.abort();
    stopAudioCapture(false);
    stopSpeaking();
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
    Object.values(recordingsRef.current).forEach((recording) => URL.revokeObjectURL(recording.url));
  }, [stopAudioCapture]);

  /*
   * 휴대폰은 손을 대지 않으면 화면을 끄고, 화면이 꺼지면 페이지가 멈춰 받아쓰기가
   * 끊긴다. 한 문항이 1~2분인데 그동안 화면을 만질 일이 없으니 답변 도중에 꺼진다.
   * 그래서 질문을 한 번 듣기 시작하면 결과 화면에 닿을 때까지 화면을 깨워 둔다.
   */
  useEffect(() => {
    if (submitted || phase === "ready") {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
      return;
    }
    wakeLockRef.current ??= requestScreenWakeLock();
  }, [phase, submitted]);

  useEffect(() => {
    if (phase !== "playing") return;
    // mp3 를 틀면 실제 길이를 알 수 있다. 브라우저 낭독일 때만 어림값으로 그린다.
    const total = speechMs > 0 ? speechMs : estimateSpeechMs(item.question.en, SPEECH_RATE);
    // 길이가 뒤늦게 오더라도 기준 시각은 재생을 시작한 그 시점 그대로 둔다.
    const startedAt = playStartedAtRef.current || Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(0.97, (Date.now() - startedAt) / total));
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, item.question.en, speechMs]);

  useEffect(() => {
    if (replayLeftSec <= 0) return;
    const id = window.setTimeout(() => setReplayLeftSec((sec) => sec - 1), 1000);
    return () => window.clearTimeout(id);
  }, [replayLeftSec]);

  useEffect(() => {
    if (submitted || phase !== "answering") return;
    const id = window.setInterval(() => {
      setTimes((prev) => ({ ...prev, [slot]: (prev[slot] ?? 0) + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [slot, submitted, phase]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [answer, interim]);

  /** 답변 받는 방식을 바꾼다. 답변 중이면 그 자리에서 새 방식으로 다시 연다. */
  function switchMicMode(mode: MicMode) {
    chooseMicMode(mode);
    setMicNotice(null);
    setMicError(null);
    if (listening && !typing) beginAnswerCapture(slot);
  }

  async function goToQuestion(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= exam.items.length || targetIndex === index) return;
    await stopAnswerCapture("save");
    stopSpeaking();
    setIndex(targetIndex);
  }

  function nextQuestion() {
    goToQuestion(index + 1);
  }

  async function submit() {
    await stopAnswerCapture("save");
    stopSpeaking();
    // 녹음만 한 문항은 아직 글이 없다. 결과 화면으로 넘어가기 전에 여기서 옮긴다.
    await flushTranscriptions();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetAttempt() {
    exposureAttemptRef.current += ":retry";
    exposedSlotsRef.current.clear();
    stopAnswerCapture("discard");
    Object.values(recordingsRef.current).forEach((recording) => URL.revokeObjectURL(recording.url));
    // 지난 회차에서 재어 둔 말하기 신호와 전사 기록은 이 회차로 넘어오지 않는다.
    voiceSignalsRef.current = {};
    typedSlotsRef.current.clear();
    autoTranscribeSlotsRef.current.clear();
    transcribePendingRef.current.clear();
    setTranscribeErrors({});
    setTranscribingSlots(new Set());
    setTranscribeBatch(null);
    setRecordings({});
    setVoiceAnalyses({});
    setAnalyzingSlot(null);
    setAnswers({});
    setTimes({});
    setReplays({});
    setHintUse({});
    setSubmitted(false);
    setIndex(0);
    setPhase("ready");
  }

  function holdReveal(kind: Reveal) {
    if (kind !== "keywords") rememberQuestion(slot);
    setReveal(kind);
    setHintUse((prev) => ({ ...prev, [slot]: (prev[slot] ?? 0) + 1 }));
  }

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
        recordings={recordings}
        voiceAnalyses={voiceAnalyses}
        onRetry={resetAttempt}
        onRegenerate={onRegenerate}
      />
    );
  }

  const bannerText = phase === "playing"
    ? "질문을 듣는 중입니다"
    : phase === "ready"
      ? "Click 'PLAY' button to Listen"
      : canReplay
        ? `Recording · REPLAY 가능 ${replayLeftSec}초`
        : "Recording · 지금 답변하세요";

  const playLabel = phase === "playing" ? "재생 중" : phase === "ready" ? "질문 듣기" : "질문 다시 듣기";
  /** 녹음만 하는 기기. 답변 텍스트는 녹음본을 글로 옮겨 만든다. */
  const recordingOnly = micMode === "recording-only";
  /** 이 문항의 녹음본을 지금 글로 옮기고 있는지. */
  const transcribing = transcribingSlots.has(slot);
  const transcribeError = transcribeErrors[slot] ?? null;
  /** 받아쓰기가 마이크를 혼자 쓰는 중이면 입력 레벨을 잴 길이 없다. */
  const micLevelBlind = micAvailable && micMode === "dictation-only";
  const micStatusLabel = !listening
    ? "대기 중"
    : micLevelBlind
      ? "받아쓰기 중 · 이 기기는 입력 레벨을 함께 볼 수 없습니다"
      : `마이크 입력 ${Math.round(micLevel * 100)}%`;
  /*
   * 휴대폰은 받아쓰기가 마이크를 혼자 써서 입력 레벨을 잴 수 없다. 화면에 아무
   * 표시가 없으면 인식기가 도는지 멈췄는지 알 길이 없어, 1분을 말하고 나서야 한
   * 글자도 안 남은 것을 본다. 그래서 인식기가 알려 주는 상태를 그대로 적어 둔다.
   * 답변 텍스트는 여기 적지 않는다. 실전에는 없는 것이라 `연습 도구` 쪽에 남긴다.
   * 질문이 나오는 동안에는 받아쓰기가 꺼져 있는 것이 정상이라 아무 말도 하지 않는다.
   */
  const dictationLabel = !micAvailable || typing || phase !== "answering"
    ? null
    : !dictating
      ? "받아쓰기 꺼짐"
      : micActivity === "paused"
        ? "화면이 꺼져 멈췄습니다 · 돌아오면 다시 켜집니다"
        : micActivity === "starting"
          ? "마이크 여는 중…"
          : words > 0
            ? `받아쓰는 중 · ${words}단어`
            : micActivity === "speaking"
              ? "받아쓰는 중…"
              : "듣는 중 · 영어로 말해 보세요";
  /*
   * 녹음만 하는 기기에는 인식기가 알려 줄 상태가 없다. 대신 마이크를 이쪽이 혼자 쓰므로
   * 입력 레벨이 살아 있어, 미터가 움직이는 것 자체가 돌고 있다는 표시가 된다. 글자는
   * 답변이 끝난 뒤에 붙으니 여기서는 녹음이 도는지만 적는다.
   */
  const captureLabel = recordingOnly
    ? (typing || phase !== "answering" ? null : listening ? "녹음 중 · 영어로 말해 보세요" : "녹음 꺼짐")
    : dictationLabel;
  const captureStalled = !!captureLabel && (recordingOnly ? !listening : (!dictating || micActivity === "paused"));
  const retryCaptureLabel = recordingOnly ? "녹음 다시 켜기" : "받아쓰기 다시 켜기";
  const hints = item.question.hints ?? [];
  const replayIconVisible = phase === "answering";
  const modeLabel = exam.mode === "practice" ? "주제별 연습"
    : isTypePractice && typeGroup ? typePracticeTitle(typeGroup, exam.randomScope)
      : exam.mode === "set" || exam.mode === "single" ? randomPracticeLink(exam.mode, exam.randomScope).label
        : "실전 모의고사";

  return (
    <main className={`mx-auto w-full ${isFixedPractice ? "max-w-6xl" : "max-w-5xl"} px-4 pb-28 pt-6 sm:px-6`}>
      {/*
        * 녹음만 한 문항은 아직 글이 없다. 결과 화면과 기록은 답변 텍스트 위에 서므로
        * 여기서 옮기고 넘어간다. 몇 초가 걸려 화면이 멈춘 것처럼 보이지 않게 덮어 둔다.
        */}
      {transcribeBatch && (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 grid place-items-center bg-canvas/85 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface px-5 py-5 text-center shadow-raised">
            <p className="text-sm font-semibold">녹음본을 글로 옮기는 중…</p>
            <p className="mt-1.5 text-xs tabular-nums text-fg-muted">{transcribeBatch.done}/{transcribeBatch.total}문항</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${Math.round((transcribeBatch.done / Math.max(1, transcribeBatch.total)) * 100)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-fg-subtle">옮기지 못한 문항은 녹음본을 그대로 들고 결과 화면으로 넘어갑니다.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Link
          href={exit.href}
          onClick={(event) => { if (unsaved && !window.confirm(LEAVE_CONFIRM)) event.preventDefault(); }}
          className="text-sm text-fg-muted transition hover:text-fg"
        >{exit.label}</Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-fg-subtle">{modeLabel}</span>
          <QuestionContextReveal key={slot} item={item} showSet={exam.mode === "set" || isTypePractice} />
        </div>
      </div>

      <div className="animate-fade-up overflow-hidden rounded-lg border border-exam-line bg-exam-frame text-exam-ink shadow-raised">
        <div className="px-4 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-base font-bold">Question {index + 1} of {exam.items.length}{isSurprisePractice && <span className="ml-3 text-sm font-medium">자료 {item.question.number}번</span>}</h1>
            <div className="flex shrink-0 items-center gap-3 rounded-lg border border-exam-line bg-exam-frame-2 px-3 py-2">
              <div className="text-right text-[11px] leading-relaxed text-exam-ink-muted">
                <span className="block font-semibold">답변 시간</span>
                <span className="block">{phase === "playing" ? "질문 재생 중" : phase === "answering" ? "답변 중" : elapsed > 0 ? "일시정지" : "청취 후 시작"}</span>
              </div>
              <span role="timer" aria-label="답변 시간" aria-live="off" className="min-w-[5ch] text-right font-mono text-2xl font-semibold tabular-nums leading-none text-exam-ink">{formatTime(elapsed)}</span>
            </div>
          </div>
          <div className="mt-3 border-t border-exam-line" />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,17rem)_auto_minmax(0,1fr)] lg:gap-6">
            <div className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-none">
              <div className="aspect-square overflow-hidden border border-exam-line">
                <AvaAvatar speaking={phase === "playing"} />
              </div>

              <div className="flex items-stretch border-x border-b border-exam-line">
                <button
                  type="button"
                  onClick={() => playQuestion(slot, item.question.id, item.question.en, phase !== "ready")}
                  disabled={phase === "playing" || (phase === "answering" && !canReplay)}
                  aria-label={playLabel}
                  className="grid w-11 place-items-center bg-exam-accent text-exam-accent-fg transition-colors enabled:hover:bg-exam-accent-hover disabled:bg-exam-accent-soft"
                >
                  {replayIconVisible ? <ReplayIcon /> : <PlayIcon />}
                </button>
                <div className="flex flex-1 items-center bg-exam-frame-2 px-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-exam-line">
                    <div className="h-full rounded-full bg-exam-accent transition-[width] duration-100" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                </div>
              </div>

              <p aria-live="polite" className="border-x border-b border-exam-line bg-exam-note px-3 py-2 text-center text-xs font-semibold text-exam-note-fg">
                {bannerText}
              </p>

              {!speechAvailable && (
                <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">이 브라우저는 문제 읽어주기를 지원하지 않습니다. 아래 연습 도구에서 지문을 확인해 주세요.</p>
              )}
            </div>

            {/* 실제 OPIc의 세로 표시는 조절기가 아니라 마이크 입력 레벨 확인용이다. */}
            <div className="flex flex-col items-center justify-center gap-3">
              <MicLevelMeter level={micLevel} active={listening} indeterminate={micLevelBlind} />
              <span title={micStatusLabel} className={listening ? "text-exam-rec" : "text-exam-ink-muted"}>
                <MicGlyph className={listening ? "h-5 w-5 animate-rec-pulse" : "h-5 w-5"} />
              </span>
              {captureLabel && (
                <div className="flex w-full max-w-[13rem] flex-col items-center gap-2 lg:max-w-[9rem]">
                  <p aria-live="polite" className={`text-center text-[11px] font-semibold leading-snug ${captureStalled ? "text-exam-rec" : "text-exam-ink-muted"}`}>
                    {captureLabel}
                  </p>
                  {(recordingOnly ? !listening : !dictating) && (
                    <button
                      type="button"
                      onClick={() => beginAnswerCapture(slot)}
                      className="min-h-11 w-full rounded border border-exam-accent px-2 text-[11px] font-bold text-exam-accent transition hover:bg-exam-accent hover:text-exam-accent-fg"
                    >{retryCaptureLabel}</button>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-exam-ink-muted">{isPractice ? "문항 선택:" : "문항 진행:"}</p>
              {fixedPracticeSets ? <FixedPracticeNavigation items={exam.items} sets={fixedPracticeSets}
                currentSlot={slot} answers={answers} onSelect={goToQuestion} /> : <div className={`mt-2 flex flex-wrap ${isPractice ? "gap-2" : "gap-1"}`}>
                {exam.items.map((it, i) => {
                  const answered = hasAnswerText(answers[it.slot]);
                  const number = itemNumber(exam.mode, it);
                  const state = i === index ? "active" : (isPractice ? answered : i < index) ? "done" : "todo";
                  const className = `grid place-items-center border text-xs font-semibold tabular-nums ${isPractice ? "min-h-11 min-w-11 transition-colors hover:border-exam-accent" : "h-7 w-8 cursor-default"} ${
                    state === "active" ? "border-exam-slot-active bg-exam-slot-active text-exam-slot-active-fg"
                      : state === "done" ? "exam-slot-done border-exam-line text-exam-ink-muted"
                        : "border-exam-line bg-exam-slot text-exam-slot-fg"
                  }`;
                  if (isPractice) return (
                    <button key={it.slot} type="button" onClick={() => goToQuestion(i)}
                      aria-current={state === "active" ? "step" : undefined}
                      aria-label={`${number}번 문항 · ${answered ? "답변함" : "미답변"}`}
                      title={`${it.typeLabel} · ${answered ? "답변함" : "미답변"}`} className={className}>
                      {number}
                    </button>
                  );
                  return (
                    <span
                      key={it.slot}
                      aria-current={state === "active" ? "step" : undefined}
                      title={state === "done" ? "이미 지나간 문항입니다" : state === "active" ? "현재 문항" : "아직 진행하지 않은 문항입니다"}
                      className={className}
                    >
                      {number}
                    </span>
                  );
                })}
              </div>}

              {isPractice && (
                <p className="mt-4 text-xs leading-relaxed text-exam-ink-muted">{fixedPracticeSets ? `${fixedPracticeSets.map((set) => set.label).join(" / ")} 순서입니다. 좁은 화면에서는 각 줄의 문항 번호를 가로로 스크롤할 수 있습니다.` : isSurprisePractice ? "제공 자료의 번호와 순서대로 연습합니다. 번호는 실제 시험 번호가 아닌 자료의 문항 번호입니다." : isTypePractice ? `${typeGroup?.label ?? "고른 유형"} 유형만 모았습니다. 번호는 실제 시험 번호가 아닌 연습 순서입니다.` : "2~15번은 선택한 주제의 문제입니다."} 이전·다음이나 번호로 이동하고, 원하는 문항만 답변한 뒤 결과를 볼 수 있습니다.</p>
              )}

              {index === 0 && (
                <div className="mt-4 bg-exam-note px-4 py-3 text-sm leading-relaxed text-exam-note-fg">
                  <p><strong className="font-bold">Play</strong> 아이콘(▶)을 눌러 질문을 청취하십시오.</p>
                  <p className="mt-3"><strong className="font-bold">중요!</strong> 5초 이내에 REPLAY 아이콘을 누르면 질문 다시듣기가 가능하며, 재청취는 한번만 가능합니다.</p>
                </div>
              )}
            </div>
          </div>

          {/*
            * 마이크 안내는 `연습 도구` 안에 두지 않는다. 그 서랍은 접힌 채로 시작해서,
            * 받아쓰기가 멈춘 것을 알리는 문구와 다시 켜는 버튼이 함께 숨어 버렸다.
            * 휴대폰에서 아무 반응이 없던 까닭의 큰 몫이 이것이다.
            */}
          {/*
            * 전사는 녹음만 하는 기기에서 답변이 글이 되는 유일한 길이다. 어디까지 왔는지,
            * 실패했다면 무엇을 하면 되는지 마이크 안내와 같은 자리에 적는다.
            */}
          {(transcribing || transcribeError || micFallback === "no-transcription") && (
            <div className="mt-5 border border-exam-line bg-exam-frame-2 px-4 py-3">
              {micFallback === "no-transcription" ? (
                <p role="status" className="text-xs leading-relaxed text-exam-ink-muted">
                  지금은 녹음본을 글로 옮길 수 없어(서버 키 없음 또는 연결 끊김) <strong className="font-semibold text-exam-ink">받아쓰기로 답변을 받습니다.</strong> 녹음본은 남지 않지만 답변 텍스트는 그대로 쌓입니다.
                </p>
              ) : transcribeError ? (
                <>
                  <p role="alert" className="text-xs leading-relaxed text-exam-rec">{transcribeError}</p>
                  <p className="mt-1 text-xs leading-relaxed text-exam-ink-muted">녹음본은 그대로 있습니다. 결과 화면에서 다시 시도하거나, 아래 <strong className="font-semibold text-exam-ink">직접 입력·고쳐 쓰기</strong>로 적어도 됩니다.</p>
                </>
              ) : (
                <p role="status" className="text-xs leading-relaxed text-exam-ink-muted">녹음본을 글로 옮기는 중입니다. 다음 문항을 그대로 이어서 풀면 됩니다.</p>
              )}
            </div>
          )}

          {(micError || micNotice) && (
            <div className="mt-5 border border-exam-line bg-exam-frame-2 px-4 py-3">
              {micError && <p role="alert" className="text-xs leading-relaxed text-exam-rec">{micError}</p>}
              {micNotice && <p role="status" className={`text-xs leading-relaxed text-exam-ink-muted${micError ? " mt-2" : ""}`}>{micNotice}</p>}
              {micError && !typing && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => beginAnswerCapture(slot)}
                    className="min-h-11 rounded border border-exam-accent px-3 text-xs font-bold text-exam-accent transition hover:bg-exam-accent hover:text-exam-accent-fg"
                  >{retryCaptureLabel}</button>
                  <button
                    type="button"
                    onClick={() => {
                      stopAnswerCapture("save");
                      setTyping(true);
                      setTools(true);
                    }}
                    className="min-h-11 rounded border border-exam-line px-3 text-xs text-exam-ink-muted transition hover:text-exam-ink"
                  >직접 입력으로 바꾸기</button>
                </div>
              )}
            </div>
          )}

          {tools && (
            <div className="mt-6 space-y-4 border-t border-dashed border-exam-line pt-4">
              <div className="mt-4 border border-exam-line">
                <div className="flex items-center justify-between gap-2 border-b border-exam-line bg-exam-frame-2 px-3 py-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    {listening ? (
                      <>
                        <span className="h-2 w-2 animate-rec-pulse rounded-full bg-exam-rec" />
                        {recordingOnly ? "녹음 중 · 마친 뒤 글로 옮깁니다" : "녹음 중 · 말하는 대로 적힙니다"}
                      </>
                    ) : transcribing ? "녹음본을 글로 옮기는 중…" : "내 답변"}
                  </span>
                  <span className="tabular-nums text-exam-ink-muted">{words}단어 · {formatTime(elapsed)}</span>
                </div>

                {typing ? (
                  <textarea aria-label="내 답변" value={answer} onChange={(e) => editAnswer(slot, e.target.value)} rows={7} spellCheck placeholder="Well, let me tell you about..." className="w-full resize-y bg-exam-frame px-3 py-3 text-sm leading-relaxed text-exam-ink outline-none placeholder:text-exam-ink-muted/70" />
                ) : (
                  <div ref={transcriptRef} className="max-h-56 min-h-[7rem] overflow-y-auto px-3 py-3 text-sm leading-relaxed">
                    {answer || interim ? (
                      <p className="whitespace-pre-wrap">{answer}{interim && <span className="text-exam-ink-muted"> {interim}</span>}</p>
                    ) : (
                      <p className="text-exam-ink-muted">{
                        transcribing ? "녹음본을 글로 옮기는 중입니다. 곧 여기에 나타납니다."
                          : phase !== "answering" ? "재생 버튼을 눌러 질문을 들으면 녹음이 시작됩니다."
                            : recordingOnly ? "마이크에 대고 영어로 답해 보세요. 답변은 녹음을 마친 뒤 글로 옮겨 여기에 나타납니다."
                              : "마이크에 대고 영어로 답해 보세요."
                      }</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-exam-line bg-exam-frame-2 px-3 py-2">
                  {(micAvailable || recordingAvailable) && !typing && (
                    <button
                      type="button"
                      onClick={() => listening ? stopAnswerCapture("save") : beginAnswerCapture(slot)}
                      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition ${listening ? "border-exam-rec text-exam-rec" : "border-exam-line text-exam-ink-muted hover:text-exam-ink"}`}
                    >
                      <MicGlyph className="h-3.5 w-3.5" />{listening ? "녹음 멈추기" : "다시 녹음하기"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!typing) stopAnswerCapture("save");
                      setTyping((value) => !value);
                    }}
                    className="rounded border border-exam-line px-2.5 py-1 text-xs text-exam-ink-muted transition hover:text-exam-ink"
                  >
                    {typing ? "마이크로 돌아가기" : "직접 입력·고쳐 쓰기"}
                  </button>
                  {answer.length > 0 && (
                    <button type="button" onClick={() => {
                      stopAnswerCapture("discard");
                      editAnswer(slot, "");
                      setVoiceAnalyses((current) => {
                        const next = { ...current };
                        delete next[slot];
                        return next;
                      });
                    }} className="ml-auto rounded border border-exam-line px-2.5 py-1 text-xs text-exam-ink-muted transition hover:text-exam-ink">지우기</button>
                  )}
                </div>
              </div>

              {recordingAvailable && recordingOnly && (
                <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">
                  이 기기는 마이크를 한 번에 한 곳에서만 쓸 수 있어 <strong className="font-semibold text-exam-ink">녹음만 켭니다.</strong> 답변은 녹음본을 서버에서 글로 옮겨 만들기 때문에 브라우저 받아쓰기보다 정확하고, 녹음본도 남아 발음까지 확인할 수 있습니다. 대신 말하는 동안에는 글자가 보이지 않고, 문항을 마칠 때마다 녹음이 서버로 올라갑니다.{" "}
                  {micAvailable && (
                    <button type="button" onClick={() => switchMicMode("dictation-only")} className="underline underline-offset-2 transition hover:text-exam-ink">받아쓰기로 바꾸기</button>
                  )}
                </p>
              )}
              {micAvailable && recordingAvailable && micMode === "dictation-only" && (
                <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">
                  받아쓰기만 켜져 있습니다. 화면에 적히는 텍스트가 곧 답변이 되고, 녹음본이 없어 나중에 바로잡을 수 없습니다. 잘못 적힌 곳은 <strong className="font-semibold text-exam-ink">직접 입력·고쳐 쓰기</strong>로 다듬으세요.{" "}
                  {micFallback !== "no-transcription" && (
                    <button type="button" onClick={() => switchMicMode("recording-only")} className="underline underline-offset-2 transition hover:text-exam-ink">녹음으로 바꾸기</button>
                  )}
                </p>
              )}
              {!micAvailable && <p className="mt-2 text-xs leading-relaxed text-exam-ink-muted">이 브라우저는 음성 받아쓰기를 지원하지 않습니다. 녹음은 가능할 수 있으며, Chrome이나 Edge에서는 받아쓰기도 사용할 수 있습니다.</p>}

              <div className="h-24 overflow-y-auto rounded border border-exam-line bg-exam-frame-2 px-3 py-2.5 text-sm leading-relaxed">
                {reveal === "script" && (
                  <div>
                    <div className="mb-1.5 text-[11px]"><SourceBadge source={item.question.source} /></div>
                    <p>{item.question.en}</p>
                  </div>
                )}
                {reveal === "korean" && <p>{item.question.ko}</p>}
                {reveal === "keywords" && <ul className="flex flex-wrap gap-1.5">{hints.map((hint) => <li key={hint} className="rounded border border-exam-line bg-exam-frame px-2 py-0.5 text-xs">{hint}</li>)}</ul>}
                {reveal === null && <p className="text-xs text-exam-ink-muted">실전처럼 듣기만으로 풀어 보세요. 막히면 아래 버튼을 꾹 누르고 있는 동안에만 지문이 보입니다.</p>}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <HoldButton label="지문 보기" active={reveal === "script"} onPress={() => holdReveal("script")} onRelease={() => releaseReveal("script")} />
                <HoldButton label="해석 보기" active={reveal === "korean"} onPress={() => holdReveal("korean")} onRelease={() => releaseReveal("korean")} />
                {hints.length > 0 && <HoldButton label="키워드 보기" active={reveal === "keywords"} onPress={() => holdReveal("keywords")} onRelease={() => releaseReveal("keywords")} />}
                <span className="ml-auto self-center text-[11px] tabular-nums text-exam-ink-muted">이 문항 힌트 {hintUse[slot] ?? 0}회 · 다시 듣기 {replays[slot] ?? 0}/{MAX_REPLAYS}회</span>
              </div>

              {/* 결과 화면에서 별표로 저장해 둔 조언. 힌트와 달리 사용 횟수를 세지 않는다. */}
              <SavedExpressionsPanel questionId={item.question.id} topicId={item.topicId} topicKo={item.topicKo} />
            </div>
          )}

          {isPractice && (
            <section className="mt-6 border border-exam-line bg-exam-frame-2 px-4 py-4" aria-label="VOICE ANALYSIS">
              <h2 className="text-xs font-bold tracking-wide text-exam-ink">VOICE ANALYSIS</h2>
              {analyzingSlot === slot || transcribing ? (
                <p className="mt-2 text-sm text-exam-ink-muted">{transcribing ? "녹음본을 글로 옮긴 뒤 분석합니다." : "답변을 분석하고 있습니다."}</p>
              ) : voiceAnalysis ? (
                <>
                  <p className="mt-1 text-[11px] text-exam-ink-muted">Speaking time {formatTime(voiceAnalysis.speakingTimeSec)}</p>
                  <dl className="mt-3 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">Pace</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.pace}</dd></div>
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">5+ sec Pauses</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.longPauseCount} · Natural thinking pauses under 5 seconds are not counted.</dd></div>
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">Chunking</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.chunking}</dd></div>
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">Stress &amp; Delivery</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.stressDelivery}</dd></div>
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">Energy / Monotone</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.energy}</dd></div>
                    <div><dt className="text-xs font-semibold text-exam-ink-muted">Fillers</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.fillers}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs font-semibold text-exam-ink-muted">Spontaneity</dt><dd className="mt-1 leading-relaxed">{voiceAnalysis.spontaneity}</dd></div>
                  </dl>
                </>
              ) : (
                <p className="mt-2 text-sm text-exam-ink-muted">{recordingOnly ? "녹음을 마치면 글로 옮겨 음성 분석까지 만듭니다." : "녹음을 마치면 음성 분석이 표시됩니다."}</p>
              )}
            </section>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-exam-line pt-4">
            <button type="button" aria-expanded={tools} onClick={() => setTools((value) => !value)} className="text-xs text-exam-ink-muted transition hover:text-exam-ink">연습 도구 {tools ? "▴" : "▾"}</button>
            {isPractice ? (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => goToQuestion(index - 1)} disabled={index === 0} className="min-h-11 rounded border border-exam-line px-4 text-sm text-exam-ink-muted disabled:cursor-not-allowed disabled:opacity-40">‹ 이전</button>
                <button type="button" onClick={nextQuestion} disabled={index === exam.items.length - 1} className="min-h-11 rounded border border-exam-line px-4 text-sm text-exam-ink-muted disabled:cursor-not-allowed disabled:opacity-40">다음 ›</button>
                <button type="button" onClick={submit} disabled={!!transcribeBatch} className="min-h-11 rounded bg-exam-accent px-4 text-sm font-bold text-exam-accent-fg transition-colors hover:bg-exam-accent-hover disabled:cursor-progress disabled:opacity-70">{transcribeBatch ? "녹음본 옮기는 중…" : "연습 마치고 결과 보기"}</button>
              </div>
            ) : index < exam.items.length - 1 ? (
              <button type="button" onClick={nextQuestion} className="ml-auto rounded bg-exam-accent px-7 py-2.5 text-sm font-bold text-exam-accent-fg transition-colors hover:bg-exam-accent-hover">Next ›</button>
            ) : (
              <button type="button" onClick={submit} disabled={!!transcribeBatch} className="ml-auto rounded bg-exam-accent px-7 py-2.5 text-sm font-bold text-exam-accent-fg transition-colors hover:bg-exam-accent-hover disabled:cursor-progress disabled:opacity-70">{transcribeBatch ? "녹음본 옮기는 중…" : "답변 확인하기"}</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

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
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); onPress(); }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onLostPointerCapture={onRelease}
      onBlur={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key !== " " && e.key !== "Enter") return; e.preventDefault(); if (!e.repeat) onPress(); }}
      onKeyUp={(e) => { if (e.key !== " " && e.key !== "Enter") return; e.preventDefault(); onRelease(); }}
      className={`hold-target rounded border px-3 py-1.5 text-xs font-medium transition ${active ? "border-exam-accent bg-exam-accent text-exam-accent-fg" : "border-exam-line text-exam-ink-muted hover:text-exam-ink"}`}
    >
      {label} (꾹)
    </button>
  );
}
