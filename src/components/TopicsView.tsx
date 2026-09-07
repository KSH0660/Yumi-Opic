"use client";
import Link from "next/link";
import { useState } from "react";
import { surveyTopics } from "@/data";
import { TYPE_LABELS } from "@/lib/exam";
import Footer from "./Footer";
import { Badge, Card, SourceBadge } from "./ui";

export default function TopicsView() {
  const [openId, setOpenId] = useState<string | null>(null);
  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
    <Link href="/" className="text-sm text-ink-400">← 홈</Link>
    <header className="mt-5">
      <Badge tone="accent">주제별 6유형</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">한 토픽을 여섯 방향으로 돌려 말하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">각 토픽에는 묘사 2개, 루틴 1개, 최근·최초 경험 2개, 기억·문제 경험 1개, 비교 1개, 이슈 1개가 있습니다. 연습을 시작하면 여섯 유형에서 하나씩 뽑습니다.</p>
    </header>

    <div className="mt-9 grid gap-3 sm:grid-cols-2">{surveyTopics.map((topic) => {
      const open = openId === topic.id;
      return <Card key={topic.id} className="overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : topic.id)} className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-medium">{topic.emoji} {topic.ko}</span>
            <span className="mt-1 block text-xs text-ink-500">{topic.en} · {topic.questions.length}문항 · {open ? "접기" : "문제 보기"}</span>
          </button>
          <Link className="rounded-lg bg-accent-600/20 px-3 py-2 text-xs font-medium text-accent-400" href={`/exam?mode=practice&topic=${encodeURIComponent(topic.id)}`}>6유형 연습 →</Link>
        </div>
        {open && <div className="divide-y divide-ink-800 border-t border-ink-800">{topic.questions.map((q) => <div key={q.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-accent-400">{TYPE_LABELS[q.type]}</span><SourceBadge source={q.source} /></div>
          <p className="mt-2 text-sm leading-relaxed text-ink-200">{q.en}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">{q.ko}</p>
        </div>)}</div>}
      </Card>;
    })}</div>
    <Footer />
  </main>;
}
