"use client";

/**
 * 브라우저 내장 음성 기능 래퍼.
 * Web Speech API는 브라우저에 기본 탑재돼 있어 별도 비용이 들지 않는다.
 *  - speechSynthesis : 문제를 영어로 읽어준다 (거의 모든 브라우저 지원)
 *  - SpeechRecognition : 마이크로 말한 답변을 받아쓴다 (Chrome/Edge 계열)
 */

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

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
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

/** 문제 지문을 영어로 읽어준다. rate 0.9 정도가 실전 속도에 가깝다. */
export function speak(text: string, rate = 0.92): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

export interface DictationHandle {
  stop: () => void;
}

/**
 * 마이크 받아쓰기를 시작한다.
 * onFinal 은 확정된 문장이 나올 때마다, onInterim 은 인식 중인 임시 문장마다 호출된다.
 */
export function startDictation(handlers: {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): DictationHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  let stopped = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? "";
      if (result.isFinal) handlers.onFinal(transcript.trim());
      else interim += transcript;
    }
    if (interim) handlers.onInterim?.(interim.trim());
  };

  recognition.onerror = (event) => {
    const code = (event as Event & { error?: string }).error ?? "unknown";
    handlers.onError?.(code);
  };

  recognition.onend = () => {
    // continuous 모드도 브라우저가 임의로 끊는 경우가 있어, 사용자가 멈추기 전이면 다시 켠다
    if (!stopped) {
      try {
        recognition.start();
        return;
      } catch {
        /* 재시작 실패는 그대로 종료 처리 */
      }
    }
    handlers.onEnd?.();
  };

  recognition.start();

  return {
    stop: () => {
      stopped = true;
      recognition.stop();
    },
  };
}
