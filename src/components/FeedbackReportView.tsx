"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildFeedbackReport,
  defaultReportScope,
  parseReportIds,
  type ReportItem,
  type ReportScope,
  type ReportSection,
} from "@/lib/report";
import { feedbackCategoryLabel, requiresFrontLoadedOpening } from "@/lib/feedback";
import { countEnglishWords } from "@/lib/answers";
import { formatHistoryStamp } from "@/lib/history";
import { loadHistory, type HistoryEntry } from "@/lib/storage";
import { Badge, Card } from "./ui";

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

const emptyReasonText: Record<NonNullable<ReportSection["emptyReason"]>, string> = {
  "no-detail": "이전 버전에서 저장한 요약 기록이라 질문과 답변이 남아 있지 않습니다.",
  "no-feedback": "이 회차에는 AI 피드백을 받은 문항이 없습니다. 위에서 답변한 문항 전체로 바꿔 보세요.",
  "no-answer": "이 회차에는 답변한 문항이 없습니다.",
};

/** 고른 연습 기록의 답변과 AI 피드백을 한 화면에 모아 보고, 그대로 인쇄해 PDF로 저장한다. */
export default function FeedbackReportView() {
  const params = useSearchParams();
  const ids = useMemo(() => parseReportIds(params.get("ids")), [params]);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [scope, setScope] = useState<ReportScope | null>(null);

  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
    setScope(defaultReportScope(loaded, ids));
  }, [ids]);

  if (!history || !scope) return <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-fg-muted">모아보기를 준비하는 중…</main>;

  const report = buildFeedbackReport(history, ids, scope);
  const answeredTotals = buildFeedbackReport(history, ids, "answered").totals;
  const feedbackTotals = buildFeedbackReport(history, ids, "feedback").totals;

  return <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
    <div className="print-hide flex flex-wrap items-center justify-between gap-3">
      <Link href="/topics" className="text-sm text-fg-muted transition hover:text-fg">← 주제별 연습</Link>
      <Link href="/exam?mode=full" className="text-sm text-fg-muted transition hover:text-fg">실전 모의고사 →</Link>
    </div>

    <Card className="mt-5 p-6 sm:p-8">
      <Badge tone="accent">피드백 모아보기</Badge>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">연습 기록 {report.totals.entries}회 · {report.totals.items}문항</h1>
      <p className="mt-2 text-xs text-fg-subtle">{new Date().toLocaleString("ko-KR")} 기준 · AI 피드백 {report.totals.feedback}개</p>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">고른 연습 기록의 질문·답변·AI 피드백을 한 화면에 모았습니다.</p>
      <p className="print-hide mt-2 text-sm leading-relaxed text-fg-muted"><strong className="font-medium text-fg">PDF로 저장</strong>을 누르면 브라우저 인쇄 창이 열립니다. 대상을 <strong className="font-medium text-fg">PDF로 저장</strong>으로 고르면 파일로 남길 수 있습니다.</p>

      {ids.length === 0 && <p role="alert" className="mt-4 text-sm text-warn-ink">고른 기록이 없습니다. 연습 기록 목록에서 회차를 선택한 뒤 다시 눌러 주세요.</p>}
      {report.missingIds.length > 0 && <p role="alert" className="mt-4 text-sm text-warn-ink">기록 {report.missingIds.length}개는 이미 삭제됐거나 다른 브라우저에서 저장한 것이라 담지 못했습니다.</p>}

      <div className="print-hide mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover">PDF로 저장 (인쇄)</button>
        <div role="group" aria-label="담을 문항 범위" className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1">
          <ScopeButton active={scope === "feedback"} onClick={() => setScope("feedback")}>피드백 받은 문항 {feedbackTotals.items}</ScopeButton>
          <ScopeButton active={scope === "answered"} onClick={() => setScope("answered")}>답변한 문항 {answeredTotals.items}</ScopeButton>
        </div>
      </div>
      <p className="print-hide mt-3 text-xs leading-relaxed text-fg-subtle">녹음본은 브라우저에 저장되지 않으므로 여기에 담기지 않습니다. 인쇄 화면에서는 위 버튼과 링크가 빠집니다.</p>
    </Card>

    <div className="mt-8 space-y-8">
      {report.sections.map((section) => (
        <section key={section.id} className="print-block">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
            <h2 className="text-base font-semibold text-fg">{section.label}</h2>
            <span className="text-xs tabular-nums text-fg-muted">{formatHistoryStamp(section)} · {section.items.length}문항</span>
          </div>
          {section.emptyReason
            ? <p className="mt-3 text-sm text-fg-muted">{emptyReasonText[section.emptyReason]}</p>
            : <div className="mt-4 space-y-4">{section.items.map((entry) => <ReportItemCard key={`${section.id}-${entry.item.slot}`} entry={entry} />)}</div>}
        </section>
      ))}
      {report.sections.length === 0 && ids.length > 0 && (
        <Card className="px-5 py-6"><p className="text-sm text-fg-muted">담을 기록을 찾지 못했습니다.</p></Card>
      )}
    </div>
  </main>;
}

