import type { Question } from "./types";

export interface QuestionExposure {
  count: number;
  lastSeen: number;
  lastAttemptId: string;
}

/** 문항 ID가 달라도 같은 지문이면 함께 센다. 답변이나 녹음은 저장하지 않는다. */
export type ExamExposure = Readonly<Record<string, QuestionExposure>>;

export function questionExposureKey(question: Pick<Question, "en">): string {
  return question.en.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function recordQuestionExposure(
  exposure: ExamExposure, question: Question, attemptId: string, seenAt: number,
): ExamExposure {
  const key = questionExposureKey(question);
  if (!key || question.type === "intro" || !attemptId || !Number.isFinite(seenAt) || seenAt < 0) return exposure;
  const previous = exposure[key];
  // 한 회차의 재청취·지문 열기는 한 번의 출제로 센다.
  if (previous?.lastAttemptId === attemptId) return exposure;
  return { ...exposure, [key]: {
    count: (previous?.count ?? 0) + 1,
    lastSeen: Math.max(previous?.lastSeen ?? 0, seenAt),
    lastAttemptId: attemptId,
  } };
}

/** 저장소가 손상돼도 정상 항목을 살리고, 출제 자체를 막지 않는다. */
export function readExamExposure(value: unknown): ExamExposure | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, QuestionExposure] => {
    const [key, item] = entry;
    return !!key && !!item && typeof item === "object"
      && Number.isSafeInteger(item.count) && item.count > 0
      && typeof item.lastSeen === "number" && Number.isFinite(item.lastSeen) && item.lastSeen >= 0
      && typeof item.lastAttemptId === "string" && !!item.lastAttemptId;
  }));
}
