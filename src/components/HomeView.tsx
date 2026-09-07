"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { surveyTopics, textbookStats, TEXTBOOK, UNSUPPORTED_SURVEY_TOPICS } from "@/data";
import { EXAM_GROUPS } from "@/lib/exam";
import { clearHistory, defaultSettings, loadHistory, loadSettings, saveSettings, type HistoryEntry, type Settings } from "@/lib/storage";
import Footer from "./Footer";
import { Badge, Card } from "./ui";

export default function HomeView() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { setSettings(loadSettings()); setHistory(loadHistory()); setReady(true); }, []);
  const selectedCount = surveyTopics.filter((t) => settings.enabledSurveyIds.includes(t.id)).length;
  const unsupported = settings.enabledSurveyIds.filter((id) => !surveyTopics.some((t) => t.id === id));
  const totalSets = textbookStats.generalSets + textbookStats.roleplaySets + textbookStats.advancedSets;
  function toggleTopic(id: string) {
    const selected = settings.enabledSurveyIds.includes(id);
    if (selected && selectedCount <= 2) return;
    const next = { ...settings, enabledSurveyIds: selected ? settings.enabledSurveyIds.filter((t) => t !== id) : [...settings.enabledSurveyIds, id] };
    setSettings(next); saveSettings(next);
  }
  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 sm:px-8">
    <header className="animate-fade-up">
      <Badge tone="accent">교재 원문 · SET 단위 모의고사</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">질문은 그대로,<br /><span className="text-accent-400">SET 조합만 새롭게</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-300">
        {TEXTBOOK.title}의 영어 질문 {textbookStats.questions}개 기록과 완전한 SET {totalSets}개를 사용합니다.
        문항을 따로 섞지 않고 교재에 실린 순서와 연결 관계를 유지합니다. 기존 자체 제작·재구성 문항은 모의고사에서 제외했습니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">교재 기출 분석 범위: 2020년 7월까지. 공식 문제은행 또는 2026년 최신 기출로 검증한 자료가 아닙니다.</p>
    </header>
    <section className="mt-9 grid gap-4 sm:grid-cols-3">
      <ModeCard href="/exam?mode=full" title="전체 모의고사" desc="일반 3SET + 롤플레이 1SET + 고난도 1SET. 자기소개 포함 15문항입니다." primary />
      <ModeCard href="/topics" title="교재 SET별 연습" desc="원하는 SET을 골라 2~3문항을 원래 순서대로 연습합니다." />
      <ModeCard href="/exam?mode=single" title="교재 랜덤 1문제" desc="앞 질문 없이도 답할 수 있는 독립 문항만 뽑습니다." />
    </section>
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-ink-300">시험지 구성</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_GROUPS.map((group, i) => <Card key={group.label} className="p-4">
          <p className="text-sm font-medium">{group.slots.join(" · ")}번 — {group.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">{i < 3 ? "선택한 서베이 2주제와 공통형 1주제의 SET을 섞어 배치합니다. 묘사·루틴·경험·비교 순서는 SET마다 다릅니다." : i === 3 ? "같은 상황의 11→12→13번을 통째로 유지합니다. 마지막 질문도 교재의 요구를 그대로 따릅니다." : "교재의 14→15번 쌍을 유지합니다. 비교→이슈만 있는 것이 아니라 다른 조합도 나옵니다."}</p>
        </Card>)}
        <Card className="p-4"><p className="text-sm font-medium">1번 — 자기소개</p><p className="mt-2 text-xs leading-relaxed text-ink-400">기본 포함입니다. 시작 화면에서 제외할 수 있습니다. 전체 주제 비율은 앱의 연습용 구성이지 공식 출제 확률이 아닙니다.</p></Card>
      </div>
    </section>
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-ink-300">내 서베이 · 교재 일반 SET 수록 주제</h2>
      <p className="mt-2 text-xs text-ink-400">최소 2개 선택. 기본은 집·음악·쇼핑·집 휴가·해외여행이며, 영화·TV·국내여행은 추가 선택 항목입니다.</p>
      <div className="mt-4 flex flex-wrap gap-2">{surveyTopics.map((topic) => {
        const on = ready && settings.enabledSurveyIds.includes(topic.id);
        return <button key={topic.id} type="button" aria-pressed={on} onClick={() => toggleTopic(topic.id)} className={`rounded-xl border px-4 py-2 text-sm ${on ? "border-accent-600/50 bg-accent-600/15 text-ink-100" : "border-ink-700 text-ink-400"}`}>{topic.emoji} {topic.ko}</button>;
      })}</div>
      {ready && selectedCount < 2 && <p role="alert" className="mt-3 text-sm text-amber-300">모의고사를 시작하려면 수록 주제를 2개 이상 선택해 주세요.</p>}
      <Card className="mt-4 p-4"><p className="text-xs leading-relaxed text-ink-400">{UNSUPPORTED_SURVEY_TOPICS.map((t) => t.ko).join(" · ")}은 이 교재에 독립적인 일반문제 Unit/SET이 없습니다. 해당 주제로 임의 변형한 문제를 교재 원문처럼 출제하지 않습니다. 관련 음악·건강·지형 문항과 공연·헬스장 롤플레이는 수록되어 있습니다.</p>
        {unsupported.length > 0 && <p className="mt-2 text-xs text-amber-300">기존 선택 중 현재 출제되지 않는 ID: {unsupported.join(", ")}. 다른 서베이를 대신 추가하지 않았습니다.</p>}
      </Card>
    </section>
    {history.length > 0 && <section className="mt-10">
      <div className="flex justify-between"><h2 className="text-sm font-semibold text-ink-300">최근 기록</h2><button type="button" className="text-xs text-ink-400" onClick={() => { clearHistory(); setHistory([]); }}>기록 지우기</button></div>
      <Card className="mt-3 divide-y divide-ink-800">{history.slice(0, 6).map((entry) => <div key={entry.id} className="flex flex-wrap items-center gap-3 p-4 text-sm"><span className="text-xs text-ink-400">{new Date(entry.finishedAt).toLocaleDateString("ko-KR")}</span><span className="min-w-0 flex-1 text-ink-300">{entry.label}</span><span className="text-xs text-ink-400">{entry.answered}/{entry.totalItems}문항</span></div>)}</Card>
    </section>}
    <Footer />
  </main>;
}
function ModeCard({ href, title, desc, primary = false }: { href: string; title: string; desc: string; primary?: boolean }) {
  return <Link href={href} className={`block rounded-2xl border p-5 transition ${primary ? "border-accent-600/50 bg-accent-600/10 hover:bg-accent-600/20" : "border-ink-700 bg-ink-900/60 hover:border-ink-600"}`}><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-400">{desc}</p><span className="mt-4 inline-block text-sm text-accent-400">시작하기 →</span></Link>;
}
