"use client";

/**
 * 이 기기에서 답변을 어떻게 받을지 정한다.
 *
 * 노트북 크롬은 SpeechRecognition 과 getUserMedia 를 동시에 연다. 휴대폰
 * (안드로이드 크롬·iOS 사파리)은 마이크를 한 곳에서만 쓰고, 나중에 연 쪽이 마이크를
 * 가져간다. 그래서 휴대폰은 둘 중 하나를 골라야 한다.
 *
 * 예전에는 받아쓰기를 골랐다. 답변이 빈 채로 남는 것보다는 나았지만, 브라우저
 * 받아쓰기는 발음이 조금만 흐려도 다른 낱말을 적는데(`gym` → `dreams`) 녹음본이 없어
 * 바로잡을 길이 없었다. 지금은 **녹음을 고르고 답변은 서버 전사로 글이 되게 한다.**
 * 안드로이드는 발화마다 인식기를 다시 켜는 사이에 말이 새지 않고, iOS 는 버튼을 누른
 * 직후에만 인식기가 켜지는 제약을 피한다. 텍스트도 전사 쪽이 더 정확하다.
 *
 * 대신 녹음만 켜는 모드는 **서버 전사가 살아 있어야 답변이 글로 남는다.** 키가 없거나
 * 연결이 끊긴 기기에서 그대로 두면 소리만 남고 기록이 통째로 비므로, `resolveMicMode`
 * 가 그럴 때 받아쓰기로 되돌린다. 이것이 이 파일이 있는 까닭이다.
 */

/**
 * - `share`: 받아쓰기와 녹음을 함께 켠다(노트북).
 * - `recording-only`: 녹음만 켜고 답변은 서버 전사로 만든다(휴대폰 기본).
 * - `dictation-only`: 받아쓰기만 켠다. 전사를 쓸 수 없을 때의 안전망이다.
 */
export type MicMode = "share" | "recording-only" | "dictation-only";

/**
 * 모드를 남기는 자리.
 *
 * 예전 키(`yumi-opic:mic-mode`)는 읽지 않는다. 그 값의 `dictation-only` 는 "이 기기는
 * 마이크를 한 곳에서만 쓴다"를 겪어 보고 남긴 것인데, 그것은 녹음 기반을 피할 까닭이
 * 아니라 오히려 그 전제다. 그대로 따르면 예전에 한 번 연습해 본 휴대폰만 새 방식으로
 * 넘어오지 못한다.
 */
const MIC_MODE_KEY = "yumi-opic:mic-mode-2";

const MIC_MODES: readonly MicMode[] = ["share", "recording-only", "dictation-only"];

interface AgentLike {
  userAgent?: string;
  maxTouchPoints?: number;
  userAgentData?: { mobile?: boolean };
}

/**
 * 처음 보는 기기의 첫 판단. 휴대폰·태블릿으로 보이면 겪어 보기 전에 녹음만 켠다.
 * 한 번 겪어 보고 정한 값(`loadMicMode`)이 있으면 그쪽이 먼저다. 다만
 * 데스크톱(`isDesktopAgent`)은 그 값과 상관없이 늘 함께 켠다.
 *
 * iPadOS 사파리는 스스로를 `Macintosh` 라고 적으므로 손가락 입력 개수로 가린다.
 */
export function guessMicMode(agent: AgentLike | undefined): MicMode {
  if (!agent) return "share";
  if (agent.userAgentData?.mobile === true) return "recording-only";
  const ua = agent.userAgent ?? "";
  if (/Android|iPhone|iPod|iPad|Mobile|Silk|Kindle|Opera Mini/i.test(ua)) return "recording-only";
  // 데스크톱 사파리를 자처하는 아이패드
  if (/Macintosh/i.test(ua) && (agent.maxTouchPoints ?? 0) > 1) return "recording-only";
  return "share";
}

/**
 * 받아쓰기와 녹음이 마이크를 함께 쓰는 데스크톱 OS 인지. 윈도·크롬OS 와 손가락
 * 입력이 없는 맥이 여기에 든다. 터치스크린 윈도 노트북도 데스크톱이다.
 *
 * 이런 기기에서는 아래의 "겪어 보고 알아내기"를 쓰지 않고, 예전에 그렇게 남긴
 * 값도 따르지 않는다. 데스크톱에서 받아쓰기가 한 글자도 못 내놓는 까닭은 녹음이
 * 아니라 인식 서버 오류·인식기만 있고 받아 적지는 못하는 브라우저·주변 소음이다. 그때
 * 녹음을 접으면 멀쩡하던 녹음본만 잃고, 그 판단이 남아 노트북을 휴대폰처럼 대한다.
 *
 * 리눅스는 넣지 않는다. 안드로이드 태블릿이 데스크톱 사이트를 요청하면 리눅스
 * 데스크톱처럼 보이기 때문이다.
 *
 * 받아쓰기의 continuous 도 이 판단을 따른다. `./speech` 참고.
 */
export function isDesktopAgent(agent: AgentLike | undefined): boolean {
  if (!agent || guessMicMode(agent) !== "share") return false;
  return /Windows NT|CrOS|Macintosh/i.test(agent.userAgent ?? "");
}

export function loadMicMode(): MicMode {
  if (typeof window === "undefined") return "share";
  // 데스크톱은 늘 함께 쓴다. 겪어 보고 잘못 남긴 값이 있어도 따르지 않는다.
  if (isDesktopAgent(window.navigator)) return "share";
  try {
    const saved = window.localStorage.getItem(MIC_MODE_KEY);
    if (MIC_MODES.includes(saved as MicMode)) return saved as MicMode;
  } catch {
    /* 저장소를 막아 둔 브라우저 */
  }
  return guessMicMode(window.navigator);
}

