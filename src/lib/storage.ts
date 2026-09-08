"use client";
import { DEFAULT_SURVEY_IDS } from "../data";
import type { Exam, ExamItem } from "./types";
import { isOpicFeedback, type OpicFeedback } from "./feedback";
const SETTINGS_KEY = "yumi-opic:settings";
const HISTORY_KEY = "yumi-opic:history";
/** volume 은 문제 낭독 음량(0~1)이다. 시험 화면의 음량 슬라이더가 여기에 저장된다. */
export interface Settings { enabledSurveyIds: string[]; volume: number }
export const defaultSettings: Settings = { enabledSurveyIds: [...DEFAULT_SURVEY_IDS], volume: 1 };
export function loadSettings(): Settings {
  if (typeof window === "undefined") return { ...defaultSettings, enabledSurveyIds: [...defaultSettings.enabledSurveyIds] };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings, enabledSurveyIds: [...defaultSettings.enabledSurveyIds] };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultSettings;
    const value = parsed as Partial<Settings>;
    // Keep unknown IDs so the UI can explain unsupported coverage. Never add unchosen topics.
    const ids = Array.isArray(value.enabledSurveyIds)
      ? [...new Set(value.enabledSurveyIds.filter((id): id is string => typeof id === "string"))]
      : [...DEFAULT_SURVEY_IDS];
    const volume = typeof value.volume === "number" && Number.isFinite(value.volume)
      ? Math.min(1, Math.max(0, value.volume))
      : defaultSettings.volume;
    return { enabledSurveyIds: ids, volume };
  } catch { return defaultSettings; }
}
export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Storage can be unavailable. */ }
}
export interface HistoryEntry {
  id: string; finishedAt: number; mode: "full" | "practice" | "single";
  label: string; answered: number; totalItems: number;
  /** 답변이나 AI 피드백을 마지막으로 저장한 시각. 저장을 한 번도 덧붙이지 않은 기록에는 없다. */
  updatedAt?: number;
  /** 이전 버전은 요약만 저장했다. 녹음 Blob/URL은 저장하지 않는다. */
  result?: SavedResult;
}
export interface SavedResult {
  exam: Exam;
  /** 화면과 통계에 쓰는 답변 정본. 녹음본을 OpenAI 로 다시 받아쓰면 그 텍스트로 바뀐다. */
  answers: Record<number, string>;
  /** OpenAI 받아쓰기가 덮어쓰기 전의 브라우저 받아쓰기. 되돌리기와 발음 비교에 쓴다. */
  browserAnswers?: Record<number, string>;
  times: Record<number, number>;
  hintUse: Record<number, number>;
  replays: Record<number, number>;
  feedback: Record<number, OpicFeedback>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isExamItem(value: unknown): value is ExamItem {
  if (!isRecord(value) || !isRecord(value.question)) return false;
  return Number.isInteger(value.slot) && isCount(value.slot) && value.slot > 0
    && [value.topicId, value.topicKo, value.topicEn, value.emoji, value.comboLabel, value.typeLabel,
      value.question.id, value.question.type, value.question.en, value.question.ko]
      .every((field) => typeof field === "string");
}

function readResult(value: unknown): SavedResult | undefined {
  if (!isRecord(value) || !isRecord(value.exam)) return undefined;
  const exam = value.exam;
  if (typeof exam.id !== "string" || !isCount(exam.createdAt)
    || !["full", "practice", "single"].includes(String(exam.mode))
    || !Array.isArray(exam.items) || exam.items.length === 0 || !exam.items.every(isExamItem)
    || new Set(exam.items.map((item) => item.slot)).size !== exam.items.length) return undefined;
  const numbers = (record: unknown): Record<number, number> => Object.fromEntries(
    Object.entries(isRecord(record) ? record : {}).filter(([, count]) => isCount(count)),
  ) as Record<number, number>;
  const texts = (record: unknown): Record<number, string> => Object.fromEntries(
    Object.entries(isRecord(record) ? record : {}).filter(([, text]) => typeof text === "string"),
  ) as Record<number, string>;
  // 원본 받아쓰기는 OpenAI 로 다시 받아쓴 문항에만 있다. 없는 기록에 빈 값을 만들지 않는다.
  const browserAnswers = texts(value.browserAnswers);
  return {
    exam: exam as unknown as Exam,
    answers: texts(value.answers),
    ...(Object.keys(browserAnswers).length ? { browserAnswers } : {}),
    times: numbers(value.times), hintUse: numbers(value.hintUse), replays: numbers(value.replays),
    feedback: Object.fromEntries(Object.entries(isRecord(value.feedback) ? value.feedback : {})
      .filter(([, feedback]) => isOpicFeedback(feedback))) as Record<number, OpicFeedback>,
  };
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.flatMap((entry: unknown, index: number): HistoryEntry[] => {
      if (!isRecord(entry) || typeof entry.id !== "string" || !entry.id
        || typeof entry.label !== "string" || !isCount(entry.finishedAt)
        || !isCount(entry.answered) || !isCount(entry.totalItems)
        || !["full", "practice", "single"].includes(String(entry.mode))) return [];
      // 이전 버전은 같은 시험을 다시 풀 때 ID를 재사용했다. 그 요약도 보존한다.
      let id = entry.id;
      while (seen.has(id)) id = `${id}:legacy:${entry.finishedAt}:${index}`;
      seen.add(id);
      return [{
        id, finishedAt: entry.finishedAt, label: entry.label,
        mode: entry.mode as HistoryEntry["mode"], answered: entry.answered, totalItems: entry.totalItems,
        ...(isCount(entry.updatedAt) ? { updatedAt: entry.updatedAt } : {}),
        result: readResult(entry.result),
      }];
    }).slice(0, 20);
  } catch { return []; }
}

function saveHistory(history: HistoryEntry[]): void {
  if (typeof window === "undefined") throw new Error("이 브라우저에서 기록을 저장할 수 없습니다.");
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    throw new Error("기록을 저장하지 못했습니다. 브라우저 저장 공간이나 저장 권한을 확인해 주세요.");
  }
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)].slice(0, 20);
  saveHistory(next);
  return next;
}

/**
 * 피드백이 늦게 도착해도 다른 탭에서 삭제한 기록을 되살리지 않는다.
 * 연습을 마친 시각은 그대로 두고, 목록에 보여 줄 시각만 지금으로 옮긴다.
 */
export function updateHistoryResult(id: string, result: SavedResult): void {
  const history = loadHistory();
  if (!history.some((entry) => entry.id === id)) throw new Error("이 연습 기록이 삭제되어 변경 내용을 저장하지 못했습니다.");
  saveHistory(history.map((entry) => entry.id === id ? {
    ...entry, result, updatedAt: Date.now(),
    answered: result.exam.items.filter((item) => (result.answers[item.slot] ?? "").trim()).length,
  } : entry));
}

export function deleteHistory(id: string): HistoryEntry[] {
  return deleteHistoryEntries([id]);
}

/** 고른 기록을 한 번에 지운다. 저장은 한 번만 해서 중간에 실패한 상태를 남기지 않는다. */
export function deleteHistoryEntries(ids: readonly string[]): HistoryEntry[] {
  const removed = new Set(ids);
  const next = loadHistory().filter((entry) => !removed.has(entry.id));
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(HISTORY_KEY); }
  catch { throw new Error("기록을 삭제하지 못했습니다. 브라우저 저장 권한을 확인해 주세요."); }
}
