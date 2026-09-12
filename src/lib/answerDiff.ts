/**
 * Before / After 비교에서 바뀐 곳을 찾고, 그 변경이 고칠 점에서 나온 것인지 가른다.
 *
 * AI 가 고친 답변(After)은 사용자가 실제로 말한 답변(Before)을 소리 내어 읽을 만하게
 * 다듬은 것이라, 단어 단위로 맞대어 보면 무엇을 빼고 무엇을 넣었는지 그대로 드러난다.
 * 말하기 연습이라 대소문자와 문장부호 차이는 바뀐 것으로 치지 않는다. 받아쓰기는
 * 문장부호를 제멋대로 찍어서, 그것까지 칠하면 정작 봐야 할 곳이 묻힌다.
 *
 * 바뀐 곳은 두 등급으로 나뉜다. 고칠 점이 요구해서 바뀐 곳(`item`)과 자연스러움만
 * 손본 곳(`fluency`)이다. 둘을 같은 무게로 칠하면 답변이 온통 얼룩져 "다 틀렸다"로
 * 읽히므로 화면은 `item` 만 진하게 칠한다. 어느 쪽인지는 고칠 점이 스스로 인용해 온
 * After 의 한 조각(`afterQuote`)을 After 안에서 되찾아 가른다. 못 찾은 인용문은
 * 조용히 `fluency` 로 남는다. 덜 칠하는 쪽이라 틀려도 화면이 망가지지 않는다.
 */

/** `item` 은 고칠 점이 요구한 변경, `fluency` 는 자연스러움만 손본 변경이다. */
export type DiffTier = "item" | "fluency";

export interface DiffPiece {
  text: string;
  /** Before 에서는 빼거나 바꾼 말, After 에서는 새로 넣거나 바꾼 말. */
  changed: boolean;
  /** 이 조각을 바꾼 이유. 바뀌지 않은 조각에는 없다. */
  tier?: DiffTier;
  /** `item` 등급일 때 그 변경을 요구한 고칠 점의 번호(1부터). 어느 항목인지 모르면 없다. */
  itemNumber?: number;
}

export interface AnswerDiff {
  before: DiffPiece[];
  after: DiffPiece[];
  /** 바뀐 곳의 수. 붙어 있는 변경은 한 곳으로 센다. */
  changes: number;
  /** 그 가운데 고칠 점이 요구해서 바뀐 곳의 수. */
  itemChanges: number;
  /** 그 가운데 자연스러움만 손본 곳의 수. */
  fluencyChanges: number;
  /** After 에서 칠할 자리를 찾아낸 고칠 점 번호. 오름차순이다. */
  locatedItems: number[];
}

const TOKEN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|\s+|[^\s\p{L}\p{N}]+/gu;
const WORD_START = /^[\p{L}\p{N}]/u;
/** 가운데 다른 구간이 이보다 크면 맞대어 보지 않고 통째로 바뀐 것으로 본다. 화면이 멈추지 않게 하는 상한이다. */
const MAX_CELLS = 1_000_000;

interface Token {
  text: string;
  word: boolean;
}

/** 바뀐 단어 하나에 붙는 표시. */
interface Mark {
  tier: DiffTier;
  itemNumber?: number;
}

function tokenize(text: string): Token[] {
  return (text.trim().match(TOKEN) ?? []).map((token) => ({ text: token, word: WORD_START.test(token) }));
}

function wordKey(word: string): string {
  return word.toLowerCase().replace(/’/g, "'");
}

function wordKeys(tokens: readonly Token[]): string[] {
  return tokens.filter((token) => token.word).map((token) => wordKey(token.text));
}

/**
 * 두 단어 열에서 바뀐 단어를 표시한다. 앞뒤로 같은 부분을 먼저 떼어 내고 가운데만
 * 최장 공통 부분열로 맞댄다. 고친 답변은 대부분이 같아서 가운데가 작다.
 */
function markChangedWords(a: readonly string[], b: readonly string[]) {
  const changedA = Array<boolean>(a.length).fill(false);
  const changedB = Array<boolean>(b.length).fill(false);

  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let endA = a.length;
  let endB = b.length;
  while (endA > head && endB > head && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

  const n = endA - head;
  const m = endB - head;
  if (n * m > MAX_CELLS) {
    changedA.fill(true, head, endA);
    changedB.fill(true, head, endB);
    return { changedA, changedB };
  }

  // lcs[i * width + j] 는 a[head+i..], b[head+j..] 의 최장 공통 부분열 길이다.
  const width = m + 1;
  const lcs = new Uint16Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * width + j] = a[head + i] === b[head + j]
        ? lcs[(i + 1) * width + j + 1] + 1
        : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[head + i] === b[head + j]) {
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[(i + 1) * width + j] >= lcs[i * width + j + 1])) {
      changedA[head + i++] = true;
    } else {
      changedB[head + j++] = true;
    }
  }
  return { changedA, changedB };
}

