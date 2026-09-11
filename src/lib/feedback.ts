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

/**
 * 피드백 유형. 코칭 우선순위 순서다. 응답 스키마, 저장된 피드백·표현 검사가 모두 이 목록을 쓴다.
 * transition 은 흐름이 바뀌는 곳에 넣는 연결 표현(What's really nice is…, As a result…)이다.
 */
export const FEEDBACK_CATEGORIES = [
  "storytelling",
  "transition",
  "detail",
  "emotion",
  "delivery",
  "pronunciation",
  "grammar",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

/** 화면과 PDF 모아보기에서 함께 쓰는 유형 이름. */
export const feedbackCategoryLabel: Record<FeedbackCategory, string> = {
  storytelling: "스토리텔링",
  transition: "연결 표현",
  detail: "활동·디테일",
  emotion: "감정·의미",
  delivery: "전달력",
  pronunciation: "발음 체크",
  grammar: "문법",
};

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
  /**
   * 사용자가 실제로 말한 답변에 이번 피드백만 반영해 고친 버전. 새 모범답안이 아니라
   * 스토리와 표현은 그대로 두고 필요한 곳만 손본 것이다. 이 기능 전에 받은 피드백에는 없다.
   */
  improvedAnswer?: string;
  /**
   * improvedAnswer 의 바탕이 된 답변. Before 로 보여 준다. 녹음본을 다시 받아쓴 문항은 그 전사다.
   * 나중에 브라우저 받아쓰기로 되돌려도 비교가 흔들리지 않도록 함께 저장한다.
   */
  improvedFrom?: string;
}

/** 회차 집계의 한 줄. 분모를 함께 들고 다녀 적은 표본을 크게 보이지 않게 한다. */
export interface FeedbackTallyRow {
  label: string;
  /** 보강이 나온 문항 수. */
  count: number;
  /** 이 항목을 볼 수 있었던 문항 수. 비율의 분모다. */
  total: number;
}

export interface FeedbackTally {
  /** 피드백을 받은 문항 수. */
  analyzed: number;
  /** 답변은 했지만 아직 피드백을 받지 않은 문항 수. */
  pending: number;
  /** 답변 흐름 3단계. 문항 유형에 따라 첫 단계의 이름이 갈리므로 줄을 나눠 센다. */
  flow: FeedbackTallyRow[];
  /** 고칠 점으로 실제 나온 유형. 한 문항에서 같은 유형이 여러 번 나와도 한 번만 센다. */
  categories: FeedbackTallyRow[];
}

/**
 * 회차 전체에서 어떤 항목에 보강이 몇 문항 나왔는지 센다.
 *
 * 이것은 집계일 뿐 판정이 아니다. `오늘 고칠 것은 이것`이라고 고르지 않고, 분모를
 * 함께 두어 3문항 중 3개와 15문항 중 3개를 같은 것으로 보이지 않게 한다. 아직
 * 분석하지 않은 문항은 분모에서 빼고 `pending` 으로 따로 밝힌다.
 */
