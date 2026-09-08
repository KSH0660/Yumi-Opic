"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { surveyTopics } from "@/data";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/storage";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";

export default function HomeView() {
  const [enabledIds, setEnabledIds] = useState<string[]>(defaultSettings.enabledSurveyIds);

  useEffect(() => {
    setEnabledIds(loadSettings().enabledSurveyIds);
  }, []);

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

  return <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 pb-10 pt-6 sm:px-8">
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-sm font-semibold tracking-tight text-fg-muted">Yumi OPIc</h1>
      <ThemeToggle />
    </div>

    <section className="animate-fade-up pt-10 sm:pt-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-ink">Background Survey</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">배경 설문을 선택하세요</h2>
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">실제 시험에서 선택할 주제를 골라 주세요. 여기서 고른 설문은 주제별 연습과 실전 모의고사에 그대로 사용됩니다. 최소 3개 이상 선택해야 합니다.</p>
      </div>

      <div className="mt-7 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">배경 설문 주제</h3>
            <p className="mt-1 text-xs text-fg-muted">현재 {selectedCount}개 선택</p>
          </div>
          <button type="button" onClick={selectAll} className="rounded-xl border border-line px-3.5 py-2 text-xs font-medium text-fg-muted transition hover:border-line-strong hover:text-fg">전체 선택</button>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{surveyTopics.map((topic) => {
          const on = enabledIds.includes(topic.id);
          const locked = on && selectedCount <= 3;
          return <button
            key={topic.id}
            type="button"
            aria-pressed={on}
            aria-disabled={locked}
            onClick={() => toggleTopic(topic.id)}
            className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${on ? "border-primary/50 bg-primary-tint text-primary-ink" : "border-line bg-surface text-fg-muted hover:border-line-strong hover:bg-surface-2"}`}
          >
            <span className="text-xl" aria-hidden="true">{topic.emoji}</span>
            <span className="font-medium">{topic.ko}</span>
            <span className="ml-auto text-xs" aria-hidden="true">{on ? "✓" : ""}</span>
          </button>;
        })}</div>

        {!canContinue && <p role="alert" className="mt-4 text-xs text-warn-ink">계속하려면 설문 주제를 3개 이상 선택하세요.</p>}
        {selectedCount === 3 && <p className="mt-4 text-xs text-fg-subtle">최소 3개가 선택되어 있어 더 이상 해제할 수 없습니다.</p>}
      </div>
    </section>

    <section className="mt-10 border-t border-line pt-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">연습 방식 선택</h2>
        <p className="mt-2 text-sm text-fg-muted">설문 선택은 자동으로 저장됩니다.</p>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <ModeButton href="/topics" title="주제별 연습" desc="선택한 설문 주제 가운데 한 주제를 골라 1~15번을 연습합니다." disabled={!canContinue} />
        <ModeButton href="/exam?mode=full" title="실전 모의고사" desc="선택한 설문을 바탕으로 자기소개부터 15번까지 실제 시험 순서대로 풀어 봅니다." primary disabled={!canContinue} />
      </div>
    </section>

    <Footer />
  </main>;
}

function ModeButton({ href, title, desc, primary = false, disabled = false }: { href: string; title: string; desc: string; primary?: boolean; disabled?: boolean }) {
  const className = `flex min-h-48 flex-col rounded-3xl border p-7 shadow-card transition sm:min-h-56 sm:p-8 ${primary ? "border-primary/40 bg-primary-tint hover:bg-primary-tint-strong" : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"}`;

  if (disabled) return <div className={`${className} cursor-not-allowed opacity-45`} aria-disabled="true">
    <span className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</span>
    <span className="mt-3 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-8 text-sm font-medium text-fg-muted">설문 3개 이상 선택 필요</span>
  </div>;

  return <Link href={href} className={className}>
    <span className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</span>
    <span className="mt-3 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-8 text-sm font-medium text-primary-ink">시작하기 →</span>
  </Link>;
}
