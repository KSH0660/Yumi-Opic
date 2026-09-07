"use client";
import { DEFAULT_SURVEY_IDS } from "@/data";
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
}
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 이전 버전의 평가 필드는 제외하고 연습 기록만 유지한다.
    const history: HistoryEntry[] = parsed.map(
      ({ id, finishedAt, mode, label, answered, totalItems }) => ({
        id, finishedAt, mode, label, answered, totalItems,
      }),
    );
    const normalized = JSON.stringify(history);
    if (normalized !== raw) {
      try { window.localStorage.setItem(HISTORY_KEY, normalized); }
      catch { /* 저장할 수 없어도 정리된 기록을 반환한다. */ }
    }
    return history;
  } catch { return []; }
}
export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, 20);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* Preserve in-memory result. */ }
  }
  return next;
}
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(HISTORY_KEY); } catch { /* Storage can be unavailable. */ }
}
