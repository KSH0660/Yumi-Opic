"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Exam } from "@/lib/types";
import { allTopics, topicById } from "@/data";
import { buildFullExam, buildPracticeExam, buildSingleQuestion } from "@/lib/exam";
import { loadHistory, loadSettings, type HistoryEntry } from "@/lib/storage";
import { Badge, Card } from "./ui";
import ExamRunner from "./ExamRunner";
import ExamResult from "./ExamResult";

export default function ExamPageClient() {
  const params = useSearchParams();
  const historyId = params.get("history");
  return historyId !== null ? <SavedHistoryResult key={historyId} id={historyId} /> : <NewExamPageClient />;
}

function SavedHistoryResult({ id }: { id: string }) {
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setEntry(loadHistory().find((item) => item.id === id) ?? null);
    setReady(true);
  }, [id]);

  if (!ready) return <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-fg-muted">연습 기록을 불러오는 중…</main>;
  if (entry?.result) return <ExamResult
    exam={entry.result.exam} title={entry.label} answers={entry.result.answers}
    times={entry.result.times} hintUse={entry.result.hintUse} replays={entry.result.replays}
    historyEntry={entry}
  />;

  return <main className="mx-auto max-w-3xl px-5 pb-24 pt-8">
    <Link href="/" className="text-sm text-fg-muted">← 홈</Link>
    <Card className="mt-5 p-6">
      <h1 className="text-xl font-semibold">{entry ? "지난 연습 기록" : "기록을 찾을 수 없습니다"}</h1>
      {entry ? <>
        <p className="mt-3 text-sm text-fg-muted">{entry.label} · {new Date(entry.finishedAt).toLocaleString("ko-KR")}</p>
        <p className="mt-2 text-sm text-fg-muted">{entry.answered}/{entry.totalItems}문항 답변</p>
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">이전 버전에서 저장한 기록에는 질문·답변·피드백이 남아 있지 않습니다. 새로 완료하는 연습부터 상세 결과가 저장됩니다.</p>
      </> : <p className="mt-3 text-sm text-fg-muted">삭제된 기록이거나 다른 브라우저에서 저장한 기록입니다.</p>}
    </Card>
  </main>;
}

function NewExamPageClient() {
  const params = useSearchParams();
  const mode = params.get("mode") ?? "full";
  const topicId = params.get("topic");
  const [exam, setExam] = useState<Exam | null>(null);
  const [started, setStarted] = useState(mode !== "full");
  const [includeIntro, setIncludeIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const build = useCallback((withIntro: boolean) => {
    setError(null);
    try {
      if (mode === "practice") {
        const topic = topicId ? topicById.get(topicId) : undefined;
        if (!topic) throw new Error("연습할 주제를 찾지 못했습니다. 주제 목록에서 다시 골라 주세요.");
        setExam(buildPracticeExam(topic));
        return;
      }
      if (mode === "single") { setExam(buildSingleQuestion(allTopics)); return; }
      if (mode !== "full") throw new Error("지원하지 않는 연습 방식입니다.");
      setExam(buildFullExam({ enabledSurveyIds: loadSettings().enabledSurveyIds, includeIntro: withIntro }));
    } catch (cause) {
      setExam(null);
      setError(cause instanceof Error ? cause.message : "문제를 만들지 못했습니다.");
    }
  }, [mode, topicId]);

  useEffect(() => { setStarted(mode !== "full"); build(true); }, [build, mode]);

  if (error) return <main className="mx-auto max-w-3xl px-5 pt-16"><p role="alert" className="text-sm text-warn-ink">{error}</p><Link href="/" className="mt-4 inline-block text-sm text-primary-ink">← 주제 설정</Link><Link href="/topics" className="ml-6 text-sm text-primary-ink">주제별 연습 →</Link></main>;
  if (!exam) return <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-fg-muted">문제를 준비하는 중…</main>;

  const title = mode === "practice" ? `주제별 연습 · ${topicById.get(exam.focusTopicId ?? "")?.ko ?? ""}` : mode === "single" ? "1문제 연습" : "실전 모의고사";

  if (!started) return <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-12 sm:px-8">
    <Link href="/" className="text-sm text-fg-muted">← 홈</Link>
    <Card className="mt-5 p-6 sm:p-8">
      <Badge tone="accent">실전 모의고사</Badge>
      <h1 className="mt-4 text-2xl font-semibold">{exam.items.length}문항이 준비됐습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">선택한 주제 중 3개로 2~10번 세트를 만들고, 11~13번 롤플레이 세트와 14~15번 비교·이슈 문항을 더했습니다.</p>
      <p className="mt-3 text-xs leading-relaxed text-fg-muted">돌발 주제는 아직 다루지 않아 모든 문항이 배경 설문 주제에서 나옵니다. 번호와 유형은 실제 시험에서 늘 똑같이 맞아떨어지지는 않습니다.</p>
      <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-xs leading-relaxed text-fg-muted">
        <li>· 실제 응시 화면과 같습니다. 문항마다 <strong className="text-fg">▶ 를 눌러야</strong> 질문이 나옵니다.</li>
        <li>· 질문이 끝난 뒤 <strong className="text-fg">5초 안에</strong> 같은 버튼을 누르면 한 번 더 들을 수 있고, 재청취는 문항당 한 번뿐입니다.</li>
        <li>· 지문은 화면에 없습니다. 막히면 아래 <strong className="text-fg">힌트 버튼을 꾹 누르고 있는 동안에만</strong> 볼 수 있습니다.</li>
        <li>· 답변은 마이크로 합니다. 말하는 대로 실시간으로 적히고, 필요하면 직접 고쳐 쓸 수 있습니다.</li>
      </ul>
      {exam.notices?.map((notice) => <p key={notice} className="mt-3 text-xs leading-relaxed text-warn-ink">{notice}</p>)}
      <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-fg-muted"><input type="checkbox" checked={includeIntro} onChange={(e) => { setIncludeIntro(e.target.checked); build(e.target.checked); }} />1번 자기소개 문항 포함하기</label>
      <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setStarted(true)} className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover">시작하기</button><button type="button" onClick={() => build(includeIntro)} className="rounded-xl border border-line px-4 py-3 text-sm text-fg-muted">문제 다시 뽑기</button></div>
    </Card>
  </main>;

  return <ExamRunner key={exam.id} exam={exam} title={title} onRegenerate={() => { build(includeIntro); setStarted(mode !== "full"); }} />;
}
