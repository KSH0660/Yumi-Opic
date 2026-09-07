"use client";
import { DEFAULT_SURVEY_IDS } from "@/data";
const SETTINGS_KEY = "yumi-opic:settings";
const HISTORY_KEY = "yumi-opic:history";
export interface Settings { enabledSurveyIds: string[]; autoSpeak: boolean; showKorean: boolean }
export const defaultSettings: Settings = { enabledSurveyIds: [...DEFAULT_SURVEY_IDS], autoSpeak: false, showKorean: false };
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
    return { enabledSurveyIds: ids, autoSpeak: typeof value.autoSpeak === "boolean" ? value.autoSpeak : false,
      showKorean: typeof value.showKorean === "boolean" ? value.showKorean : false };
  } catch { return defaultSettings; }
}
export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Storage can be unavailable. */ }
}
export interface HistoryEntry {
  id: string; finishedAt: number; mode: "full" | "practice" | "single";
  label: string; answered: number; totalItems: number; average: number; level: string;
}
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try { const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
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
