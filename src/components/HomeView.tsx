"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { surveyTopics } from "@/data";
import { EXAM_GROUPS } from "@/lib/exam";
import { clearHistory, defaultSettings, loadHistory, loadSettings, saveSettings, type HistoryEntry, type Settings } from "@/lib/storage";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";
import { Badge, Card } from "./ui";

export default function HomeView() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { setSettings(loadSettings()); setHistory(loadHistory()); setReady(true); }, []);
  const selectedCount = surveyTopics.filter((t) => settings.enabledSurveyIds.includes(t.id)).length;
  const verifiedQuestionCount = surveyTopics.reduce((sum, topic) => sum + topic.questions.filter((q) => q.source === "verified").length, 0);

  function toggleTopic(id: string) {
    const selected = settings.enabledSurveyIds.includes(id);
    if (selected && selectedCount <= 3) return;
    const next = { ...settings, enabledSurveyIds: selected ? settings.enabledSurveyIds.filter((t) => t !== id) : [...settings.enabledSurveyIds, id] };
    setSettings(next);
    saveSettings(next);
  }

  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 sm:px-8">
    <header className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="accent">기출 복원 우선</Badge>
        <ThemeToggle />
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">실제로 나온 질문부터<br /><span className="text-primary-ink">반복해서 연습하기</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
        배경 설문 주제 11개에서 기출 복원으로 확인된 {verifiedQuestionCount}문항을 중심으로 연습합니다. 같은 유형에 복원 문항이 있으면 새로 만든 문항은 출제하지 않습니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-fg-muted">실전 모의고사만 예외입니다. 필요한 유형에 복원 문항이 없을 때는 출제 유형 기반 문항으로 채워 15문항 구성을 유지합니다.</p>
    </header>

    <section className="mt-9 grid gap-4 sm:grid-cols-3">
      <ModeCard href="/exam?mode=full" title="실전 모의고사" desc="자기소개부터 15번까지 실제 시험 순서 그대로 이어서 풀어 봅니다." primary />
      <ModeCard href="/topics" title="주제별 연습" desc="주제를 하나 골라 그 주제의 복원 문항만 유형별로 반복합니다." />
      <ModeCard href="/exam?mode=single" title="1문제 연습" desc="복원 문항 중 하나를 무작위로 뽑아 짧게 연습합니다." />
    </section>

    <section className="mt-10">
      <h2 className="text-sm font-semibold text-fg-muted">문제 유형 살펴보기</h2>
      <p className="mt-2 text-xs text-fg-subtle">실제 시험에서 자주 나오는 순서를 기준으로 정리한 번호입니다. 시험마다 번호와 유형이 그대로 맞아떨어지지는 않습니다.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_GROUPS.map((group) => <Card key={group.label} className="p-4">
          <p className="text-sm font-medium">{group.slots.join("·")}번 · {group.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">{group.note}</p>
        </Card>)}
      </div>
      <Card className="mt-3 p-4"><p className="text-xs leading-relaxed text-fg-muted"><strong className="text-fg">11~13번 롤플레이</strong>는 한 주제에서 질문하기 → 문제 해결 → 관련 경험으로 이어지는 세트로 출제됩니다.</p></Card>
    </section>

    <section className="mt-10">
      <h2 className="text-sm font-semibold text-fg-muted">배경 설문 주제</h2>
      <p className="mt-2 text-xs text-fg-muted">모의고사에 쓸 주제를 고르세요. 3개 이상 선택해야 하며, 처음에는 11개가 모두 켜져 있습니다.</p>
      <div className="mt-4 flex flex-wrap gap-2">{surveyTopics.map((topic) => {
        const on = ready && settings.enabledSurveyIds.includes(topic.id);
        return <button key={topic.id} type="button" aria-pressed={on} onClick={() => toggleTopic(topic.id)} className={`rounded-xl border px-4 py-2 text-sm ${on ? "border-primary/50 bg-primary-tint text-primary-ink" : "border-line text-fg-muted"}`}>{topic.emoji} {topic.ko}</button>;
      })}</div>
    </section>

    {history.length > 0 && <section className="mt-10">
      <div className="flex justify-between"><h2 className="text-sm font-semibold text-fg-muted">최근 연습 기록</h2><button type="button" className="text-xs text-fg-muted" onClick={() => { clearHistory(); setHistory([]); }}>기록 지우기</button></div>
      <Card className="mt-3 divide-y divide-line">{history.slice(0, 6).map((entry) => <div key={entry.id} className="flex flex-wrap items-center gap-3 p-4 text-sm"><span className="text-xs text-fg-muted">{new Date(entry.finishedAt).toLocaleDateString("ko-KR")}</span><span className="min-w-0 flex-1 text-fg-muted">{entry.label}</span><span className="text-xs text-fg-muted">{entry.answered}/{entry.totalItems}문항 작성</span></div>)}</Card>
    </section>}
    <Footer />
  </main>;
}

function ModeCard({ href, title, desc, primary = false }: { href: string; title: string; desc: string; primary?: boolean }) {
  return <Link href={href} className={`block rounded-2xl border p-5 transition ${primary ? "border-primary/40 bg-primary-tint hover:bg-primary-tint-strong" : "border-line bg-surface hover:border-line-strong"}`}><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-fg-muted">{desc}</p><span className="mt-4 inline-block text-sm text-primary-ink">시작하기 →</span></Link>;
}
