"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { surveyQuestionCount, surveyTopics } from "@/data";
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

  function toggleTopic(id: string) {
    const selected = settings.enabledSurveyIds.includes(id);
    if (selected && selectedCount <= 3) return;
    const next = { ...settings, enabledSurveyIds: selected ? settings.enabledSurveyIds.filter((t) => t !== id) : [...settings.enabledSurveyIds, id] };
    setSettings(next);
    saveSettings(next);
  }

  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 sm:px-8">
    <header className="animate-fade-up">
      <Badge tone="accent">서베이 전용 리셋</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">복잡한 문제은행은 비우고,<br /><span className="text-accent-400">내 서베이만 반복</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-300">
        현재 버전은 11개 서베이 주제와 {surveyQuestionCount}개 연습 문항만 사용합니다. 공개된 OPIc 복원 질문과 반복적으로 확인되는 출제 문형을 바탕으로 문구를 정리했고, 확실한 복원이 부족한 고난도 문항은 형식 기반 연습문제로 분리했습니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">공식 OPIc 전체 문제은행을 재현한 것이 아닙니다. 지금은 서베이 발화력을 빠르게 만드는 데만 집중합니다.</p>
    </header>

    <section className="mt-9 grid gap-4 sm:grid-cols-3">
      <ModeCard href="/exam?mode=full" title="서베이 집중 드릴" desc="선택한 주제 중 3개로 Q2~10형을 만들고, Q14·15형을 추가합니다. 롤플레이는 제외합니다." primary />
      <ModeCard href="/topics" title="주제별 6유형" desc="한 토픽에서 묘사·루틴·최근/최초·기억 경험·비교·이슈를 한 번씩 연습합니다." />
      <ModeCard href="/exam?mode=single" title="랜덤 1문제" desc="현재 11개 서베이 문제은행에서 질문 하나만 빠르게 뽑습니다." />
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
      <Card className="mt-3 p-4"><p className="text-xs leading-relaxed text-ink-400"><strong className="text-ink-300">11~13번 롤플레이:</strong> 이번 리셋에서는 제거했습니다. 서베이 문제은행이 안정된 뒤 문의하기 → 문제 해결 → 과거 문제 경험 세트로 다시 붙이면 됩니다.</p></Card>
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