export function tallyFeedback(
  entries: readonly { feedback: OpicFeedback; questionType: string }[],
  pending = 0,
): FeedbackTally {
  const flowRows: FeedbackTallyRow[] = [
    { label: "두괄식 도입", count: 0, total: 0 },
    { label: "요청·문제 전달", count: 0, total: 0 },
    { label: "활동·디테일", count: 0, total: 0 },
    { label: "감정·의미", count: 0, total: 0 },
  ];
  const [frontLoaded, freeOpening, detail, feeling] = flowRows;
  const categoryCounts = new Map<FeedbackCategory, number>();

  for (const { feedback, questionType } of entries) {
    const opening = requiresFrontLoadedOpening(questionType) ? frontLoaded : freeOpening;
    opening.total += 1;
    if (feedback.structure.topic === "needs_work") opening.count += 1;
    detail.total += 1;
    if (feedback.structure.detail === "needs_work") detail.count += 1;
    feeling.total += 1;
    if (feedback.structure.feeling === "needs_work") feeling.count += 1;

    // 한 문항에서 같은 유형이 두 번 나와도 문항 하나로 센다. 세는 단위는 지적 횟수가 아니라 문항이다.
    for (const category of new Set(feedback.items.map((entry) => entry.category))) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  const analyzed = entries.length;
  return {
    analyzed,
    pending: Math.max(0, pending),
    flow: flowRows.filter((row) => row.total > 0),
    categories: FEEDBACK_CATEGORIES
      .filter((category) => (categoryCounts.get(category) ?? 0) > 0)
      .map((category) => ({ label: feedbackCategoryLabel[category], count: categoryCounts.get(category) ?? 0, total: analyzed }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Before / After 로 견줄 두 답변. 예전에 받은 피드백이거나 고친 답변이 비어 있으면 null. */
export function feedbackRewrite(feedback: OpicFeedback): { before: string; after: string } | null {
  const before = feedback.improvedFrom?.trim() ?? "";
  const after = feedback.improvedAnswer?.trim() ?? "";
  return before && after ? { before, after } : null;
}

/** 피드백 JSON 에 드는 출력 토큰. 추론 토큰도 여기서 함께 잘린다. */
const FEEDBACK_OUTPUT_TOKENS = 1_400;
/** 영어는 대략 4글자에 1토큰이다. 고친 답변이 원래보다 조금 길어질 수 있어 3글자로 넉넉히 잡는다. */
const CHARS_PER_OUTPUT_TOKEN = 3;
const MAX_OUTPUT_TOKENS = 6_000;

/**
 * 한 번 요청에 허용할 출력 토큰. 고친 답변은 원래 답변만큼 길어서 답변 길이에 맞춰 늘린다.
 * 모자라면 JSON 이 중간에 잘려 피드백 전체를 잃는다. route.ts 와 cost.ts 가 함께 쓴다.
 */
export function feedbackOutputTokenLimit(answerChars: number): number {
  const answerTokens = Math.ceil(Math.max(0, answerChars) / CHARS_PER_OUTPUT_TOKEN);
  return Math.min(MAX_OUTPUT_TOKENS, FEEDBACK_OUTPUT_TOKENS + answerTokens);
}

/** `/api/feedback` 응답. 피드백과 함께 녹음본을 다시 받아쓴 결과를 돌려준다. */
export interface FeedbackResponse {
  feedback: OpicFeedback;
  /**
   * 녹음본을 OpenAI STT 로 다시 받아쓴 답변.
   * 녹음본이 없거나 전사에 실패하면 빈 문자열이다.
   */
  audioTranscript: string;
}

/** 응답을 읽는다. 형식이 어긋나면 null 을 돌려 호출한 쪽에서 오류로 처리한다. */
export function readFeedbackResponse(value: unknown): FeedbackResponse | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as { feedback?: unknown; audioTranscript?: unknown };
  if (!isOpicFeedback(payload.feedback)) return null;
  return {
    feedback: { ...payload.feedback, items: payload.feedback.items.slice(0, 5) },
    audioTranscript: typeof payload.audioTranscript === "string" ? payload.audioTranscript.trim() : "",
  };
}

export function isOpicFeedback(value: unknown): value is OpicFeedback {
  if (!value || typeof value !== "object") return false;
  const feedback = value as Partial<OpicFeedback>;
  const structure = feedback.structure;
  const statuses: unknown[] = ["good", "needs_work"];
  const categories: readonly unknown[] = FEEDBACK_CATEGORIES;
  const optionalText = (text: unknown) => text === undefined || typeof text === "string";
  return typeof feedback.overall === "string" && !!structure
    && optionalText(feedback.improvedAnswer) && optionalText(feedback.improvedFrom)
    && statuses.includes(structure.topic) && statuses.includes(structure.detail)
    && statuses.includes(structure.feeling) && typeof structure.note === "string"
    && ["audio_compare", "browser_only", "none"].includes(feedback.pronunciationBasis ?? "")
    && Array.isArray(feedback.items) && feedback.items.every((item) => item
      && categories.includes(item.category) && typeof item.title === "string"
      && typeof item.message === "string" && typeof item.example === "string");
}
