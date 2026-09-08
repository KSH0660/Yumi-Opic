import { Suspense } from "react";
import FeedbackReportView from "@/components/FeedbackReportView";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-5 pt-16 text-sm text-fg-muted">
          모아보기를 준비하는 중…
        </main>
      }
    >
      <FeedbackReportView />
    </Suspense>
  );
}
