"use client";
import { FEEDBACK_CATEGORIES, type FeedbackCategory, type OpicFeedback, type OpicFeedbackItem } from "./feedback";

const KEY = "yumi-opic:expressions";
/** 브라우저 저장 공간을 지키기 위한 상한. 넘치면 오래된 것부터 지운다. */
const LIMIT = 200;

/**
 * 결과 화면에서 별표로 저장해 둔 피드백 한 조각.
 * 같은 문항을 다시 풀 때 연습 도구에 다시 띄워 준다.
 */
export interface SavedExpression {
  /** 문항 + 내용으로 만든 고정 키. 같은 문항의 같은 조언을 두 번 저장하지 않는다. */
  id: string;
  questionId: string;
  questionEn: string;
  topicId: string;
  topicKo: string;
  /** 총평을 저장하면 유형이 없다. */
  category?: FeedbackCategory;
  title: string;
  body: string;
  /** 영어 예시 문장. 예시가 없는 조언은 빈 문자열이다. */
  example: string;
  savedAt: number;
}

export type ExpressionDraft = Omit<SavedExpression, "id" | "savedAt">;
/** 조언을 어느 문항에 붙일지. */
export type ExpressionContext = Pick<SavedExpression, "questionId" | "questionEn" | "topicId" | "topicKo">;

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** 같은 문항의 같은 조언은 언제 저장해도 같은 키를 갖는다. */
export function expressionId(questionId: string, title: string, example: string): string {
  return `${questionId}::${normalize(`${title} ${example}`)}`;
}

export function draftId(draft: ExpressionDraft): string {
  return expressionId(draft.questionId, draft.title, draft.example);
}

/** AI 피드백 항목 하나를 저장용 형태로 옮긴다. */
export function expressionFromFeedbackItem(item: OpicFeedbackItem, context: ExpressionContext): ExpressionDraft {
  return { ...context, category: item.category, title: item.title, body: item.message, example: item.example };
}

/** 총평과 흐름 메모를 한 장으로 저장한다. */
export function expressionFromOverall(feedback: OpicFeedback, context: ExpressionContext): ExpressionDraft {
  return {
    ...context,
    title: "총평",
    body: [feedback.overall, feedback.structure.note].filter(Boolean).join(" "),
    example: "",
  };
}

function isSavedExpression(value: unknown): value is SavedExpression {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<SavedExpression>;
  const categories: readonly unknown[] = FEEDBACK_CATEGORIES;
  return [entry.id, entry.questionId, entry.questionEn, entry.topicId, entry.topicKo, entry.title, entry.body, entry.example]
    .every((field) => typeof field === "string")
    && !!entry.id
    && typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
    && (entry.category === undefined || categories.includes(entry.category));
}

export function loadExpressions(): SavedExpression[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .filter(isSavedExpression)
      .filter((entry) => !seen.has(entry.id) && seen.add(entry.id))
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, LIMIT);
  } catch { return []; }
}

function persist(entries: SavedExpression[]): void {
  if (typeof window === "undefined") throw new Error("이 브라우저에서는 표현을 저장할 수 없습니다.");
  try { window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, LIMIT))); }
  catch { throw new Error("표현을 저장하지 못했습니다. 브라우저 저장 공간이나 저장 권한을 확인해 주세요."); }
}

/** 이미 저장한 조언이면 지우고, 아니면 저장한다. 저장 후 목록을 돌려준다. */
export function toggleExpression(draft: ExpressionDraft, now = Date.now()): SavedExpression[] {
  const id = draftId(draft);
  const current = loadExpressions();
  const next = current.some((entry) => entry.id === id)
    ? current.filter((entry) => entry.id !== id)
    : [{ ...draft, id, savedAt: now }, ...current].slice(0, LIMIT);
  persist(next);
  return next;
}

export function removeExpression(id: string): SavedExpression[] {
  const next = loadExpressions().filter((entry) => entry.id !== id);
  persist(next);
  return next;
}

export function clearExpressions(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(KEY); }
  catch { throw new Error("저장한 표현을 지우지 못했습니다. 브라우저 저장 권한을 확인해 주세요."); }
}

/**
 * 연습 도구에 띄울 순서.
 * 지금 푸는 문항에서 저장한 것을 먼저, 그 다음 같은 주제의 다른 문항 것을 보여 준다.
 */
export function expressionsForQuestion(
  entries: readonly SavedExpression[],
  questionId: string,
  topicId: string,
): { thisQuestion: SavedExpression[]; sameTopic: SavedExpression[] } {
  return {
    thisQuestion: entries.filter((entry) => entry.questionId === questionId),
    sameTopic: entries.filter((entry) => entry.questionId !== questionId && entry.topicId === topicId),
  };
}
