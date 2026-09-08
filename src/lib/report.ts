import type { ExamItem } from "./types";
import type { OpicFeedback } from "./feedback";
import type { HistoryEntry } from "./storage";
import { hasAnswerText } from "./answers";

/** 모아보기에 담을 문항 하나. 저장된 결과가 없는 예전 기록에서는 만들어지지 않는다. */
export interface ReportItem {
  item: ExamItem;
  answer: string;
  elapsedSec: number;
  hints: number;
  replays: number;
  feedback?: OpicFeedback;
}

export interface ReportSection {
  id: string;
  label: string;
  finishedAt: number;
  mode: HistoryEntry["mode"];
  items: ReportItem[];
  /** 이 회차에서 고른 범위에 해당하는 문항이 하나도 없을 때의 사유. */
  emptyReason?: "no-detail" | "no-feedback" | "no-answer";
}

export interface FeedbackReport {
  sections: ReportSection[];
  /** 삭제됐거나 다른 브라우저에서 만든 기록. */
  missingIds: string[];
  totals: { entries: number; items: number; feedback: number };
}

/** 모아보기에 담을 범위. 기본은 AI 피드백을 받은 문항만이다. */
export type ReportScope = "feedback" | "answered";

const MAX_IDS = 20;

/** `?ids=a,b,c` 를 읽는다. 중복과 빈 값은 버리고 최대 20개까지만 본다. */
export function parseReportIds(param: string | null | undefined): string[] {
  if (!param) return [];
  return [...new Set(param.split(",").map((id) => id.trim()).filter(Boolean))].slice(0, MAX_IDS);
}

/** 선택한 기록으로 모아보기 주소를 만든다. */
export function reportHref(ids: readonly string[]): string {
  return `/report?ids=${encodeURIComponent([...new Set(ids)].slice(0, MAX_IDS).join(","))}`;
}

function sectionItems(entry: HistoryEntry, scope: ReportScope): ReportItem[] {
  const result = entry.result;
  if (!result) return [];
  return result.exam.items.flatMap((item): ReportItem[] => {
    const answer = result.answers[item.slot] ?? "";
    const feedback = result.feedback[item.slot];
    if (scope === "feedback" ? !feedback : !hasAnswerText(answer)) return [];
    return [{
      item, answer, feedback,
      elapsedSec: result.times[item.slot] ?? 0,
      hints: result.hintUse[item.slot] ?? 0,
      replays: result.replays[item.slot] ?? 0,
    }];
  });
}

function emptyReason(entry: HistoryEntry, scope: ReportScope): ReportSection["emptyReason"] {
  if (!entry.result) return "no-detail";
  return scope === "feedback" ? "no-feedback" : "no-answer";
}

/** 고른 기록을 저장된 순서(최근 순)대로 모은다. */
export function buildFeedbackReport(
  history: readonly HistoryEntry[],
  ids: readonly string[],
  scope: ReportScope,
): FeedbackReport {
  const wanted = new Set(ids);
  const sections = history.filter((entry) => wanted.has(entry.id)).map((entry): ReportSection => {
    const items = sectionItems(entry, scope);
    return {
      id: entry.id, label: entry.label, finishedAt: entry.finishedAt, mode: entry.mode, items,
      emptyReason: items.length ? undefined : emptyReason(entry, scope),
    };
  });
  const found = new Set(sections.map((section) => section.id));
  return {
    sections,
    missingIds: ids.filter((id) => !found.has(id)),
    totals: {
      entries: sections.length,
      items: sections.reduce((sum, section) => sum + section.items.length, 0),
      feedback: sections.reduce((sum, section) => sum + section.items.filter((item) => item.feedback).length, 0),
    },
  };
}

/** 고른 기록에 AI 피드백이 하나도 없으면 답변만이라도 보여 준다. */
export function defaultReportScope(history: readonly HistoryEntry[], ids: readonly string[]): ReportScope {
  return buildFeedbackReport(history, ids, "feedback").totals.items > 0 ? "feedback" : "answered";
}

/** 저장한 기록 중 AI 피드백이 붙은 문항 수. 목록에서 고를 때 도움이 된다. */
export function feedbackCount(entry: HistoryEntry): number {
  return entry.result ? Object.keys(entry.result.feedback).length : 0;
}
