/** 영어 단어 토큰을 뽑는다. 답변 품질 평가는 하지 않는다. */
export function englishWords(text: string): string[] {
  return text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? [];
}

/** 입력된 텍스트의 전체 영어 단어 수. 같은 단어를 여러 번 말하면 모두 센다. */
export function countEnglishWords(text: string): number {
  return englishWords(text).length;
}

/** 입력된 텍스트에서 중복을 제거한 영어 단어 수. 대소문자는 구분하지 않는다. */
export function countUniqueEnglishWords(text: string): number {
  return new Set(englishWords(text).map((word) => word.toLowerCase())).size;
}

/**
 * 받아쓰기 텍스트 기준 문장 수.
 * 마침표/물음표/느낌표로 구분하며, 문장부호가 전혀 없는 받아쓰기도 내용이 있으면 1문장으로 센다.
 */
export function countEnglishSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed
    .split(/[.!?]+(?:\s+|$)/)
    .map((part) => part.trim())
    .filter(Boolean);
  return Math.max(1, parts.length);
}

/** 공백만 있거나 받아쓰기/직접 입력이 없는 문항은 미답변으로 처리한다. */
export function hasAnswerText(text: string | undefined): boolean {
  return !!text?.trim();
}

/**
 * 화면과 통계에 쓸 답변 정본.
 *
 * 결과 화면에서 답변을 바꿔 쓴 문항만 덮는다. 브라우저 받아쓰기는 발음이 조금만
 * 흐려도 엉뚱한 단어를 적으므로, AI 분석에 녹음본을 함께 보낸 문항은 OpenAI 가 다시
 * 받아쓴 텍스트로 바뀐다. 되돌리면 원래 받아쓰기가 다시 덮는다.
 * 빈 텍스트는 답변을 지우지 않도록 무시한다.
 */
export function applyAnswerRewrites(
  answers: Record<number, string>,
  rewrites: Record<number, string>,
): Record<number, string> {
  const merged: Record<number, string> = { ...answers };
  for (const [slot, text] of Object.entries(rewrites)) {
    if (hasAnswerText(text)) merged[Number(slot)] = text;
  }
  return merged;
}

/**
 * 두 받아쓰기가 사실상 같은 말인지.
 * 대소문자·문장부호·띄어쓰기만 다르면 바꿀 이유가 없어 저장도 하지 않는다.
 */
export function sameSpokenText(a: string, b: string): boolean {
  const normalize = (text: string) => englishWords(text).join(" ").toLowerCase();
  return normalize(a) === normalize(b);
}

/** 통계와 평균의 분모는 실제로 답변 텍스트가 있는 문항만 포함한다. */
export function summarizeAnswers(
  items: readonly { slot: number }[],
  answers: Record<number, string>,
  times: Record<number, number> = {},
  hintUse: Record<number, number> = {},
  replays: Record<number, number> = {},
) {
  const answeredSlots = items.filter((item) => hasAnswerText(answers[item.slot])).map((item) => item.slot);
  const texts = answeredSlots.map((slot) => answers[slot]);
  const totalWords = texts.reduce((sum, text) => sum + countEnglishWords(text), 0);
  return {
    answeredSlots,
    answeredCount: answeredSlots.length,
    skippedCount: items.length - answeredSlots.length,
    totalWords,
    averageWords: answeredSlots.length ? totalWords / answeredSlots.length : null,
    uniqueWords: new Set(texts.flatMap((text) => englishWords(text).map((word) => word.toLowerCase()))).size,
    totalSentences: texts.reduce((sum, text) => sum + countEnglishSentences(text), 0),
    totalTime: answeredSlots.reduce((sum, slot) => sum + (times[slot] ?? 0), 0),
    totalHints: answeredSlots.reduce((sum, slot) => sum + (hintUse[slot] ?? 0), 0),
    totalReplays: answeredSlots.reduce((sum, slot) => sum + (replays[slot] ?? 0), 0),
  };
}

/** 결과 화면에서 문항 목록을 보여 주는 범위. */
export type ResultFilter = "answered" | "all";

/**
 * 결과 화면을 열 때의 기본 보기.
 * 답변한 문항이 있으면서 미답변이 섞여 있을 때만 답변한 문항부터 보여 준다.
 * 하나도 답변하지 않았다면 빈 목록이 되지 않도록 전체를 보여 준다.
 */
export function defaultResultFilter(answeredCount: number, totalCount: number): ResultFilter {
  return answeredCount > 0 && answeredCount < totalCount ? "answered" : "all";
}

/** 결과 화면에 보여 줄 문항. "answered"는 답변 텍스트가 있는 문항만 남긴다. */
export function filterItemsByAnswer<T extends { slot: number }>(
  items: readonly T[],
  answers: Record<number, string>,
  filter: ResultFilter,
): T[] {
  if (filter === "all") return [...items];
  return items.filter((item) => hasAnswerText(answers[item.slot]));
}
