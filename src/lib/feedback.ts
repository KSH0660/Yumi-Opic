import type { QuestionType } from "./types";

/**
 * 두괄식(핵심 먼저) 도입을 요구하지 않는 유형.
 * 롤플레이는 전화 대화에 가까워 인사·상황부터 꺼내는 편이 자연스럽고,
 * 요청이나 문제 자체가 곧 핵심이라 서술형과 기준이 다르다.
 */
const FREE_OPENING_TYPES: ReadonlySet<QuestionType> = new Set([
  "roleplay_ask",
  "roleplay_problem",
  "roleplay_experience",
]);

/** 이 문항의 답변을 두괄식 기준으로 볼지. 알 수 없는 유형은 일반 서술형으로 본다. */
export function requiresFrontLoadedOpening(type: string | undefined): boolean {
  return !FREE_OPENING_TYPES.has(type as QuestionType);
}

export type FeedbackCategory =
  | "storytelling"
  | "detail"
  | "emotion"
  | "delivery"
  | "pronunciation"
  | "grammar";

export type FlowStatus = "good" | "needs_work";

export interface OpicFeedbackItem {
  category: FeedbackCategory;
  title: string;
  message: string;
  /** 짧은 영어 개선 예시. 예시가 필요 없으면 빈 문자열이다. */
  example: string;
}

export interface OpicFeedback {
  overall: string;
  structure: {
    topic: FlowStatus;
    detail: FlowStatus;
    feeling: FlowStatus;
    note: string;
  };
  /**
   * audio_compare: 저장된 녹음본을 별도 STT로 다시 들어 브라우저 받아쓰기와 비교함.
   * browser_only: 브라우저 받아쓰기만 있어 발음 추정을 제한함.
   * none: 발음 피드백 근거가 없음.
   */
  pronunciationBasis: "audio_compare" | "browser_only" | "none";
  items: OpicFeedbackItem[];
}

export function isOpicFeedback(value: unknown): value is OpicFeedback {
  if (!value || typeof value !== "object") return false;
  const feedback = value as Partial<OpicFeedback>;
  const structure = feedback.structure;
  const statuses: unknown[] = ["good", "needs_work"];
  const categories: unknown[] = ["storytelling", "detail", "emotion", "delivery", "pronunciation", "grammar"];
  return typeof feedback.overall === "string" && !!structure
    && statuses.includes(structure.topic) && statuses.includes(structure.detail)
    && statuses.includes(structure.feeling) && typeof structure.note === "string"
    && ["audio_compare", "browser_only", "none"].includes(feedback.pronunciationBasis ?? "")
    && Array.isArray(feedback.items) && feedback.items.every((item) => item
      && categories.includes(item.category) && typeof item.title === "string"
      && typeof item.message === "string" && typeof item.example === "string");
}
