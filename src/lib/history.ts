import type { HistoryEntry } from "./storage";

interface TopicRef { id: string; ko: string }

/** 시각을 가진 기록. 저장된 회차와 모아보기 구획이 함께 쓴다. */
export interface HistoryStamp {
  finishedAt: number;
  updatedAt?: number;
}

/**
 * 목록·결과·모아보기에서 함께 쓰는 시각 표기.
 * 같은 날 여러 번 연습해도 회차를 구분할 수 있도록 분까지 보여 준다.
 */
const STAMP_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric", month: "numeric", day: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
};

/**
 * 화면에 보여 줄 시각. 답변이나 AI 피드백을 나중에 저장했으면 그때가 기준이다.
 * 예전 기록에는 `updatedAt` 이 없어 연습을 마친 시각 그대로 남는다.
 */
export function historyStampAt(entry: HistoryStamp): number {
  return Math.max(entry.finishedAt, entry.updatedAt ?? 0);
}

/** `2026. 9. 8. 14:32` 형태로 적는다. */
export function formatHistoryStamp(entry: HistoryStamp): string {
  return new Date(historyStampAt(entry)).toLocaleString("ko-KR", STAMP_FORMAT);
}

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
