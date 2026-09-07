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
