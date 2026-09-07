/**
 * 음성 인식 결과를 답변 텍스트로 접는 순수 로직.
 *
 * 브라우저 SpeechRecognition 은 기기마다 결과를 다르게 흘려보낸다.
 *
 *  1. 안드로이드 크롬은 `event.resultIndex` 를 거의 늘 0 으로 준다. 이 값을 믿고
 *     그 자리부터 이어 붙이면 이미 확정된 문장이 이벤트마다 다시 쌓인다.
 *  2. 한 발화를 누적한 final 결과를 여러 칸에 나눠 보내는 기기가 있다
 *     (`results[0] = "I like"`, `results[1] = "I like running"`).
 *  3. `continuous` 를 켜도 발화마다 인식이 끊긴다. 다시 켜면 인덱스가 0 부터
 *     시작하고, 직전 문장의 끝을 한 번 더 주는 기기가 있다.
 *
 * 그래서 결과를 단순히 이어 붙이면 같은 말이 계속 쌓인다. 여기서는 이어 붙이는
 * 자리마다 겹치는 단어를 걷어낸다. 브라우저 API 를 쓰지 않으므로 테스트에서
 * 그대로 부를 수 있다.
 */

/** 인식 결과 한 칸. 브라우저 SpeechRecognitionResult 를 옮겨 담은 값이다. */
export interface TranscriptChunk {
  isFinal: boolean;
  transcript: string;
}

export interface TranscriptDraft {
  /** 확정된 문장을 이어 붙인 값 */
  committed: string;
  /** 아직 인식 중인 임시 문장 */
  interim: string;
}

/** 이어 붙이는 자리에서 살펴볼 최대 단어 수. */
const MAX_OVERLAP_WORDS = 24;

/**
 * 겹침으로 인정하는 최소 단어 수.
 *
 * 한 단어까지 겹침으로 보면 "I like it" + "it was fun" 처럼 멀쩡한 문장을
 * "I like it was fun" 으로 만들어 버린다. 인식기가 만드는 중복은 발화 단위라
 * 두 단어 이상이므로, 두 단어부터 지운다.
 */
const MIN_OVERLAP_WORDS = 2;

function toWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/** 대소문자와 문장부호를 지우고 비교한다. 인식기가 같은 말에 마침표를 붙였다 뗐다 한다. */
function normalize(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
}

/** `haystack` 의 `at` 번째 자리부터 `needle` 이 그대로 들어 있는지 본다. */
function containsAt(haystack: string[], needle: string[], at: number): boolean {
  if (at < 0 || at + needle.length > haystack.length) return false;
  for (let i = 0; i < needle.length; i++) {
    if (normalize(haystack[at + i]) !== normalize(needle[i])) return false;
  }
  return true;
}

/**
 * `addition` 이 방금 적은 대목 어딘가에 통째로 다시 나오는지 본다.
 *
 * 되풀이는 늘 직전 발화라서, 살펴보는 자리를 끝에서 겹침 창만큼으로 묶어 둔다.
 * 앞쪽에서 우연히 같은 말이 나왔다고 지우는 일도 이 제한이 막아 준다.
 */
function repeatsRecent(leftWords: string[], rightWords: string[]): boolean {
  if (rightWords.length < MIN_OVERLAP_WORDS) return false;
  const last = leftWords.length - rightWords.length;
  const first = Math.max(0, last - MAX_OVERLAP_WORDS);
  for (let at = last; at >= first; at--) {
    if (containsAt(leftWords, rightWords, at)) return true;
  }
  return false;
}

/**
 * `base` 의 끝과 `addition` 의 앞이 몇 단어나 겹치는지 센다.
 * 가장 길게 겹치는 값을 고른다. 누적 결과(2번 사례)는 앞 문장을 통째로 품고 있어서다.
 */
export function overlapWordCount(base: string, addition: string): number {
  const left = toWords(base);
  const right = toWords(addition);
  const max = Math.min(left.length, right.length, MAX_OVERLAP_WORDS);
  for (let size = max; size >= MIN_OVERLAP_WORDS; size--) {
    let same = true;
    for (let i = 0; i < size; i++) {
      if (normalize(left[left.length - size + i]) !== normalize(right[i])) {
        same = false;
        break;
      }
    }
    if (same) return size;
  }
  return 0;
}

/** 두 인식 결과를 잇는다. 이어지는 자리에서 겹치는 단어는 한 번만 남긴다. */
export function mergeTranscript(base: string, addition: string): string {
  const left = base.replace(/\s+$/, "");
  const right = addition.trim();
  if (!left) return right;
  if (!right) return left;

  const leftWords = toWords(left);
  const rightWords = toWords(right);

  // 통째로 품고 있는 경우를 먼저 잡는다. 한 발화가 길면 아래의 겹침
  // 창(MAX_OVERLAP_WORDS)만으로는 놓치기 때문이다.
  //
  // 뒤 문장이 앞 문장을 통째로 품는다: 앞 문장을 누적해 다시 보내는 기기.
  // 인식기가 다듬은 긴 쪽을 남긴다.
  if (leftWords.length >= MIN_OVERLAP_WORDS && containsAt(rightWords, leftWords, 0)) return right;
  // 방금 적은 대목이 통째로 다시 왔다: 다시 켜진 세션이 직전 발화를 되풀이하는 경우.
  if (repeatsRecent(leftWords, rightWords)) return left;

  const overlap = overlapWordCount(left, right);
  if (overlap === 0) return `${left} ${right}`;

  const rest = rightWords.slice(overlap);
  if (rest.length === 0) return left;
  return `${left} ${rest.join(" ")}`;
}

/**
 * 인식 세션 하나가 들고 있는 결과 전체를 텍스트로 접는다.
 *
 * 인덱스를 자리로 삼아 매번 통째로 다시 읽는 쪽에서 부른다. 같은 결과가 두 번
 * 와도 같은 자리를 덮어쓰므로 텍스트가 늘어나지 않는다.
 */
export function collectTranscript(chunks: readonly TranscriptChunk[]): TranscriptDraft {
  let committed = "";
  let interim = "";
  for (const chunk of chunks) {
    if (!chunk) continue;
    if (chunk.isFinal) committed = mergeTranscript(committed, chunk.transcript);
    else interim = mergeTranscript(interim, chunk.transcript);
  }
  return { committed, interim };
}