/**
 * 곳(틈)마다 바뀐 단어가 있는지. 남은 단어는 양쪽에서 같은 순서로 짝지어지므로,
 * 짝지은 단어 사이의 틈은 양쪽에서 같은 번호를 갖는다.
 */
function gapFlags(changed: readonly boolean[]): boolean[] {
  const result: boolean[] = [];
  let pending = false;
  for (const flag of changed) {
    if (flag) pending = true;
    else { result.push(pending); pending = false; }
  }
  result.push(pending);
  return result;
}

/** 단어마다 그 단어가 속한 틈의 번호. 바뀌지 않은 단어는 자기가 닫는 틈의 번호를 갖는다. */
function gapIndexes(changed: readonly boolean[]): number[] {
  const result: number[] = [];
  let gap = 0;
  for (const flag of changed) {
    result.push(gap);
    if (!flag) gap++;
  }
  return result;
}

/**
 * 인용문이 가리키는 After 단어 구간. 대소문자·문장부호를 뺀 단어열이 그대로 이어져
 * 나오는 자리를 찾는다. 같은 말이 여러 번 나오면 바뀐 단어를 품은 자리를 먼저
 * 고른다. 고칠 점이 손댄 자리가 그쪽이기 때문이다.
 */
function locateQuote(words: readonly string[], changed: readonly boolean[], quote: string) {
  const needle = wordKeys(tokenize(quote));
  if (needle.length === 0 || needle.length > words.length) return null;

  let fallback: { start: number; end: number } | null = null;
  for (let start = 0; start + needle.length <= words.length; start++) {
    let hit = true;
    for (let index = 0; index < needle.length; index++) {
      if (words[start + index] !== needle[index]) { hit = false; break; }
    }
    if (!hit) continue;
    const end = start + needle.length;
    for (let index = start; index < end; index++) {
      if (changed[index]) return { start, end };
    }
    fallback ??= { start, end };
  }
  return fallback;
}

/**
 * 틈마다 그 변경을 요구한 고칠 점 번호. 한 틈에 여러 항목이 걸리면 앞선 항목이
 * 이긴다. 고칠 점은 전달력에 영향이 큰 것부터 오므로 앞선 번호가 더 중요하다.
 */
function buildGapItems(
  words: readonly string[],
  changed: readonly boolean[],
  gaps: readonly number[],
  quotes: readonly string[],
  /** 그 틈이 Before 에서 말을 뺀 것뿐인지. 말을 빼기만 한 항목을 찾는 데 쓴다. */
  isDeletionOnly: (gap: number) => boolean,
) {
  const gapItems: (number | undefined)[] = [];
  const locatedItems: number[] = [];
  quotes.forEach((quote, index) => {
    const range = quote.trim() ? locateQuote(words, changed, quote) : null;
    if (!range) return;
    let painted = false;
    for (let word = range.start; word < range.end; word++) {
      if (!changed[word]) continue;
      painted = true;
      gapItems[gaps[word]] ??= index + 1;
    }
    /*
     * After 쪽 단어가 하나도 바뀌지 않은 인용문. 말을 빼기만 한 고칠 점이 그렇다.
     * 되풀이한 "so" 를 지우면 뒤따르는 "After that" 은 글자 하나 안 바뀌므로, 그
     * 변경은 Before 쪽에만 남는다. 이때만 인용문이 걸친 틈에서 빠진 말을 찾아 붙인다.
     * 바뀌지 않은 단어는 자기 앞의 틈 번호를 갖고 있어, 인용문 바로 앞에서 빠진 말이
     * 여기에 걸린다.
     *
     * 새로 넣은 말이 섞인 틈은 건너뛴다. 그 말은 이 항목이 인용하지 않았으니 다른
     * 항목이나 다듬기의 몫이고, 거기에 번호를 붙이면 엉뚱한 자리를 이 항목의 것으로
     * 가리킨다. 번호를 못 붙이는 편이 잘못 붙이는 편보다 낫다.
     */
    if (!painted) {
      for (let word = range.start; word < range.end; word++) {
        if (!isDeletionOnly(gaps[word])) continue;
        painted = true;
        gapItems[gaps[word]] ??= index + 1;
        break;
      }
    }
    // 여기까지 와서도 칠할 것이 없으면 그 항목은 텍스트를 바꾸지 않았다.
    if (painted) locatedItems.push(index + 1);
  });
  return { gapItems, locatedItems };
}

