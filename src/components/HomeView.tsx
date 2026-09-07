"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function HomeView() {
  return <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 pb-10 pt-6 sm:px-8">
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-sm font-semibold tracking-tight text-fg-muted">Yumi OPIc</h1>
      <ThemeToggle />
    </div>
    <div className="flex flex-1 items-center py-10">
      <div className="animate-fade-up grid w-full gap-4 sm:grid-cols-2">
        <ModeButton href="/topics" title="주제별 연습" desc="한 주제를 골라 1~15번을 연습합니다." />
        <ModeButton href="/exam?mode=full" title="실전 모의고사" desc="자기소개부터 15번까지 실제 시험 순서 그대로 풀어 봅니다." primary />
      </div>
    </div>
  </main>;
}

function ModeButton({ href, title, desc, primary = false }: { href: string; title: string; desc: string; primary?: boolean }) {
  return <Link href={href} className={`flex min-h-52 flex-col rounded-3xl border p-7 shadow-card transition sm:min-h-64 sm:p-8 ${primary ? "border-primary/40 bg-primary-tint hover:bg-primary-tint-strong" : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"}`}>
    <span className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</span>
    <span className="mt-3 text-sm leading-relaxed text-fg-muted">{desc}</span>
    <span className="mt-auto pt-8 text-sm font-medium text-primary-ink">시작하기 →</span>
  </Link>;
}
