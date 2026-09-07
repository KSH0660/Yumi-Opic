import { Suspense } from "react";
import ExamPageClient from "@/components/ExamPageClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-ink-400">
          시험지를 준비하는 중…
        </main>
      }
    >
      <ExamPageClient />
    </Suspense>
  );
}
