"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { deleteHistory, loadHistory, type HistoryEntry } from "@/lib/storage";
import { Card } from "./ui";

/** 연습 기록을 읽고 지우는 공통 훅. 화면마다 필요한 모드만 골라 쓴다. */
export function usePracticeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setHistory(loadHistory());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("pageshow", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("pageshow", refresh); };
  }, []);

  const apply = useCallback((run: () => HistoryEntry[]) => {
    try { setHistory(run()); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "기록을 삭제하지 못했습니다."); }
  }, []);

  const remove = useCallback((id: string) => {
    if (!window.confirm("이 연습 기록과 저장된 피드백을 삭제할까요?")) return;
    apply(() => deleteHistory(id));
  }, [apply]);

  // 화면마다 보이는 기록만 지운다. 다른 모드의 기록은 그대로 둔다.
  const removeAll = useCallback((ids: readonly string[]) => {
    if (!ids.length || !window.confirm("이 목록의 연습 기록과 저장된 피드백을 모두 삭제할까요?")) return;
    apply(() => ids.reduce((_, id) => deleteHistory(id), loadHistory()));
  }, [apply]);

  return { history, error, remove, removeAll };
}

export function HistoryList({ title, entries, error, onRemove, onRemoveAll }: {
  title: string;
  entries: HistoryEntry[];
  error: string | null;
  onRemove: (id: string) => void;
  onRemoveAll: (ids: readonly string[]) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  if (!entries.length) return null;
  return <section className="mt-10">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-fg-muted">{title}</h2>
      <button type="button" className="min-h-11 rounded-lg px-3 text-xs text-fg-muted transition-colors hover:bg-surface-2" onClick={() => onRemoveAll(entries.map((entry) => entry.id))}>전체 삭제</button>
    </div>
    <p className="mt-1 text-xs text-fg-subtle">기록을 누르면 답변과 저장된 피드백을 다시 볼 수 있습니다. 이 브라우저에 최근 20회까지 보관합니다.</p>
    {error && <p role="alert" className="mt-3 text-xs text-warn-ink">{error}</p>}
    <Card className="mt-3 divide-y divide-line overflow-hidden">{entries.slice(0, showAll ? entries.length : 6).map((entry) => (
      <div key={entry.id} className="flex items-center gap-2 pr-3 sm:pr-4">
        <Link href={`/exam?history=${encodeURIComponent(entry.id)}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 p-4 text-sm transition-colors hover:bg-surface-2 focus-visible:outline-offset-[-3px]">
          <span className="text-xs text-fg-muted">{new Date(entry.finishedAt).toLocaleDateString("ko-KR")}</span>
          <span className="min-w-0 flex-1 basis-40 font-medium text-fg">{entry.label}</span>
          <span className="text-xs text-fg-muted">{entry.answered}/{entry.totalItems}문항 답변</span>
          <span className="text-xs text-primary-ink">{entry.result ? "답변·피드백 보기 →" : "요약 보기 →"}</span>
        </Link>
        <button type="button" aria-label={`${entry.label} (${new Date(entry.finishedAt).toLocaleString("ko-KR")}) 기록 삭제`} onClick={() => onRemove(entry.id)} className="min-h-11 shrink-0 rounded-lg border border-line px-3 text-xs text-fg-muted transition-colors hover:bg-surface-2">삭제</button>
      </div>
    ))}</Card>
    {entries.length > 6 && <button type="button" onClick={() => setShowAll((value) => !value)} className="mt-3 min-h-11 rounded-lg border border-line px-4 text-xs text-fg-muted">{showAll ? "접기" : `기록 더 보기 (${entries.length}개)`}</button>}
  </section>;
}
