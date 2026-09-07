"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Exam } from "@/lib/types";
import { allTopics, topicById } from "@/data";
import {
  buildFullExam,
  buildPracticeExam,
  buildSingleQuestion,
} from "@/lib/exam";
import { loadSettings } from "@/lib/storage";
import { Badge, Card } from "./ui";
import ExamRunner from "./ExamRunner";

type Mode = "full" | "practice" | "single";

export default function ExamPageClient() {
  const params = useSearchParams();
  const mode = (params.get("mode") ?? "full") as Mode;
  const topicId = params.get("topic");
  const practiceCount = Number(params.get("count") ?? 5);

  const [exam, setExam] = useState<Exam | null>(null);
  const [started, setStarted] = useState(mode !== "full");
  const [includeIntro, setIncludeIntro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const build = useCallback(
    (withIntro: boolean) => {
      setError(null);
      if (mode === "practice") {
        const topic = topicId ? topicById.get(topicId) : undefined;
        if (!topic) {
          setError("주제를 찾을 수 없습니다.");
          return;
        }
        setExam(buildPracticeExam(topic, Number.isFinite(practiceCount) ? practiceCount : 5));
        return;
      }
      if (mode === "single") {
        setExam(buildSingleQuestion(allTopics));
        return;
      }
      const settings = loadSettings();
      setExam(
        buildFullExam({
          enabledSurveyIds: settings.enabledSurveyIds,
          includeIntro: withIntro,
        }),
      );
    },
    [mode, topicId, practiceCount],
  );

  // 랜덤 추첨은 클라이언트에서만 돌려 서버·클라이언트 렌더 불일치를 피한다
  useEffect(() => {
    build(includeIntro);
    // includeIntro 는 시작 버튼에서 직접 넘긴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-5 pt-16">
        <p className="text-sm text-rose-300">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent-400">
          ← 홈으로
        </Link>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-ink-400">
        시험지를 준비하는 중…
      </main>
    );
  }

  const title =
    mode === "practice"
      ? `주제별 연습 · ${exam.items[0]?.topicKo ?? ""}`
      : mode === "single"
        ? "랜덤 1문제"
        : "실전 모의고사";

  if (!started) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-12 sm:px-8">
        <Link href="/" className="text-sm text-ink-400 transition hover:text-ink-100">
          ← 홈
        </Link>
        <Card className="animate-fade-up mt-5 p-6 sm:p-8">
          <Badge tone="accent">실전 모의고사</Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            시험지 {exam.items.length}문항이 준비됐습니다
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">
            콤보 구조에 맞춰 서베이 2개 · 돌발 1개 · 롤플레이 1세트 ·
            고난도 1세트를 뽑았습니다. 어떤 주제가 나왔는지는 시작해야 보입니다.
            실전처럼 답변을 미리 준비하지 말고 바로 말해 보세요.
          </p>

          <div className="mt-6 space-y-3 border-t border-ink-800 pt-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={includeIntro}
                onChange={(e) => {
                  setIncludeIntro(e.target.checked);
                  build(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[var(--color-accent-500)]"
              />
              <span>
                <span className="text-ink-200">1번 자기소개 포함하기</span>
                <span className="mt-0.5 block text-xs text-ink-500">
                  실전에서는 채점 비중이 거의 없어 기본은 꺼져 있습니다.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500"
            >
              시험 시작
            </button>
            <button
              type="button"
              onClick={() => build(includeIntro)}
              className="rounded-xl border border-ink-700 px-4 py-2.5 text-sm text-ink-300 transition hover:border-ink-600 hover:text-ink-100"
            >
              시험지 다시 뽑기
            </button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <ExamRunner
      key={exam.id}
      exam={exam}
      title={title}
      onRegenerate={() => {
        build(includeIntro);
        setStarted(mode !== "full");
      }}
    />
  );
}