function ReportItemCard({ entry }: { entry: ReportItem }) {
  const { item, answer, browserAnswer, feedback } = entry;
  const frontLoaded = requiresFrontLoadedOpening(item.question.type);
  return <Card className="print-block px-5 py-5">
    <div className="flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
      <span className="rounded-md bg-surface-3 px-2 py-0.5 font-semibold text-fg-muted">{item.slot}번</span>
      <span>{item.typeLabel}</span>
      <span>{item.emoji} {item.topicKo}</span>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-fg">{item.question.en}</p>
    <p className="mt-1 text-xs leading-relaxed text-fg-subtle">{item.question.ko}</p>

    <div className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3">
      <p className="text-[11px] tracking-widest text-fg-subtle">내 답변 · {countEnglishWords(answer)}단어 · {formatTime(entry.elapsedSec)} · 다시 듣기 {entry.replays}회 · 힌트 {entry.hints}회</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{answer || "답변 텍스트가 없습니다."}</p>
      {browserAnswer !== undefined && <>
        <p className="mt-3 border-t border-line pt-3 text-[11px] tracking-widest text-fg-subtle">브라우저 받아쓰기 · {countEnglishWords(browserAnswer)}단어</p>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-fg-subtle">{browserAnswer}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">위 답변은 AI 분석에 보낸 녹음본을 OpenAI 가 다시 받아쓴 텍스트입니다.</p>
      </>}
    </div>

    {feedback ? <div className="mt-4 border-t border-line pt-4">
      <p className="text-xs font-semibold text-fg-muted">AI 스토리텔링 코치</p>
      <ul className="mt-2 flex flex-wrap gap-2 text-[11px] text-fg-muted">
        <li>{feedback.structure.topic === "good" ? "✓" : "△"} {frontLoaded ? "두괄식 도입" : "요청·문제 전달"}</li>
        <li>{feedback.structure.detail === "good" ? "✓" : "△"} 활동·디테일</li>
        <li>{feedback.structure.feeling === "good" ? "✓" : "△"} 감정·의미</li>
      </ul>
      <p className="mt-3 text-sm font-medium leading-relaxed text-fg">{feedback.overall}</p>
      <p className="mt-1 text-xs leading-relaxed text-fg-muted">{feedback.structure.note}</p>
      {feedback.items.length > 0 && <ol className="mt-3 space-y-2">
        {feedback.items.slice(0, 5).map((detail, index) => (
          <li key={`${detail.category}-${index}`} className="rounded-lg bg-surface-2 px-3.5 py-3">
            <p className="text-xs font-semibold text-fg">[{feedbackCategoryLabel[detail.category]}] {detail.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">{detail.message}</p>
            {detail.example && <p className="mt-2 rounded-md border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-fg">{detail.example}</p>}
          </li>
        ))}
      </ol>}
    </div> : <p className="mt-4 text-xs text-fg-subtle">이 문항에는 AI 피드백이 없습니다.</p>}
  </Card>;
}

function ScopeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums transition ${active ? "bg-primary text-primary-fg" : "text-fg-muted hover:text-fg"}`}>{children}</button>;
}
