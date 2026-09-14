/**
 * 답변 한 개의 음성 분석.
 *
 * 응시 화면은 기기에 따라 두 가지 방법으로 말하기를 지켜본다.
 *
 *  - **받아쓰기가 도는 기기**: 결과가 올 때마다 낱말이 몇 개 늘었는지와 그 사이 간격을
 *    재서 말의 흐름을 본다. 덩어리는 낱말 수로 센다(`chunks.kind === "words"`).
 *  - **녹음만 하는 기기**: 받아쓰기가 없으니 마이크 입력 레벨로 말한 구간과 쉰 구간을
 *    가른다. 덩어리는 말한 길이(초)로 센다(`"seconds"`). 텍스트는 나중에 전사가 오면
 *    붙으므로, 그때 이 파일의 `buildVoiceAnalysis` 를 부른다.
 *
 * 어느 쪽으로 쟀든 마지막 판단은 여기 한 곳에서 내린다. 화면은 결과만 그린다.
 */

import { countEnglishWords } from "./answers";

export interface VoiceAnalysis {
  speakingTimeSec: number;
  wordsPerMinute: number;
  pace: string;
  longPauseCount: number;
  chunking: string;
  stressDelivery: string;
  energy: string;
  fillers: string;
  spontaneity: string;
}

/** 이보다 긴 침묵만 긴 쉼으로 센다. 2~5초는 생각하는 시간이라 세지 않는다. */
export const LONG_PAUSE_MS = 5_000;
/** 이만큼 쉬면 생각의 덩어리가 바뀐 것으로 본다. */
export const CHUNK_GAP_MS = 1_000;

