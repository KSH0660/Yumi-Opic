"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MIN_PRACTICE_TOPICS,
  OFFICIAL_MIN_CHOICES,
  choiceIdsForTopics,
  surveyFormQuestions,
  surveyTopics,
  topicIdsForChoices,
  type SurveyFormQuestion,
} from "@/data";
import { defaultSettings, loadSettings, saveSurveyChoices } from "@/lib/storage";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";

/** 여가·취미·운동·휴가 네 문항만 실제 시험의 합산 12개 기준에 들어간다. */
const COUNTED_CHOICE_IDS = new Set(
  surveyFormQuestions.filter((question) => question.kind === "multi").flatMap((question) => question.choices.map((choice) => choice.id)),
);
/** 문제은행이 있는 항목이 하나라도 있는 문항. 이 문항에서만 준비 상태를 표시한다. */
function hasPracticeChoice(question: SurveyFormQuestion): boolean {
  return question.choices.some((choice) => choice.topicId);
}

export default function HomeView() {
  const [choiceIds, setChoiceIds] = useState<string[]>(defaultSettings.surveyChoiceIds);

  useEffect(() => {
    setChoiceIds(loadSettings().surveyChoiceIds);
  }, []);

  const chosen = useMemo(() => new Set(choiceIds), [choiceIds]);
  const practiceCount = topicIdsForChoices(choiceIds).length;
  const countedCount = choiceIds.filter((id) => COUNTED_CHOICE_IDS.has(id)).length;
  const pendingCount = surveyFormQuestions
    .filter(hasPracticeChoice)
    .flatMap((question) => question.choices)
    .filter((choice) => !choice.topicId && chosen.has(choice.id)).length;
  const canContinue = practiceCount >= MIN_PRACTICE_TOPICS;

  function apply(next: string[]) {
    setChoiceIds(saveSurveyChoices(next).surveyChoiceIds);
  }

  function choose(question: SurveyFormQuestion, choiceId: string) {
    if (question.kind === "single") {
      const others = new Set(question.choices.map((choice) => choice.id));
      apply([...choiceIds.filter((id) => !others.has(id)), choiceId]);
      return;
    }
    apply(chosen.has(choiceId) ? choiceIds.filter((id) => id !== choiceId) : [...choiceIds, choiceId]);
  }

  function selectPracticeReady() {
    apply([...choiceIds, ...choiceIdsForTopics(surveyTopics.map((topic) => topic.id))]);
  }

  return <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-10 pt-5 sm:px-8">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-sm font-semibold tracking-tight text-fg-muted">Yumi OPIc</h1>
      <ThemeToggle />
    </div>

    <section className="overflow-hidden rounded-2xl border border-line bg-white text-[#222] shadow-card">
      <div className="grid grid-cols-4 border-b border-[#d9d9d9] text-[11px] sm:text-sm">
        <div className="bg-[#eb7438] px-3 py-3 font-semibold text-white sm:px-5">
          <div>Step 1</div>
          <div className="mt-0.5 text-[9px] font-normal sm:text-xs">Background Survey</div>
        </div>
        <div className="bg-[#f5f5f5] px-3 py-3 text-[#666] sm:px-5">
          <div className="font-semibold">Step 2</div>
          <div className="mt-0.5 text-[9px] sm:text-xs">Self Assessment</div>
        </div>
        <div className="bg-[#f5f5f5] px-3 py-3 text-[#666] sm:px-5">
          <div className="font-semibold">Step 3</div>
          <div className="mt-0.5 text-[9px] sm:text-xs">Setup</div>
        </div>
        <div className="bg-[#f5f5f5] px-3 py-3 text-[#666] sm:px-5">
          <div className="font-semibold">Step 4</div>
          <div className="mt-0.5 text-[9px] sm:text-xs">Sample Question</div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dedede] pb-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Background Survey</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#555]">실제 오픽 시험의 사전 설문과 같은 8개 문항입니다. 여기서 고른 항목이 주제별 연습과 실전 모의고사의 출제 범위가 됩니다.</p>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#777]"><PracticeBadge /> 표시가 붙은 항목만 문제은행이 준비돼 있습니다. 나머지도 실제 시험처럼 고를 수 있지만 아직 문제가 준비 중이라 연습에는 나오지 않습니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#444]">연습 가능 {practiceCount}개</span>
            <button type="button" onClick={selectPracticeReady} className="border border-[#c8c8c8] bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#555] hover:bg-[#f0f0f0]">연습 가능한 항목 모두 선택</button>
          </div>
        </div>

        <div className="divide-y divide-[#e4e4e4]">
          {surveyFormQuestions.map((question, index) => {
            const startsSection = surveyFormQuestions[index - 1]?.section !== question.section;
            const showsPractice = hasPracticeChoice(question);
            return <div key={question.id} className="py-6">
              {startsSection && <div className="mb-4">
                <p className="text-sm font-semibold text-[#eb7438]">&lt;{question.section}&gt;</p>
                {question.sectionNote && <p className="mt-1 text-xs text-[#777]">({question.sectionNote})</p>}
                {question.section === "직업 관련" && <p className="mt-1 text-xs text-[#777]">이 앱은 업무·학업 주제를 다루지 않아 아래 세 문항은 연습 문제로 이어지지 않습니다.</p>}
              </div>}

              <fieldset>
                <legend className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-base font-semibold sm:text-lg">{question.number}. {question.title}</span>
                  <span className="text-xs text-[#888]">({question.guide})</span>
                </legend>

                <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {question.choices.map((choice) => {
                    const checked = chosen.has(choice.id);
                    return <label key={choice.id} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
                      <input
                        type={question.kind === "single" ? "radio" : "checkbox"}
                        name={question.id}
                        checked={checked}
                        onChange={() => choose(question, choice.id)}
                        className="h-4 w-4 shrink-0 accent-[#eb7438]"
                      />
                      <span className="select-none">{choice.ko}</span>
                      {choice.topicId && <PracticeBadge />}
                      {showsPractice && !choice.topicId && checked && <span className="shrink-0 text-[10px] text-[#999]">문제 준비 중</span>}
                    </label>;
                  })}
                </div>
              </fieldset>
            </div>;
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#dedede] pt-6">
          <div className="space-y-1">
            {!canContinue && <p role="alert" className="text-sm font-medium text-[#b45309]">연습 문제가 준비된 항목을 {MIN_PRACTICE_TOPICS}개 이상 선택하세요.</p>}
            {countedCount < OFFICIAL_MIN_CHOICES && <p className="text-xs text-[#777]">실제 시험은 5~8번을 합산해 {OFFICIAL_MIN_CHOICES}개 이상 골라야 합니다. 지금은 {countedCount}개입니다.</p>}
            {pendingCount > 0 && <p className="text-xs text-[#777]">고른 항목 가운데 {pendingCount}개는 아직 문제 준비 중이라 연습에는 나오지 않습니다.</p>}
            <p className="text-xs text-[#777]">선택 내용은 이 브라우저에 자동 저장됩니다.</p>
          </div>
          <Link
            href={canContinue ? "/exam?mode=full" : "#"}
            aria-disabled={!canContinue}
            onClick={(event) => { if (!canContinue) event.preventDefault(); }}
            className={`inline-flex min-w-28 items-center justify-center bg-[#eb7438] px-6 py-3 text-sm font-semibold text-white transition ${canContinue ? "hover:bg-[#d9672f]" : "cursor-not-allowed opacity-40"}`}
          >
            Next ▶
          </Link>
        </div>
      </div>
    </section>

    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      <ModeButton href="/topics" title="주제별 연습" desc="선택한 설문 가운데 한 주제를 골라 집중 연습합니다." disabled={!canContinue} />
      <ModeButton href="/exam?mode=full" title="실전 모의고사" desc="선택한 설문을 바탕으로 1~15번 모의고사를 시작합니다." primary disabled={!canContinue} />
    </section>

    <Footer />
  </main>;
}

function PracticeBadge() {
  return <span className="shrink-0 rounded-sm bg-[#fdece2] px-1.5 py-0.5 text-[10px] font-semibold text-[#c2551f]">연습 가능</span>;
}

function ModeButton({ href, title, desc, primary = false, disabled = false }: { href: string; title: string; desc: string; primary?: boolean; disabled?: boolean }) {
  const className = `flex min-h-36 flex-col rounded-2xl border p-6 shadow-card transition ${primary ? "border-primary/40 bg-primary-tint hover:bg-primary-tint-strong" : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"}`;

  if (disabled) return <div className={`${className} cursor-not-allowed opacity-45`} aria-disabled="true">
    <span className="text-xl font-semibold tracking-tight">{title}</span>
    <span className="mt-2 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-5 text-sm font-medium text-fg-muted">연습 가능한 설문 {MIN_PRACTICE_TOPICS}개 이상 선택 필요</span>
  </div>;

  return <Link href={href} className={className}>
    <span className="text-xl font-semibold tracking-tight">{title}</span>
    <span className="mt-2 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-5 text-sm font-medium text-primary-ink">시작하기 →</span>
  </Link>;
}