export function saveMicMode(mode: MicMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIC_MODE_KEY, mode);
  } catch {
    /* 저장소를 막아 둔 브라우저 */
  }
}

/* ------------------------------------------------------------------ */
/* 안전망: 이 기기에서 실제로 할 수 있는 것                               */
/* ------------------------------------------------------------------ */

export interface MicCapabilities {
  /** 브라우저에 SpeechRecognition 이 있는지. */
  dictation: boolean;
  /** getUserMedia 와 MediaRecorder 가 있는지. */
  recording: boolean;
  /** 서버가 녹음본을 글로 옮길 수 있는지. 키가 없거나 연결이 끊기면 false. */
  transcription: boolean;
}

/**
 * 고른 모드를 실제로 쓸 수 없어 다른 모드로 내려온 까닭.
 * 화면은 이것으로 무엇이 왜 달라졌는지 한 줄로 알린다.
 */
export type MicFallback = "no-transcription" | "no-recording" | "no-dictation";

export interface ResolvedMicMode {
  mode: MicMode;
  /** 고른 그대로면 null. */
  fallback: MicFallback | null;
}

/**
 * 고른 모드를 이 기기에서 쓸 수 있는 모드로 바꾼다.
 *
 * 핵심은 하나다. **녹음만 켜는 모드는 전사가 없으면 답변이 글로 남지 않는다.** 받아쓰기를
 * 쓸 수 있다면 그쪽으로 되돌리는 편이 낫다. 소리만 남기고 기록을 통째로 잃느니, 덜 정확해도
 * 글이 남는 쪽이 연습이 된다.
 */
export function resolveMicMode(requested: MicMode, caps: MicCapabilities): ResolvedMicMode {
  if (requested === "recording-only") {
    if (!caps.recording) return { mode: "dictation-only", fallback: "no-recording" };
    // 전사를 쓸 수 없다. 받아쓰기가 있으면 그쪽이 답변을 남긴다.
    if (!caps.transcription) {
      return caps.dictation
        ? { mode: "dictation-only", fallback: "no-transcription" }
        : { mode: "recording-only", fallback: "no-transcription" };
    }
    return { mode: "recording-only", fallback: null };
  }

  if (requested === "dictation-only") {
    if (caps.dictation) return { mode: "dictation-only", fallback: null };
    return caps.recording && caps.transcription
      ? { mode: "recording-only", fallback: "no-dictation" }
      : { mode: "dictation-only", fallback: "no-dictation" };
  }

  if (caps.recording && caps.dictation) return { mode: "share", fallback: null };
  if (caps.dictation) return { mode: "dictation-only", fallback: "no-recording" };
  return caps.recording && caps.transcription
    ? { mode: "recording-only", fallback: "no-dictation" }
    : { mode: "dictation-only", fallback: "no-dictation" };
}

/** 이 모드에서 받아쓰기를 켜는지. */
export function usesDictation(mode: MicMode): boolean {
  return mode !== "recording-only";
}

/** 이 모드에서 녹음을 켜는지. */
export function usesRecording(mode: MicMode): boolean {
  return mode !== "dictation-only";
}

/* ------------------------------------------------------------------ */
/* 겪어 보고 알아내기                                                    */
/* ------------------------------------------------------------------ */

/**
 * UA 만으로는 다 가릴 수 없다. 그래서 둘을 함께 켜 본 뒤 실제로 어떻게 되는지 본다.
 * 사람 목소리 크기의 입력이 한참 들어오는데 받아쓰기가 한 글자도 못 내놓으면
 * 녹음이 마이크를 쥐고 있는 것이다. 데스크톱(`isDesktopAgent`)에서는 쓰지 않는다.
 */

/** 목소리로 볼 만한 입력 세기(0~1). 조용한 방의 잡음은 이 아래에 머문다. */
const VOICE_LEVEL = 0.15;
/** 이만큼 말했는데도 한 글자가 없으면 마이크를 뺏긴 것으로 본다. */
const VOICE_BUDGET_MS = 3000;
/** 화면이 멈췄다 돌아온 프레임의 긴 간격은 말한 시간으로 세지 않는다. */
const MAX_FRAME_MS = 250;

export interface MicProbe {
  /** 목소리 크기로 들어온 시간의 합(ms). */
  voicedMs: number;
  /** 직전에 살펴본 시각(ms). */
  lastAtMs: number;
  /** 받아쓰기가 한 번이라도 무언가를 돌려줬는지. */
  heard: boolean;
}

export function createMicProbe(atMs: number): MicProbe {
  return { voicedMs: 0, lastAtMs: atMs, heard: false };
}

/** 입력 레벨 한 프레임을 넣는다. `level` 은 미터에 그리는 0~1 값이다. */
export function observeMicLevel(probe: MicProbe, level: number, atMs: number): MicProbe {
  if (probe.heard) return probe;
  const gap = atMs - probe.lastAtMs;
  const voiced = level >= VOICE_LEVEL && gap > 0 && gap <= MAX_FRAME_MS ? gap : 0;
  return { ...probe, lastAtMs: atMs, voicedMs: probe.voicedMs + voiced };
}

/** 받아쓰기가 글자를 돌려줬다. 이 기기는 둘을 함께 쓸 수 있다. */
export function observeMicResult(probe: MicProbe): MicProbe {
  return probe.heard ? probe : { ...probe, heard: true };
}

export function isMicConflict(probe: MicProbe): boolean {
  return !probe.heard && probe.voicedMs >= VOICE_BUDGET_MS;
}
