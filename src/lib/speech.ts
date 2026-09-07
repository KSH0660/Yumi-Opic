"use client";

/**
 * 브라우저 내장 음성 기능 래퍼.
 * Web Speech API 는 브라우저에 기본 탑재돼 있어 별도 비용이 들지 않는다.
 *  - speechSynthesis  : 문제를 영어로 읽어준다 (거의 모든 브라우저 지원)
 *  - SpeechRecognition : 마이크로 말한 답변을 받아쓴다 (Chrome/Edge 계열)
 *
 * 받아쓰기 쪽은 기기별 버그가 많아 `./transcript` 의 접기 로직과 짝을 이룬다.
 * 어떤 버그를 막고 있는지는 그 파일 주석에 정리해 두었다.
 */

import {
  collectTranscript,
  mergeTranscript,
  type TranscriptChunk,
  type TranscriptDraft,
} from "./transcript";

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/* ------------------------------------------------------------------ */
/* 문제 낭독                                                            */
/* ------------------------------------------------------------------ */

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceListenerAttached = false;

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  if (!voiceListenerAttached) {
    voiceListenerAttached = true;
    // 목소리 목록은 늦게 채워진다. 바뀌면 다시 고르도록 캐시를 비운다.
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      cachedVoice = null;
    });
  }
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  cachedVoice =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|samantha/i.test(v.name)) ??
    voices.find((v) => /en[-_]US/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null;
  return cachedVoice;
}

/**
 * 낭독에 걸릴 시간을 어림한다. 진행 막대를 그리고, onend 가 오지 않는 기기에서
 * 낭독이 끝난 것으로 볼 시점을 잡는 데 쓴다.
 */
export function estimateSpeechMs(text: string, rate = 1): number {
  const perChar = 62; // 보통 속도로 읽을 때 한 글자에 걸리는 밀리초
  return Math.max(1200, (text.trim().length * perChar) / Math.max(0.5, rate));
}

export interface SpeakHandlers {
  rate?: number;
  /** 0~1. 실제 시험 화면의 볼륨 슬라이더와 이어져 있다. */
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/** 낭독이 시작되기를 기다려 보는 시간. 이보다 늦으면 낭독을 건너뛴다. */
const START_TIMEOUT_MS = 2500;

/** 지금 살아 있는 낭독을 가리키는 표. 늦게 도착한 콜백을 걸러낸다. */
let speakToken = 0;
let speakFallbackTimer = 0;

function clearSpeakFallback(): void {
  if (speakFallbackTimer) {
    window.clearTimeout(speakFallbackTimer);
    speakFallbackTimer = 0;
  }
}

/** 문제 지문을 영어로 읽어준다. rate 0.9 정도가 실전 속도에 가깝다. */
export function speak(text: string, handlers: SpeakHandlers = {}): void {
  const { rate = 0.92, volume = 1, onStart, onEnd, onError } = handlers;
  if (!isSpeechSynthesisSupported()) {
    onError?.();
    return;
  }

  const token = ++speakToken;
  clearSpeakFallback();
  window.speechSynthesis.cancel();

  let done = false;
  const finish = (failed: boolean) => {
    if (done || token !== speakToken) return;
    done = true;
    clearSpeakFallback();
    if (failed) onError?.();
    else onEnd?.();
  };

  const arm = (ms: number) => {
    clearSpeakFallback();
    speakFallbackTimer = window.setTimeout(() => finish(false), ms);
  };

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.volume = Math.min(1, Math.max(0, volume));
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => {
    if (token !== speakToken) return;
    // 낭독이 실제로 시작된 시점부터 다시 재니 남은 시간을 정확히 잡을 수 있다.
    arm(estimateSpeechMs(text, rate) * 1.5 + 3000);
    onStart?.();
  };
  utterance.onend = () => finish(false);
  utterance.onerror = () => finish(true);

  // 목소리가 하나도 깔려 있지 않은 기기에서는 낭독이 시작조차 하지 않는다.
  // 잠깐 기다려도 시작하지 않으면 낭독을 건너뛰고 답변 단계로 넘어간다.
  // 시작하면 위 onstart 가 이 시계를 낭독 길이에 맞춰 다시 맞춘다.
  arm(START_TIMEOUT_MS);

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  speakToken += 1; // 남아 있는 콜백을 모두 무효로 만든다
  clearSpeakFallback();
  window.speechSynthesis.cancel();
}

/* ------------------------------------------------------------------ */
/* 받아쓰기                                                             */
/* ------------------------------------------------------------------ */

/** 곧바로 다시 켜면 인식기가 두 개 겹쳐 도는 기기가 있어 한 박자 쉰다. */
const RESTART_DELAY_MS = 300;
/** 마이크가 아예 안 잡히는 환경에서 무한 재시작을 막는 한도. */
const MAX_RESTARTS = 60;

export interface DictationHandlers {
  /** 세션이 시작된 뒤 지금까지 받아 적은 전체 텍스트를 매번 통째로 넘긴다. */
  onUpdate: (draft: TranscriptDraft) => void;
  onError?: (code: string) => void;
  onEnd?: () => void;
}

export interface DictationHandle {
  /** 말하던 마지막 문장까지 받아 적고 끝낸다. */
  stop: () => void;
  /** 남은 결과를 버리고 즉시 끊는다. 문제를 넘길 때 쓴다. */
  abort: () => void;
}

/**
 * 마이크 받아쓰기를 시작한다.
 *
 * `onUpdate` 는 조각이 아니라 **세션 전체 텍스트**를 넘긴다. 부르는 쪽은 매번
 * 덮어쓰기만 하면 되고, 같은 결과가 두 번 와도 답변이 늘어나지 않는다.
 */
export function startDictation(handlers: DictationHandlers): DictationHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  /** 사용자가 멈췄다. 더는 자동으로 다시 켜지 않는다. */
  let closing = false;
  /** 통째로 버린 상태. 늦게 도착하는 결과도 무시한다. */
  let dead = false;
  /** 끝났다고 알린 뒤인지. onEnd 를 두 번 부르지 않게 한다. */
  let ended = false;
  /** 재시작을 건너 확정된 텍스트. */
  let settled = "";
  /** 지금 돌고 있는 인식 세션의 결과. 인덱스를 그대로 자리로 쓴다. */
  let chunks: TranscriptChunk[] = [];
  let restarts = 0;
  let restartTimer = 0;
  let active: SpeechRecognitionLike | null = null;