const NATURAL_THINKING_EXPRESSION = /\b(?:well|um|uh|oh|right|yeah|let me (?:think|see)|what else(?: can i say)?|how should i put it|i(?:'|’)m trying to think|i(?:'|’)m not really sure(?:,? but)?|that(?:'|’)s a good question|i need a (?:second|moment) to think about that|give me a (?:second|moment)|i guess|i suppose|actually|i mean)\b/i;
const NATURAL_OPENING_PATTERN = new RegExp(`^\\s*(?:${NATURAL_THINKING_EXPRESSION.source})`, "i");

export function countFillers(transcript: string): number {
  return [/\bum\b/gi, /\buh\b/gi, /\byou\s+know\b/gi, /\bi\s+mean\b/gi, /\bwell\b/gi]
    .reduce((total, pattern) => total + (transcript.match(pattern)?.length ?? 0), 0);
}

export function hasNaturalThinkingOpening(transcript: string): boolean {
  return NATURAL_OPENING_PATTERN.test(transcript);
}

export function hasNaturalThinkingExpression(transcript: string): boolean {
  return NATURAL_THINKING_EXPRESSION.test(transcript);
}

export function variation(values: readonly number[]): number | null {
  if (values.length < 6) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function fillerFeedback(transcript: string, totalWords: number): string {
  const fillerCount = countFillers(transcript);
  const naturalOpening = hasNaturalThinkingOpening(transcript);
  if (fillerCount === 0) {
    return naturalOpening
      ? "Natural thinking opener detected. It supports a spontaneous delivery."
      : "No tracked fillers detected.";
  }
  const denselyDisruptive = fillerCount >= 8 && fillerCount >= Math.ceil(totalWords * 0.12);
  if (denselyDisruptive) {
    return `${fillerCount} tracked fillers. They may be interrupting your flow; replace a few with a quiet pause.`;
  }
  if (naturalOpening) {
    return `${fillerCount} tracked filler${fillerCount === 1 ? "" : "s"}. The opening sounds like natural real-time thinking.`;
  }
  return `${fillerCount} tracked filler${fillerCount === 1 ? "" : "s"}. This amount can sound natural in spontaneous speech.`;
}

/**
 * 생각의 덩어리.
 *
 * 받아쓰기로 잰 것은 덩어리마다 낱말 수, 녹음으로 잰 것은 말한 길이(초)다. 같은 줄로
 * 볼 수 없는 값이라 무엇으로 쟀는지 함께 들고 다닌다.
 */
export type VoiceChunks =
  | { kind: "words"; values: number[] }
  | { kind: "seconds"; values: number[] };

/** 덩어리 종류마다 다른 기준. 앞의 짧은 도입을 떼는 길이와, 토막 났다고 볼 평균이다. */
const CHUNK_RULES = {
  words: { opener: 8, fragmented: 4 },
  seconds: { opener: 2.5, fragmented: 1.5 },
} as const;

/** 한 답변을 재는 동안 모은 값. 받아쓰기로 재든 녹음으로 재든 이 모양으로 모인다. */
export interface VoiceSignals {
  /** 답변을 받기 시작해서 멈출 때까지의 시간(초). 말하지 않은 시간도 포함한다. */
  speakingTimeSec: number;
  longPauseCount: number;
  chunks: VoiceChunks;
  /** 초당 낱말 수 표본. 받아쓰기로 잴 때만 모인다. */
  cadenceSamples: number[];
  /** 마이크 입력 세기 표본(0~1). 녹음이 켜져 있을 때만 모인다. */
  energySamples: number[];
}

/**
 * 모은 값과 답변 텍스트로 음성 분석을 만든다.
 *
 * 텍스트가 없으면 만들지 않는다. 낱말 수 없이는 속도도 군더더기도 잴 수 없어, 빈 분석을
 * 그리느니 화면이 "분석 없음"으로 남는 편이 정직하다.
 */
export function buildVoiceAnalysis(transcript: string, signals: VoiceSignals): VoiceAnalysis | null {
  const text = transcript.trim();
  if (!text) return null;

  const speakingTimeSec = Math.max(1, Math.round(signals.speakingTimeSec));
  const totalWords = countEnglishWords(text);
  const wordsPerMinute = Math.round((totalWords * 60) / speakingTimeSec);
  const naturalOpening = hasNaturalThinkingOpening(text);
  const naturalThinking = hasNaturalThinkingExpression(text);

  const rules = CHUNK_RULES[signals.chunks.kind];
  const chunks = signals.chunks.values;
  // 짧은 도입 뒤에 생각하느라 쉬는 것은 답변을 만드는 자연스러운 방식이다.
  const assessedChunks = naturalOpening && chunks.length > 1 && chunks[0] <= rules.opener
    ? chunks.slice(1)
    : chunks;
  const averageChunk = assessedChunks.length > 0
    ? assessedChunks.reduce((sum, count) => sum + count, 0) / assessedChunks.length
    : signals.chunks.kind === "words" ? totalWords : speakingTimeSec;
  const fragmented = assessedChunks.length >= 4 && averageChunk < rules.fragmented;

  const energyVariation = variation(signals.energySamples);
  const cadenceVariation = variation(signals.cadenceSamples);
  const flatEnergy = energyVariation !== null && energyVariation < 0.22;
  const hasSelfCorrection = /\b(i mean|rather|sorry|let me (?:rephrase|start again)|what i mean is)\b/i.test(text);

  const pace = wordsPerMinute > 135
    ? `${wordsPerMinute} WPM · 속도가 빠릅니다. 의식적으로 더 천천히 말해보세요.`
    : wordsPerMinute > 120
      ? `${wordsPerMinute} WPM · 조금 빠릅니다. 조금 더 천천히 말해보세요.`
      : wordsPerMinute >= 90
        ? `${wordsPerMinute} WPM · 적절한 속도입니다. 지금 속도를 유지하세요.`
        : wordsPerMinute >= 80
          ? `${wordsPerMinute} WPM · 차분한 속도입니다. 더 빠르게 말할 필요는 없습니다.`
          : fragmented
            ? `${wordsPerMinute} WPM · 속도보다 짧게 끊긴 생각을 의미 단위로 더 자연스럽게 연결해보세요.`
            : `${wordsPerMinute} WPM · 차분하게 말하고 있습니다. 더 빠르게 말할 필요는 없습니다.`;

  const uniformDeliverySignals = [
    cadenceVariation !== null && cadenceVariation < 0.18,
    flatEnergy,
    assessedChunks.length <= 2 && totalWords >= 80,
  ].filter(Boolean).length;
  const spontaneitySignals = Number(naturalThinking) + Number(hasSelfCorrection);
  const scriptedSignals = Math.max(0, uniformDeliverySignals - spontaneitySignals);
  const spontaneity = scriptedSignals >= 3
    ? "Very scripted-sounding · Several delivery signals are unusually uniform. Add natural thought pauses and emphasis."
    : scriptedSignals === 2
      ? "Somewhat prepared-sounding · Let the rhythm vary naturally as each idea develops."
      : naturalThinking
        ? "Natural / spontaneous · Natural thinking language supports real-time thought formulation."
        : hasSelfCorrection
          ? "Natural / spontaneous · The self-correction sounds like normal real-time speaking."
          : "Natural / spontaneous · No strong scripted-delivery pattern detected.";

  return {
    speakingTimeSec,
    wordsPerMinute,
    pace,
    longPauseCount: signals.longPauseCount,
    chunking: fragmented
      ? "Fragmented · Try grouping short pieces into complete thoughts."
      : "Connected · Ideas generally flow in meaningful thought groups.",
    stressDelivery: flatEnergy
      ? "전달이 전체적으로 조금 고르게 들립니다. 핵심 단어에 조금 더 힘을 주면 전달력이 좋아집니다."
      : energyVariation === null
        ? "Not enough audio data to assess overall stress reliably."
        : "Varied · Key ideas have useful changes in emphasis.",
    energy: flatEnergy
      ? "Browser amplitude variation was limited. This alone does not establish monotone or incorrect intonation."
      : energyVariation === null
        ? "Energy variation is unavailable in this browser session."
        : "Natural energy variation detected across the response.",
    fillers: fillerFeedback(text, totalWords),
    spontaneity,
  };
}

/* ------------------------------------------------------------------ */
/* 입력 레벨로 말한 구간 가르기                                          */
/* ------------------------------------------------------------------ */

/*
 * 녹음만 하는 기기에는 "지금 낱말이 늘었다"는 신호가 없다. 대신 미터에 그리는 입력
 * 레벨이 매 프레임 들어오므로, 그것으로 말한 구간과 쉰 구간을 가른다. 받아쓰기 이벤트는
 * 인식 서버를 한 번 다녀와 늦게 도착하지만 레벨은 그 자리에서 나오므로, 쉼을 재는 데는
 * 오히려 이쪽이 정확하다.
 */

/** 말소리로 볼 세기. 조용한 방의 잡음은 이 아래에 머문다. */
const VOICE_ON_LEVEL = 0.12;
/** 말이 끊겼다고 볼 세기. 켜는 값보다 낮게 두어 경계에서 깜빡이지 않게 한다. */
const VOICE_OFF_LEVEL = 0.06;
/** 이만큼 이어져야 말소리로 친다. 문 닫는 소리처럼 한 번 튀는 것을 거른다. */
const MIN_VOICE_MS = 150;
/** 낱말 사이의 짧은 숨. 이 안에 다시 말하면 같은 덩어리로 본다. */
const SEGMENT_HANGOVER_MS = 400;
/** 이보다 짧은 구간은 덩어리로 세지 않는다. */
const MIN_SEGMENT_MS = 250;
/** 화면이 멈췄다 돌아온 프레임의 긴 간격은 말한 시간으로도 쉰 시간으로도 세지 않는다. */
const MAX_FRAME_MS = 250;
/** 입력 세기 표본을 뜨는 간격. */
const ENERGY_SAMPLE_MS = 100;
/** 이 아래는 표본으로 뜨지 않는다. 조용한 구간이 세기 표본을 0 으로 채우면 안 된다. */
const ENERGY_FLOOR = 0.03;

export interface VadState {
  startedAt: number;
  lastAtMs: number;
  /** 지금 말하는 중인지. */
  speaking: boolean;
  /** 지금 구간이 시작된 시각. */
  segmentStartedAt: number;
  /** 말소리가 이어지기 시작한 시각. `MIN_VOICE_MS` 를 넘겨야 구간이 열린다. */
  voicedSince: number;
  /** 말하는 중에 조용해진 시각. `SEGMENT_HANGOVER_MS` 를 넘기면 구간이 닫힌다. */
  quietSince: number;
  /** 직전 구간이 닫힌 시각. 다음 구간이 열릴 때 이 사이가 쉼이 된다. */
  silenceSince: number;
  segmentsSec: number[];
  longPauseCount: number;
  energySamples: number[];
  lastEnergySampleAt: number;
}

export function createVad(atMs: number): VadState {
  return {
    startedAt: atMs,
    lastAtMs: atMs,
    speaking: false,
    segmentStartedAt: 0,
    voicedSince: 0,
    quietSince: 0,
    silenceSince: atMs,
    segmentsSec: [],
    longPauseCount: 0,
    energySamples: [],
    lastEnergySampleAt: 0,
  };
}

/** 입력 레벨 한 프레임을 넣는다. `level` 은 미터에 그리는 0~1 값과 같다. */
export function observeVadLevel(state: VadState, level: number, atMs: number): VadState {
  const gap = atMs - state.lastAtMs;
  // 화면이 멈춰 있었다. 그동안 무슨 일이 있었는지 알 수 없으니 시계만 다시 맞춘다.
  if (gap > MAX_FRAME_MS) {
    const resumed: VadState = { ...state, lastAtMs: atMs, voicedSince: 0, quietSince: 0 };
    if (!state.speaking) resumed.silenceSince = atMs;
    return resumed;
  }

  const next: VadState = { ...state, lastAtMs: atMs };
  if (level >= ENERGY_FLOOR && atMs - state.lastEnergySampleAt >= ENERGY_SAMPLE_MS) {
    next.energySamples = [...state.energySamples, level];
    next.lastEnergySampleAt = atMs;
  }

  if (state.speaking) {
    if (level >= VOICE_OFF_LEVEL) {
      next.quietSince = 0;
      return next;
    }
    if (next.quietSince === 0) {
      next.quietSince = atMs;
      return next;
    }
    if (atMs - next.quietSince < SEGMENT_HANGOVER_MS) return next;
    // 숨이 아니라 정말 끊겼다. 구간은 조용해진 그 시점에 닫는다.
    const endedAt = next.quietSince;
    const lengthMs = endedAt - state.segmentStartedAt;
    if (lengthMs >= MIN_SEGMENT_MS) next.segmentsSec = [...state.segmentsSec, lengthMs / 1_000];
    next.speaking = false;
    next.segmentStartedAt = 0;
    next.quietSince = 0;
    next.silenceSince = endedAt;
    return next;
  }

  if (level < VOICE_ON_LEVEL) {
    next.voicedSince = 0;
    return next;
  }
  if (next.voicedSince === 0) {
    next.voicedSince = atMs;
    return next;
  }
  if (atMs - next.voicedSince < MIN_VOICE_MS) return next;
  // 말이 다시 시작됐다. 구간은 말소리가 들어오기 시작한 시점부터로 잡는다.
  const startedAt = next.voicedSince;
  if (state.silenceSince > 0 && startedAt - state.silenceSince >= LONG_PAUSE_MS) {
    next.longPauseCount = state.longPauseCount + 1;
  }
  next.speaking = true;
  next.segmentStartedAt = startedAt;
  next.voicedSince = 0;
  next.silenceSince = 0;
  return next;
}

/** 답변이 끝났다. 열려 있던 구간을 닫고 분석에 넘길 값으로 만든다. */
export function vadSignals(state: VadState, atMs: number): VoiceSignals {
  const segmentsSec = [...state.segmentsSec];
  if (state.speaking) {
    const endedAt = state.quietSince > 0 ? state.quietSince : atMs;
    const lengthMs = endedAt - state.segmentStartedAt;
    if (lengthMs >= MIN_SEGMENT_MS) segmentsSec.push(lengthMs / 1_000);
  }
  return {
    speakingTimeSec: Math.max(1, Math.round((atMs - state.startedAt) / 1_000)),
    longPauseCount: state.longPauseCount,
    chunks: { kind: "seconds", values: segmentsSec },
    cadenceSamples: [],
    energySamples: state.energySamples,
  };
}
