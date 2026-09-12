import type { ExamItem, FixedPracticeSet } from "@/lib/types";
import { hasAnswerText } from "@/lib/answers";
import { itemNumber } from "@/lib/exam";

/** 두 줄과 세트 경계를 명시적으로 유지한다. 반복 표시 번호는 내부 slot으로 구분한다. */
export default function FixedPracticeNavigation({ items, sets, currentSlot, answers, onSelect }: {
  items: ExamItem[];
  sets: readonly FixedPracticeSet[];
  currentSlot: number;
  answers: Record<number, string>;
  onSelect: (index: number) => void;
}) {
  const bySlot = new Map(items.map((item, index) => [item.slot, { item, index }]));
  const groups = sets.map((set) => set.items.flatMap(({ slot }) => {
    const entry = bySlot.get(slot);
    return entry ? [entry] : [];
  }));

  return <div className="mt-2 min-w-0 max-w-full space-y-3" aria-label="고정 세트 문항 선택">
    {[0, 1].map((row) => <div key={row} role="group" aria-label={row === 0 ? "Q2–Q10" : "Q11–Q15"}
      className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-2">
      <div className="flex w-max gap-4">
        {groups.map((group, groupIndex) => {
          const entries = group.filter(({ item }) => {
            const number = Number(itemNumber("practice", item));
            return (number >= 2 && number <= 10 ? 0 : 1) === row;
          });
          if (!entries.length) return null;
          return <div key={groupIndex} role="group" aria-label={`세트 ${groupIndex + 1} · ${sets[groupIndex].label}`} className="flex gap-1">
            {entries.map(({ item, index }) => {
              const number = itemNumber("practice", item);
              const answered = hasAnswerText(answers[item.slot]);
              const active = item.slot === currentSlot;
              return <button key={item.slot} type="button" onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                aria-label={`${number}번 문항 · 세트 ${groupIndex + 1} · ${answered ? "답변함" : "미답변"}`}
                title={`${item.typeLabel} · ${answered ? "답변함" : "미답변"}`}
                className={`grid min-h-11 min-w-11 shrink-0 place-items-center border px-1 text-xs font-semibold tabular-nums transition-colors hover:border-exam-accent ${
                  active ? "border-exam-slot-active bg-exam-slot-active text-exam-slot-active-fg"
                    : answered ? "exam-slot-done border-exam-line text-exam-ink-muted"
                      : "border-exam-line bg-exam-slot text-exam-slot-fg"
                }`}>
                {number}
              </button>;
            })}
          </div>;
        })}
      </div>
    </div>)}
  </div>;
}
