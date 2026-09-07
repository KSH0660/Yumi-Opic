import type { HistoryEntry } from "./storage";

interface TopicRef { id: string; ko: string }

/**
 * 주제별 연습 기록이 가리키는 주제. 저장된 시험의 focusTopicId 를 먼저 보고,
 * 상세 결과가 없는 예전 기록은 `주제별 연습 · 조깅` 형태의 라벨로 되짚는다.
 */
export function historyTopicId(entry: HistoryEntry, topics: readonly TopicRef[]): string | undefined {
  if (entry.mode !== "practice") return undefined;
  const focus = entry.result?.exam.focusTopicId;
  if (focus && topics.some((topic) => topic.id === focus)) return focus;
  const name = entry.label.split("·").pop()?.trim();
  return name ? topics.find((topic) => topic.ko === name)?.id : undefined;
}

/** 주제 ID → 연습 횟수. 한 번도 연습하지 않은 주제는 키가 없다. */
export function topicPracticeCounts(
  history: readonly HistoryEntry[],
  topics: readonly TopicRef[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of history) {
    const id = historyTopicId(entry, topics);
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
