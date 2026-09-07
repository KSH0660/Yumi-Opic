"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Exam } from "@/lib/types";
import { allTopics, topicById } from "@/data";
import { buildFullExam, buildPracticeExam, buildSetPractice, buildSingleQuestion } from "@/lib/exam";
import { loadSettings } from "@/lib/storage";
import { Badge, Card } from "./ui";
import ExamRunner from "./ExamRunner";

export default function ExamPageClient() {
  const params = useSearchParams();
  const mode = params.get("mode") ?? "full";
  const topicId = params.get("topic");
  const setId = params.get("set");
  const [exam, setExam] = useState<Exam | null>(null);
  const [started, setStarted] = useState(mode !== "full");
  const [includeIntro, setIncludeIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const build = useCallback((withIntro: boolean) => {
    setError(null);
    try {
      if (mode === "practice") {
        if (setId) { setExam(buildSetPractice(setId)); return; }
        const topic = topicId ? topicById.get(topicId) : undefined;
        if (!topic) throw new Error("이 주제는 현재 교재 SET 목록에 없습니다. SET 목록에서 다시 선택해 주세요.");
        setExam(buildPracticeExam(topic));
        return;
      }
      if (mode === "single") { setExam(buildSingleQuestion(allTopics)); return; }
      if (mode !== "full") throw new Error("지원하지 않는 연습 모드입니다.");
      setExam(buildFullExam({ enabledSurveyIds: loadSettings().enabledSurveyIds, includeIntro: withIntro }));
    } catch (cause) {
      setExam(null);
      setError(cause instanceof Error ? cause.message : "시험지를 구성하지 못했습니다.");
    }
  }, [mode, topicId, setId]);
  useEffect(() => { setStarted(mode !== "full"); build(true); }, [build, mode]);
  if (error) return <main className="mx-auto max-w-3xl px-5 pt-16"><p role="alert" className="text-sm text-amber-300">{error}</p><Link href="/" className="mt-4 inline-block text-sm text-accent-400">← 서베이 설정</Link><Link href="/topics" className="ml-6 text-sm text-accent-400">교재 SET 목록 →</Link></main>;
  if (!exam) return <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-ink-400">교재 SET으로 시험지를 구성하는 중…</main>;
  const title = mode === "practice" ? `교재 SET 연습 · ${exam.items[0]?.topicKo ?? ""}` : mode === "single" ? "교재 랜덤 1문제" : "교재 SET 모의고사";
  if (!started) return <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-12 sm:px-8">
    <Link href="/" className="text-sm text-ink-400">← 홈</Link>
    <Card className="mt-5 p-6 sm:p-8"><Badge tone="accent">교재 SET 모의고사</Badge><h1 className="mt-4 text-2xl font-semibold">{exam.items.length}문항이 준비됐습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">선택한 서베이 2주제·공통형 1주제의 SET, 롤플레이 1SET, 고난도 1SET으로 구성했습니다. 각 SET 안의 질문 순서와 연결 관계는 교재 그대로입니다. 일반 SET 세 묶음의 배치는 무작위입니다.</p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">이 비율은 앱의 연습용 구성입니다. 교재는 2020년 7월까지의 기출 분석 자료이며, 현재 공식 문제은행을 재현한 것은 아닙니다. 피드백은 전체 답변을 마친 뒤에만 표시됩니다.</p>
      {exam.notices?.map((notice) => <p key={notice} className="mt-3 text-xs leading-relaxed text-amber-300">{notice}</p>)}
      <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-ink-300"><input type="checkbox" checked={includeIntro} onChange={(e) => { setIncludeIntro(e.target.checked); build(e.target.checked); }} />1번 자기소개 포함하기</label>
      <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setStarted(true)} className="rounded-xl bg-accent-600 px-5 py-3 text-sm font-medium text-white">시험 시작</button><button type="button" onClick={() => build(includeIntro)} className="rounded-xl border border-ink-700 px-4 py-3 text-sm text-ink-300">SET 다시 뽑기</button></div>
    </Card>
  </main>;
  return <ExamRunner key={exam.id} exam={exam} title={title} onRegenerate={() => { build(includeIntro); setStarted(mode !== "full"); }} />;
}
