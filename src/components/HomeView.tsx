"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { surveyTopics } from "@/data";
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
      <Badge tone="accent">공개 복원 우선</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">연습 문제는 줄이고,<br /><span className="text-accent-400">복원 질문부터 반복</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-300">
        현재 기본 학습 화면에서는 11개 서베이 주제의 공개 복원 기반 {verifiedQuestionCount}개 문항만 사용합니다. 같은 유형에 복원 문항이 있으면 출제형식 기반 보조 문항은 보여주거나 랜덤으로 뽑지 않습니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">서베이 집중 모의시험은 필요한 유형에 공개 복원 문항이 없는 경우에만 출제형식 기반 문항을 보조적으로 사용해 15문항 구성을 유지합니다.</p>
    </header>

    <section className="mt-9 grid gap-4 sm:grid-cols-3">
      <ModeCard href="/exam?mode=full" title="서베이 집중 드릴" desc="Q2~15를 연속 연습합니다. 공개 복원 문항을 우선하고, 빈 유형만 보조 문항으로 채웁니다." primary />
      <ModeCard href="/topics" title="공개 복원 주제연습" desc="한 토픽에서 실제 복원 근거가 확인된 유형만 반복합니다. 억지로 6유형을 채우지 않습니다." />
      <ModeCard href="/exam?mode=single" title="복원 랜덤 1문제" desc="공개 복원 기반 문제 중 하나만 빠르게 뽑습니다." />
    </section>

    <section className="mt-10">
      <h2 className="text-sm font-semibold text-ink-300">학습용 문제 유형</h2>
      <p className="mt-2 text-xs text-ink-500">번호는 네가 쓰는 훈련 분류입니다. 실제 시험의 문항 번호가 항상 이 유형으로 고정된다는 뜻은 아닙니다.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_GROUPS.map((group) => <Card key={group.label} className="p-4">
          <p className="text-sm font-medium">{group.slots.join(" · ")}번형 — {group.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">{group.note}</p>
        </Card>)}
      </div>
      <Card className="mt-3 p-4"><p className="text-xs leading-relaxed text-ink-400"><strong className="text-ink-300">11~13번 롤플레이:</strong> 가능한 경우 공개 복원된 문의하기 → 문제 해결 → 과거 문제·특이 경험 세트를 우선 사용합니다.</p></Card>
    </section>

    <section className="mt-10">
      <h2 className="text-sm font-semibold text-ink-300">내 서베이 11개</h2>
      <p className="mt-2 text-xs text-ink-400">집중 드릴을 위해 최소 3개를 유지합니다. 기본값은 11개 전체 선택입니다.</p>
      <div className="mt-4 flex flex-wrap gap-2">{surveyTopics.map((topic) => {
        const on = ready && settings.enabledSurveyIds.includes(topic.id);
        return <button key={topic.id} type="button" aria-pressed={on} onClick={() => toggleTopic(topic.id)} className={`rounded-xl border px-4 py-2 text-sm ${on ? "border-accent-600/50 bg-accent-600/15 text-ink-100" : "border-ink-700 text-ink-400"}`}>{topic.emoji} {topic.ko}</button>;
      })}</div>
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
