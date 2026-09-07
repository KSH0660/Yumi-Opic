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
