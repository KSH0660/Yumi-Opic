"use client";
import Link from "next/link";
import { useState } from "react";
import type { SetKind, Topic } from "@/lib/types";
import { advancedTopics, roleplayTopics, surpriseTopics, surveyTopics, excludedSets, TEXTBOOK } from "@/data";
import { TYPE_LABELS } from "@/lib/exam";
import Footer from "./Footer";
import { Badge, Card, SourceBadge } from "./ui";

const GROUPS: { key: string; label: string; kind: SetKind; topics: Topic[] }[] = [
  { key: "survey", label: "선택형 · 서베이 일반 SET", kind: "general", topics: surveyTopics },
  { key: "common", label: "공통형 · 돌발 일반 SET", kind: "general", topics: surpriseTopics },
  { key: "roleplay", label: "롤플레이 · 11→12→13", kind: "roleplay", topics: roleplayTopics },
  { key: "advanced", label: "고난도 · 14→15", kind: "advanced", topics: advancedTopics },
];
export default function TopicsView() {
  const [openId, setOpenId] = useState<string | null>(null);
  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
    <Link href="/" className="text-sm text-ink-400">← 홈</Link>
    <header className="mt-5"><Badge tone="accent">교재 SET별 연습</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight">세트 안에서는 순서를 바꾸지 않습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{TEXTBOOK.title}의 SET을 골라 연습하세요. 5문항 무작위 추출 대신 교재의 2~3문항 묶음을 그대로 사용합니다. 각 질문과 SET의 원문 페이지를 표시합니다.</p>
    </header>
    <div className="mt-9 space-y-10">{GROUPS.map((group) => <section key={group.key}>
      <h2 className="text-sm font-semibold tracking-wide text-ink-300">{group.label}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{group.topics.map((topic) => {
        const sets = topic.sets?.filter((s) => s.kind === group.kind) ?? [];
        if (!sets.length) return null;
        const key = `${group.key}:${topic.id}`;
        const open = openId === key;
        return <Card key={key} className="overflow-hidden">
          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : key)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
            <span><span className="block text-sm font-medium">{topic.emoji} {topic.ko}</span><span className="mt-1 block text-xs text-ink-500">{topic.en} · {sets.length} SET</span></span><span className="text-ink-400">{open ? "−" : "+"}</span>
          </button>
          {open && <div className="divide-y divide-ink-800 border-t border-ink-800">{sets.map((set) => <div key={set.id} className="p-4">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-accent-400">{set.sourceRef.label} · p.{set.sourceRef.page}</span><Link className="rounded-lg bg-accent-600/20 px-3 py-2 text-xs font-medium text-accent-400" href={`/exam?mode=practice&set=${encodeURIComponent(set.id)}`}>이 SET 연습 →</Link></div>
            <ol className="mt-3 space-y-2">{set.questionIds.map((id, i) => {
              const q = topic.questions.find((question) => question.id === id)!;
              const position = group.kind === "roleplay" ? 11 + i : group.kind === "advanced" ? 14 + i : i + 1;
              return <li key={id} className="text-xs leading-relaxed text-ink-300"><span className="text-ink-500">{position}. {TYPE_LABELS[q.type]}</span><p>{q.ko}</p><details className="mt-1"><summary className="cursor-pointer text-ink-500">영어 질문·출처 보기</summary><p className="my-2 text-sm">{q.en}</p><SourceBadge source={q.source} sourceRef={q.sourceRef} />{q.dependsOn?.length ? <p className="mt-1 text-amber-300">앞 질문의 맥락을 이어서 답하는 문항입니다.</p> : null}</details></li>;
            })}</ol>
            {set.note && <details className="mt-3 text-xs leading-relaxed text-ink-500"><summary className="cursor-pointer">원문 표기 검토 메모</summary>{set.note}</details>}
          </div>)}</div>}
        </Card>;
      })}</div>
    </section>)}</div>
    <details className="mt-10 rounded-xl border border-ink-800 p-4 text-xs text-ink-400"><summary className="cursor-pointer">출제에서 제외한 불명확한 SET {excludedSets.length}개</summary><p className="mt-3">표와 본문이 충돌하거나 대응하는 영어 질문을 확인하지 못한 세트는 임의로 완성하지 않았습니다.</p>{excludedSets.map((s) => <p key={s.id} className="mt-3 leading-relaxed"><strong>{s.topicId} · p.{s.sourceRef.page} {s.sourceRef.label}</strong><br />{s.reason}</p>)}</details>
    <Footer />
  </main>;
}
