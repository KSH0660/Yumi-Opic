"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { surveyTopics } from "@/data";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/storage";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";

const SURVEY_SECTIONS = [
  {
    title: "현재 귀하는 어디에 살고 계십니까?",
    note: "거주 형태",
    ids: ["home"],
  },
  {
    title: "귀하는 여가 활동으로 주로 무엇을 하십니까?",
    note: "복수 선택",
    ids: ["park", "beach", "concert", "shopping"],
  },
  {
    title: "귀하의 취미나 관심사는 무엇입니까?",
    note: "복수 선택",
    ids: ["music"],
  },
  {
    title: "귀하는 주로 어떤 운동을 하십니까?",
    note: "복수 선택",
    ids: ["jogging", "walking", "gym"],
  },
  {
    title: "귀하는 어떤 휴가를 주로 보내십니까?",
    note: "복수 선택",
    ids: ["staycation", "overseas"],
  },
] as const;

export default function HomeView() {
  const [enabledIds, setEnabledIds] = useState<string[]>(defaultSettings.enabledSurveyIds);

  useEffect(() => {
    setEnabledIds(loadSettings().enabledSurveyIds);
  }, []);

  const topicById = useMemo(() => new Map(surveyTopics.map((topic) => [topic.id, topic])), []);
  const selectedCount = surveyTopics.filter((topic) => enabledIds.includes(topic.id)).length;
  const canContinue = selectedCount >= 3;

  function saveSelection(next: string[]) {
    setEnabledIds(next);
    saveSettings({ ...loadSettings(), enabledSurveyIds: next });
  }

  function toggleTopic(id: string) {
    const selected = enabledIds.includes(id);
    if (selected && selectedCount <= 3) return;
    saveSelection(selected ? enabledIds.filter((value) => value !== id) : [...enabledIds, id]);
  }

  function selectAll() {
    saveSelection(surveyTopics.map((topic) => topic.id));
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
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#555]">질문을 읽고 연습할 항목을 직접 선택해 주세요. 선택한 항목을 기준으로 주제별 연습과 실전 모의고사 문제가 구성됩니다.</p>
            <p className="mt-1 text-xs text-[#777]">현재 앱에 문제은행이 준비된 11개 설문 항목을 제공합니다. 최소 3개 이상 선택하세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#444]">{selectedCount}개 선택</span>
            <button type="button" onClick={selectAll} className="border border-[#c8c8c8] bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#555] hover:bg-[#f0f0f0]">전체 선택</button>
          </div>
        </div>

        <div className="divide-y divide-[#e4e4e4]">
          {SURVEY_SECTIONS.map((section, sectionIndex) => <div key={section.title} className="py-6">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="text-base font-semibold sm:text-lg">{sectionIndex + 1}. {section.title}</h3>
              <span className="text-xs text-[#888]">({section.note})</span>
            </div>

            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.ids.map((id) => {
                const topic = topicById.get(id);
                if (!topic) return null;
                const checked = enabledIds.includes(id);
                const locked = checked && selectedCount <= 3;
                return <label key={id} className={`flex min-h-9 cursor-pointer items-center gap-3 text-sm ${locked ? "cursor-not-allowed" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(id)}
                    aria-describedby={locked ? "minimum-selection-note" : undefined}
                    className="h-4 w-4 accent-[#eb7438]"
                  />
                  <span className="select-none">{topic.ko}</span>
                </label>;
              })}
            </div>
          </div>)}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#dedede] pt-6">
          <div>
            {!canContinue && <p role="alert" className="text-sm font-medium text-[#b45309]">계속하려면 설문 항목을 3개 이상 선택하세요.</p>}
            {selectedCount === 3 && <p id="minimum-selection-note" className="text-xs text-[#777]">최소 3개가 선택되어 있어 더 이상 해제할 수 없습니다.</p>}
            {selectedCount > 3 && <p className="text-xs text-[#777]">선택 내용은 이 브라우저에 자동 저장됩니다.</p>}
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

function ModeButton({ href, title, desc, primary = false, disabled = false }: { href: string; title: string; desc: string; primary?: boolean; disabled?: boolean }) {
  const className = `flex min-h-36 flex-col rounded-2xl border p-6 shadow-card transition ${primary ? "border-primary/40 bg-primary-tint hover:bg-primary-tint-strong" : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"}`;

  if (disabled) return <div className={`${className} cursor-not-allowed opacity-45`} aria-disabled="true">
    <span className="text-xl font-semibold tracking-tight">{title}</span>
    <span className="mt-2 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-5 text-sm font-medium text-fg-muted">설문 3개 이상 선택 필요</span>
  </div>;

  return <Link href={href} className={className}>
    <span className="text-xl font-semibold tracking-tight">{title}</span>
    <span className="mt-2 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-5 text-sm font-medium text-primary-ink">시작하기 →</span>
  </Link>;
}
