/**
 * 고친 답변을 따라 읽게 하는 재생기의 값들.
 *
 * 결과 화면은 그냥 두면 읽을거리로 끝난다. 글자가 정해진 속도로 흘러가면 눈으로
 * 훑고 넘어가기 어려워 입이 따라온다. 읽는 속도는 사람마다 다르므로 사용자가 정하고,
 * 고른 값은 브라우저에 남겨 다음 문항에서 다시 고르지 않게 한다.
 */

/**
 * 분당 낱말 수. 실제 오픽 답변은 보통 110~140 사이이고, 프롬프트도 같은 단위로
 * 전달력을 본다. 따라 읽기는 또박또박 읽는 쪽이라 기본값을 그보다 낮게 잡는다.
 */
export const READ_WPM_MIN = 60;
export const READ_WPM_MAX = 180;
export const READ_WPM_STEP = 10;
export const READ_WPM_DEFAULT = 110;

const WPM_KEY = "yumi-opic:read-wpm";

/** 눈금에 맞춰 자른다. 알 수 없는 값은 기본값으로 본다. */
export function clampReadWpm(value: number): number {
  if (!Number.isFinite(value)) return READ_WPM_DEFAULT;
  const stepped = Math.round(value / READ_WPM_STEP) * READ_WPM_STEP;
  return Math.min(READ_WPM_MAX, Math.max(READ_WPM_MIN, stepped));
}

export function loadReadWpm(): number {
  if (typeof window === "undefined") return READ_WPM_DEFAULT;
  try {
    const saved = window.localStorage.getItem(WPM_KEY);
    return saved === null ? READ_WPM_DEFAULT : clampReadWpm(Number(saved));
  } catch {
    /* 저장소를 막아 둔 브라우저 */
    return READ_WPM_DEFAULT;
  }
}

export function saveReadWpm(wpm: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WPM_KEY, String(clampReadWpm(wpm)));
  } catch {
    /* 저장소를 막아 둔 브라우저 */
  }
}

/** 낱말 하나에 머무는 시간(ms). */
export function msPerWord(wpm: number): number {
  return 60_000 / clampReadWpm(wpm);
}

export interface ReadToken {
  text: string;
  /** 표시가 붙는 낱말인지. 띄어쓰기·문장부호는 앞말에 딸려 흐른다. */
  word: boolean;
}

const READ_TOKEN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu;
const WORD_START = /^[\p{L}\p{N}]/u;

/**
 * 따라 읽기용으로 글을 낱말과 그 사이로 쪼갠다. 낱말이 아닌 것은 한 덩어리로 묶어
 * 표시를 붙일 조각 수를 줄인다.
 */
export function splitForReading(text: string): ReadToken[] {
  return (text.match(READ_TOKEN) ?? []).map((token) => ({ text: token, word: WORD_START.test(token) }));
}

/** 따라 읽을 낱말 수. */
export function countReadWords(text: string): number {
  return splitForReading(text).filter((token) => token.word).length;
}
