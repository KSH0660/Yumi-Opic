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
      <Badge tone="accent">공개 복원 문제은행</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">실제로 복원된 질문부터 반복하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">기본 문제은행에서는 공개된 수험자 복원·기출 정리 자료에서 확인되는 문항만 보여줍니다. 출제형식만 참고해 만든 보조 문항은 이 화면과 주제별 연습에서 제외합니다.</p>
    </header>

    <div className="mt-9 grid gap-3 sm:grid-cols-2">{surveyTopics.map((topic) => {
      const open = openId === topic.id;
      const verifiedQuestions = topic.questions.filter((q) => q.source === "verified");
      return <Card key={topic.id} className="overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : topic.id)} className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-medium">{topic.emoji} {topic.ko}</span>
            <span className="mt-1 block text-xs text-ink-500">{topic.en} · 공개 복원 {verifiedQuestions.length}문항 · {open ? "접기" : "문제 보기"}</span>
          </button>
          <Link className="rounded-lg bg-accent-600/20 px-3 py-2 text-xs font-medium text-accent-400" href={`/exam?mode=practice&topic=${encodeURIComponent(topic.id)}`}>복원 연습 →</Link>
        </div>
        {open && <div className="divide-y divide-ink-800 border-t border-ink-800">{verifiedQuestions.map((q) => <div key={q.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-accent-400">{TYPE_LABELS[q.type]}</span><SourceBadge source={q.source} /></div>
          <p className="mt-2 text-sm leading-relaxed text-ink-200">{q.en}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">{q.ko}</p>
        </div>)}</div>}
      </Card>;
    })}</div>
    <Footer />
  </main>;
}
