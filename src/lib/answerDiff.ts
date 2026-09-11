/**
 * Before / After 비교에서 바뀐 곳을 찾는다.
 *
 * AI 가 고친 답변(After)은 사용자가 실제로 말한 답변(Before)에서 필요한 곳만 손본
 * 것이라, 단어 단위로 맞대어 보면 무엇을 빼고 무엇을 넣었는지 그대로 드러난다.
 * 말하기 연습이라 대소문자와 문장부호 차이는 바뀐 것으로 치지 않는다. 받아쓰기는
 * 문장부호를 제멋대로 찍어서, 그것까지 칠하면 정작 봐야 할 곳이 묻힌다.
 */

export interface DiffPiece {
  text: string;
  /** Before 에서는 빼거나 바꾼 말, After 에서는 새로 넣거나 바꾼 말. */
  changed: boolean;
}

export interface AnswerDiff {
  before: DiffPiece[];
  after: DiffPiece[];
  /** 바뀐 곳의 수. 붙어 있는 변경은 한 곳으로 센다. */
  changes: number;
}

const TOKEN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|\s+|[^\s\p{L}\p{N}]+/gu;
const WORD_START = /^[\p{L}\p{N}]/u;
/** 가운데 다른 구간이 이보다 크면 맞대어 보지 않고 통째로 바뀐 것으로 본다. 화면이 멈추지 않게 하는 상한이다. */
const MAX_CELLS = 1_000_000;

interface Token {
  text: string;
  word: boolean;
}

function tokenize(text: string): Token[] {
  return (text.trim().match(TOKEN) ?? []).map((token) => ({ text: token, word: WORD_START.test(token) }));
}

function wordKey(word: string): string {
  return word.toLowerCase().replace(/’/g, "'");
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
 * 바뀐 곳의 수. 남은 단어는 양쪽에서 같은 순서로 짝지어지므로, 짝지은 단어 사이의 틈마다
 * 한쪽이라도 바뀐 단어가 있으면 한 곳으로 센다.
 */
function countChanges(changedA: readonly boolean[], changedB: readonly boolean[]): number {
  const gaps = (changed: readonly boolean[]) => {
    const result: boolean[] = [];
    let pending = false;
    for (const flag of changed) {
      if (flag) pending = true;
      else { result.push(pending); pending = false; }
    }
    result.push(pending);
    return result;
  };
  const gapsB = gaps(changedB);
  return gaps(changedA).filter((gap, index) => gap || gapsB[index]).length;
}

/**
 * 토큰을 칠할 조각으로 묶는다. 단어 사이의 띄어쓰기·문장부호는 앞뒤 단어가 모두 바뀌었을
 * 때만 함께 칠해, 여러 단어를 고친 곳이 한 덩어리로 보이게 한다.
 */
function toPieces(tokens: readonly Token[], changedWords: readonly boolean[]): DiffPiece[] {
  const flags = Array<boolean>(tokens.length).fill(false);
  let word = 0;
  tokens.forEach((token, index) => { if (token.word) flags[index] = changedWords[word++]; });

  const nextWordChanged = Array<boolean>(tokens.length).fill(false);
  for (let index = tokens.length - 2; index >= 0; index--) {
    const next = tokens[index + 1];
    nextWordChanged[index] = next.word ? flags[index + 1] : nextWordChanged[index + 1];
  }
  let previousWordChanged = false;
  tokens.forEach((token, index) => {
    if (token.word) previousWordChanged = flags[index];
    else flags[index] = previousWordChanged && nextWordChanged[index];
  });

  const pieces: DiffPiece[] = [];
  tokens.forEach((token, index) => {
    const last = pieces[pieces.length - 1];
    if (last && last.changed === flags[index]) last.text += token.text;
    else pieces.push({ text: token.text, changed: flags[index] });
  });
  return pieces;
}

export function diffAnswers(before: string, after: string): AnswerDiff {
  const beforeTokens = tokenize(before);
  const afterTokens = tokenize(after);
  const a = beforeTokens.filter((token) => token.word).map((token) => wordKey(token.text));
  const b = afterTokens.filter((token) => token.word).map((token) => wordKey(token.text));
  const { changedA, changedB } = markChangedWords(a, b);
  return {
    before: toPieces(beforeTokens, changedA),
    after: toPieces(afterTokens, changedB),
    changes: countChanges(changedA, changedB),
  };
}
