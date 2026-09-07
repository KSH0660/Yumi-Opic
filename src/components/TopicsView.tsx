"use client";
import Link from "next/link";
import { useState } from "react";
import { surveyTopics } from "@/data";
import { TYPE_LABELS } from "@/lib/exam";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";
import { Badge, Card, SourceBadge } from "./ui";

export default function TopicsView() {
  const [openId, setOpenId] = useState<string | null>(null);
  return <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-sm text-fg-muted transition-colors hover:text-fg">← 홈</Link>
      <ThemeToggle />
    </div>
    <header className="mt-5">
      <Badge tone="accent">기출 복원 문제은행</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">주제별 연습</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">주제를 하나 골라 그 주제의 문항만 유형별로 연습합니다. 이 화면에는 기출 복원으로 확인된 문항만 나오고, 출제 유형 기반으로 만든 문항은 빠집니다.</p>
    </header>

    <div className="mt-9 grid gap-3 sm:grid-cols-2">{surveyTopics.map((topic) => {
      const open = openId === topic.id;
      const verifiedQuestions = topic.questions.filter((q) => q.source === "verified");
      return <Card key={topic.id} className="overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : topic.id)} className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-medium">{topic.emoji} {topic.ko}</span>
            <span className="mt-1 block text-xs text-fg-subtle">{topic.en} · 복원 {verifiedQuestions.length}문항 · {open ? "접기" : "문제 보기"}</span>
          </button>
          <Link className="rounded-lg bg-primary-tint px-3 py-2 text-xs font-medium text-primary-ink" href={`/exam?mode=practice&topic=${encodeURIComponent(topic.id)}`}>연습하기 →</Link>
        </div>
        {open && <div className="divide-y divide-line border-t border-line">{verifiedQuestions.map((q) => <div key={q.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-primary-ink">{TYPE_LABELS[q.type]}</span><SourceBadge source={q.source} /></div>
          <p className="mt-2 text-sm leading-relaxed text-fg">{q.en}</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-subtle">{q.ko}</p>
        </div>)}</div>}
      </Card>;
    })}</div>
    <Footer />
  </main>;
}
