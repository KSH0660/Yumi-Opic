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

/* ------------------------------------------------------------------ */
/* 읽었는지 확인하기                                                     */
/* ------------------------------------------------------------------ */

/**
 * 다 읽은 것으로 볼 커버리지.
 *
 * 브라우저 받아쓰기는 제대로 읽어도 곧잘 틀린다(그래서 이 앱에 녹음본 재전사가 있다).
 * 그래서 넉넉히 잡고, 못 넘겨도 막지 않는다. 판정이 아니라 신호다.
 */
export const READ_COVERAGE_PASS = 0.7;

const CHECK_KEY = "yumi-opic:read-check";
/** 너무 긴 입력에서 화면이 멈추지 않게 하는 상한. */
const MAX_COVERAGE_WORDS = 1_200;

/** 마이크로 확인하며 읽을지. 한 번 정하면 다음 문항에서도 그대로 쓴다. */
export function loadReadCheck(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CHECK_KEY) === "on";
  } catch {
    /* 저장소를 막아 둔 브라우저 */
    return false;
  }
}

export function saveReadCheck(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECK_KEY, on ? "on" : "off");
  } catch {
    /* 저장소를 막아 둔 브라우저 */
  }
}

/**
 * 읽었다고 인정할 최소 연속 낱말 수.
 *
 * 흩어져 하나씩 맞는 낱말은 읽은 증거가 아니다. "I", "a", "the" 는 어디서나 맞아
 * 커버리지를 헛부풀린다. 사람이 소리 내어 읽으면 낱말이 이어져 나오므로 두 낱말부터
 * 센다. 받아쓰기가 만드는 중복을 걷어낼 때도 같은 이유로 두 낱말을 쓴다(`./transcript`).
 */
const MIN_RUN_WORDS = 2;

function coverageKeys(text: string): string[] {
  return splitForReading(text)
    .filter((token) => token.word)
    .map((token) => token.text.toLowerCase().replace(/’/g, "'"));
}

/**
 * 받아쓰기가 따라온 낱말을 읽을 글의 낱말마다 표시한다.
 *
 * 이어진 낱말이 `MIN_RUN_WORDS` 개 이상 그대로 겹치는 구간만 읽은 것으로 본다.
 * 이 규칙 하나가 실제로 읽을 때 일어나는 일 세 가지를 함께 감당한다.
 *
 *  - 되풀이: 같은 대목을 두 번 읽으면 같은 자리를 두 번 표시할 뿐이라 손해가 없다.
 *  - 되돌아가 읽기: 읽던 자리를 앞으로 되돌려도 그 대목이 따로 이어져 나오므로 잡힌다.
 *    순서를 지킨 최장 부분열만 세면 되돌아가 읽은 쪽을 통째로 잃는다.
 *  - 잘못 들어온 말: 받아쓰기가 끼워 넣은 엉뚱한 낱말은 이어지지 않아 세지 않는다.
 *
 * `previous` 를 주면 거기에 더한다. 인식 중인 임시 문장은 확정되기 전까지 계속 고쳐
 * 쓰이므로, 한 번 표시한 낱말이 다음 결과에서 사라지지 않으려면 앞의 표시를 넘겨야 한다.
 */
export function markReadWords(target: string, heard: string, previous?: readonly boolean[]): boolean[] {
  const a = coverageKeys(target).slice(0, MAX_COVERAGE_WORDS);
  // 받아쓰기는 읽는 동안 계속 길어진다. 넘칠 때 남길 쪽은 방금 읽은 끝이다.
  const b = coverageKeys(heard).slice(-MAX_COVERAGE_WORDS);

  const marks = Array<boolean>(a.length).fill(false);
  if (previous) {
    const carried = Math.min(a.length, previous.length);
    for (let i = 0; i < carried; i++) if (previous[i]) marks[i] = true;
  }
  if (a.length === 0 || b.length === 0) return marks;

  // row[j] 는 a[i] 와 b[j] 에서 끝나는, 그대로 이어진 낱말 수다. 한 줄만 굴린다.
  let row = new Uint16Array(b.length);
  let above = new Uint16Array(b.length);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const run = a[i] === b[j] ? (j === 0 ? 0 : above[j - 1]) + 1 : 0;
      row[j] = run;
      /*
       * 길이가 `MIN_RUN_WORDS` 에 닿는 순간부터 이 자리와 그 앞자리를 표시한다.
       * 길이 L 인 구간에서는 끝쪽 L-1 개 자리가 차례로 여기에 걸리므로, 그 앞자리까지
       * 함께 표시하면 구간 전체가 한 번씩 덮인다. 자리마다 두 칸만 건드려 끝난다.
       */
      if (run >= MIN_RUN_WORDS) {
        marks[i] = true;
        marks[i - 1] = true;
      }
    }
    const done = above;
    above = row;
    row = done; // 다음 줄에서 어차피 모든 칸을 덮어쓴다. 비우지 않아도 된다.
  }
  return marks;
}

/** 표시한 낱말의 비율. 0~1. */
export function coverageRatio(marks: readonly boolean[]): number {
  if (marks.length === 0) return 0;
  let covered = 0;
  for (const mark of marks) if (mark) covered++;
  return covered / marks.length;
}

/** 받아쓰기가 읽을 글을 얼마나 따라왔는지 0~1 로 돌려준다. */
export function readCoverage(target: string, heard: string): number {
  return coverageRatio(markReadWords(target, heard));
}
