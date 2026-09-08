"use client";

/**
 * 받아쓰기와 녹음이 마이크를 함께 쓸 수 있는 기기인지 정한다.
 *
 * 노트북 크롬은 SpeechRecognition 과 getUserMedia 를 동시에 연다. 휴대폰
 * (안드로이드 크롬·iOS 사파리)은 마이크를 한 곳에서만 쓰고, 나중에 연 쪽이
 * 마이크를 가져간다. 답변을 받을 때 받아쓰기를 먼저 켜고 녹음을 그다음에 열기
 * 때문에 휴대폰에서는 늘 녹음이 이긴다. 그래서 음량 레벨은 잘 움직이는데
 * 받아쓰기는 한 글자도 오지 않는다.
 *
 * 답변 텍스트가 비면 채점도 AI 피드백도 막히므로, 마이크를 하나만 쓸 수 있는
 * 기기에서는 받아쓰기를 살리고 녹음을 접는다. 그 대신 녹음본 발음 비교는 쓸 수
 * 없다.
 */

/** `share` 는 받아쓰기와 녹음을 함께, `dictation-only` 는 받아쓰기만 켠다. */
export type MicMode = "share" | "dictation-only";

const MIC_MODE_KEY = "yumi-opic:mic-mode";

interface AgentLike {
  userAgent?: string;
  maxTouchPoints?: number;
  userAgentData?: { mobile?: boolean };
}

/**
 * 처음 보는 기기의 첫 판단. 휴대폰·태블릿으로 보이면 겪어 보기 전에 받아쓰기만
 * 켠다. 한 번 겪어 보고 정한 값(`loadMicMode`)이 있으면 그쪽이 먼저다.
 *
 * iPadOS 사파리는 스스로를 `Macintosh` 라고 적으므로 손가락 입력 개수로 가린다.
 */
export function guessMicMode(agent: AgentLike | undefined): MicMode {
  if (!agent) return "share";
  if (agent.userAgentData?.mobile === true) return "dictation-only";
  const ua = agent.userAgent ?? "";
  if (/Android|iPhone|iPod|iPad|Mobile|Silk|Kindle|Opera Mini/i.test(ua)) return "dictation-only";
  // 데스크톱 사파리를 자처하는 아이패드
  if (/Macintosh/i.test(ua) && (agent.maxTouchPoints ?? 0) > 1) return "dictation-only";
  return "share";
}

export function loadMicMode(): MicMode {
  if (typeof window === "undefined") return "share";
  try {
    const saved = window.localStorage.getItem(MIC_MODE_KEY);
    if (saved === "share" || saved === "dictation-only") return saved;
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
/* 겪어 보고 알아내기                                                    */
/* ------------------------------------------------------------------ */

/**
 * UA 만으로는 다 가릴 수 없다. 그래서 함께 켜 본 뒤 실제로 어떻게 되는지 본다.
 * 사람 목소리 크기의 입력이 한참 들어오는데 받아쓰기가 한 글자도 못 내놓으면
 * 녹음이 마이크를 쥐고 있는 것이다.
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
