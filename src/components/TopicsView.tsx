"use client";

import Link from "next/link";
import { useState } from "react";
import type { Topic, TopicCategory } from "@/lib/types";
import {
  advancedTopics,
  roleplayTopics,
  surpriseTopics,
  surveyTopics,
} from "@/data";
import { TYPE_LABELS } from "@/lib/exam";
import { Badge, Card } from "./ui";

const GROUPS: { category: TopicCategory; label: string; desc: string; topics: Topic[] }[] = [
  {
    category: "survey",
    label: "서베이 주제",
    desc: "2~7번 콤보에 출제됩니다",
    topics: surveyTopics,
  },
  {
    category: "surprise",
    label: "돌발 주제",
    desc: "8~10번 콤보에 출제됩니다",
    topics: surpriseTopics,
  },
  {
    category: "roleplay",
    label: "롤플레이",
    desc: "11~13번 세트로 출제됩니다",
    topics: roleplayTopics,
  },
  {
    category: "advanced",
    label: "고난도",
    desc: "14~15번에 출제됩니다",
    topics: advancedTopics,
  },
];

export default function TopicsView() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-10 sm:px-8">
      <Link href="/" className="text-sm text-ink-400 transition hover:text-ink-100">
        ← 홈
      </Link>

      <header className="mt-5">
        <Badge tone="accent">주제별 연습</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          주제 하나를 골라 집중 연습
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">
          선택한 주제의 문항을 셔플해서 5문제씩 뽑아 줍니다. 주제 이름을 누르면
          그 주제에 들어 있는 문제를 모두 미리 볼 수도 있습니다.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {GROUPS.map((group) => (
          <section key={group.category}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-400">
                {group.label}
              </h2>
              <span className="text-xs text-ink-500">{group.desc}</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.topics.map((topic) => {
                const open = openId === topic.id;
                return (
                  <Card key={topic.id} className="overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : topic.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{topic.emoji}</span>
                          <span className="truncate text-sm font-medium text-ink-100">
                            {topic.ko}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink-500">
                          {topic.en} · {topic.questions.length}문항
                        </span>
                      </button>
                      <Link
                        href={`/exam?mode=practice&topic=${topic.id}`}
                        className="shrink-0 rounded-lg bg-accent-600/20 px-3 py-1.5 text-xs font-medium text-accent-400 transition hover:bg-accent-600/30"
                      >
                        연습 →
                      </Link>
                    </div>

                    {open && (
                      <ul className="divide-y divide-ink-800 border-t border-ink-800">
                        {topic.questions.map((q) => (
                          <li key={q.id} className="px-4 py-3">
                            <p className="text-[11px] uppercase tracking-widest text-accent-400/80">
                              {TYPE_LABELS[q.type]}
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
                              {q.en}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                              {q.ko}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