  const emit = () => {
    const draft = collectTranscript(chunks);
    handlers.onUpdate({
      committed: mergeTranscript(settled, draft.committed),
      interim: draft.interim,
    });
  };

  /** 지금 세션의 결과를 settled 로 옮긴다. 다시 켜면 인덱스가 0 부터 시작하기 때문이다. */
  const foldRun = () => {
    const { committed } = collectTranscript(chunks);
    settled = mergeTranscript(settled, committed);
    chunks = [];
  };

  const finish = () => {
    if (ended) return;
    ended = true;
    if (restartTimer) {
      window.clearTimeout(restartTimer);
      restartTimer = 0;
    }
    handlers.onEnd?.();
  };

  const detach = (recognition: SpeechRecognitionLike | null) => {
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
  };

  const create = (): SpeechRecognitionLike => {
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    try {
      recognition.maxAlternatives = 1;
    } catch {
      /* 설정을 막아 둔 기기가 있다 */
    }

    recognition.onresult = (event) => {
      if (dead) return;
      // event.resultIndex 를 믿지 않는다. 안드로이드 크롬은 이 값을 거의 늘 0 으로
      // 주면서 results 전체를 다시 보내는데, 그 자리부터 이어 붙이면 앞 문장이
      // 통째로 다시 쌓인다. 인덱스를 자리로 삼아 매번 통째로 다시 읽으면 같은
      // 결과가 몇 번을 와도 같은 칸을 덮어쓴다.
      const next: TranscriptChunk[] = [];
      const results = event.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (!result) continue;
        next.push({ isFinal: result.isFinal, transcript: result[0]?.transcript ?? "" });
        // 잘 받아 적는 중이면 재시작 한도를 되돌린다
        if (result.isFinal) restarts = 0;
      }
      chunks = next;
      emit();
    };

    recognition.onerror = (event) => {
      const code = (event as Event & { error?: string }).error ?? "unknown";
      // 말을 고르는 동안 흔히 나는 값이라 알리지 않는다. onend 가 알아서 다시 켠다.
      if (code === "no-speech" || code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture") {
        closing = true;
      }
      handlers.onError?.(code);
    };

    recognition.onend = () => {
      foldRun();
      if (!dead) emit();
      detach(recognition);
      if (active === recognition) active = null;

      if (dead || closing || restarts >= MAX_RESTARTS) {
        finish();
        return;
      }
      // continuous 를 켜도 발화마다 끊는 기기가 있어, 사용자가 멈추기 전이면 다시 켠다.
      restarts += 1;
      restartTimer = window.setTimeout(() => {
        restartTimer = 0;
        if (dead || closing) {
          finish();
          return;
        }
        try {
          active = create();
          active.start();
        } catch {
          finish();
        }
      }, RESTART_DELAY_MS);
    };

    return recognition;
  };

  try {
    active = create();
    active.start();
  } catch {
    detach(active);
    return null;
  }

  return {
    stop: () => {
      if (dead || closing) return;
      closing = true;
      if (restartTimer) {
        window.clearTimeout(restartTimer);
        restartTimer = 0;
      }
      // stop() 은 인식 중이던 마지막 문장을 final 로 흘려보낸 뒤 onend 를 부른다.
      if (!active) {
        foldRun();
        emit();
        finish();
        return;
      }
      try {
        active.stop();
      } catch {
        foldRun();
        emit();
        finish();
      }
    },
    abort: () => {
      if (dead) return;
      dead = true;
      closing = true;
      if (restartTimer) {
        window.clearTimeout(restartTimer);
        restartTimer = 0;
      }
      const current = active;
      active = null;
      detach(current);
      try {
        current?.abort();
      } catch {
        /* 이미 끝난 경우 */
      }
      foldRun();
      // 마지막까지 받아 적은 값을 넘긴 뒤 끝낸다. 문제를 넘겨도 답변은 남는다.
      handlers.onUpdate({ committed: settled, interim: "" });
      finish();
    },
  };
}

export type { TranscriptDraft };