/**
 * 토큰을 칠할 조각으로 묶는다. 단어 사이의 띄어쓰기·문장부호는 앞뒤 단어가 같은
 * 등급으로 바뀌었을 때만 함께 칠해, 한 곳을 고친 자리가 한 덩어리로 보이게 한다.
 */
function toPieces(tokens: readonly Token[], wordMarks: ReadonlyArray<Mark | null>): DiffPiece[] {
  const key = (mark: Mark | null) => (mark ? `${mark.tier}:${mark.itemNumber ?? ""}` : "");
  const marks = Array<Mark | null>(tokens.length).fill(null);
  let word = 0;
  tokens.forEach((token, index) => { if (token.word) marks[index] = wordMarks[word++]; });

  const nextWordMark = Array<Mark | null>(tokens.length).fill(null);
  for (let index = tokens.length - 2; index >= 0; index--) {
    const next = tokens[index + 1];
    nextWordMark[index] = next.word ? marks[index + 1] : nextWordMark[index + 1];
  }
  let previousWordMark: Mark | null = null;
  tokens.forEach((token, index) => {
    if (token.word) { previousWordMark = marks[index]; return; }
    marks[index] = key(previousWordMark) === key(nextWordMark[index]) ? previousWordMark : null;
  });

  const pieces: DiffPiece[] = [];
  let lastKey: string | null = null;
  tokens.forEach((token, index) => {
    const mark = marks[index];
    const markKey = key(mark);
    if (pieces.length && lastKey === markKey) {
      pieces[pieces.length - 1].text += token.text;
      return;
    }
    lastKey = markKey;
    pieces.push(mark
      ? {
        text: token.text,
        changed: true,
        tier: mark.tier,
        ...(mark.itemNumber === undefined ? {} : { itemNumber: mark.itemNumber }),
      }
      : { text: token.text, changed: false });
  });
  return pieces;
}

/**
 * Before / After 를 맞대어 칠할 조각을 만든다.
 *
 * `quotes` 는 고칠 점이 After 에서 손댄 자리를 항목 순서대로 인용한 것이다. 아예
 * 넘기지 않으면 이 등급이 생기기 전에 받은 최소 수정본으로 보고 바뀐 곳 전부를
 * `item` 등급으로 둔다. 그런 피드백은 고칠 점이 요구한 것만 고친 결과여서 예전처럼
 * 다 진하게 칠하는 것이 맞다.
 */
export function diffAnswers(before: string, after: string, quotes?: readonly string[]): AnswerDiff {
  const beforeTokens = tokenize(before);
  const afterTokens = tokenize(after);
  const a = wordKeys(beforeTokens);
  const b = wordKeys(afterTokens);
  const { changedA, changedB } = markChangedWords(a, b);

  const gapsA = gapIndexes(changedA);
  const gapsB = gapIndexes(changedB);
  const flagsA = gapFlags(changedA);
  const flagsB = gapFlags(changedB);
  const hasChange = (gap: number) => !!flagsA[gap] || !!flagsB[gap];
  const isDeletionOnly = (gap: number) => !!flagsA[gap] && !flagsB[gap];
  const { gapItems, locatedItems } = quotes
    ? buildGapItems(b, changedB, gapsB, quotes, isDeletionOnly)
    : { gapItems: [] as (number | undefined)[], locatedItems: [] as number[] };

  const tierAt = (gap: number): DiffTier => (!quotes || gapItems[gap] !== undefined ? "item" : "fluency");
  const marksOf = (changed: readonly boolean[], gaps: readonly number[]): (Mark | null)[] =>
    changed.map((flag, index) => {
      if (!flag) return null;
      const itemNumber = gapItems[gaps[index]];
      return itemNumber === undefined ? { tier: tierAt(gaps[index]) } : { tier: "item", itemNumber };
    });

  let itemChanges = 0;
  let fluencyChanges = 0;
  flagsA.forEach((flag, gap) => {
    if (!hasChange(gap)) return;
    if (tierAt(gap) === "item") itemChanges++;
    else fluencyChanges++;
  });

  return {
    before: toPieces(beforeTokens, marksOf(changedA, gapsA)),
    after: toPieces(afterTokens, marksOf(changedB, gapsB)),
    changes: itemChanges + fluencyChanges,
    itemChanges,
    fluencyChanges,
    locatedItems,
  };
}
