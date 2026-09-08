"use client";

/**
 * 실제 응시 화면처럼 세로 축에서만 움직이는 마이크 입력 표시.
 * 원은 하나뿐이다. 현재 입력과 최근 최대 입력을 함께 그리면 두 원이 서로 다른
 * 속도로 오르내려 답변에 집중하기 어려웠다.
 */
export default function MicLevelMeter({ level, active }: { level: number; active: boolean }) {
  const value = Math.round(Math.min(1, Math.max(0, level)) * 100);
  return (
    <div className="relative h-28 w-8 [--mic-travel:92px] lg:h-40 lg:[--mic-travel:140px]" role="meter" aria-label="마이크 입력 레벨"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
      aria-valuetext={active ? `현재 ${value}%` : "대기 중"}>
      <div aria-hidden="true" className="absolute inset-x-0 inset-y-2.5">
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-exam-line" />
        <div data-mic-marker="current" title={active ? "현재 입력" : "대기 중"}
          className={`absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-exam-ink-muted bg-exam-frame transition-transform duration-100 motion-reduce:transition-none ${active ? "" : "opacity-60"}`}
          style={{ top: 0, transform: `translateY(calc(${100 - value} * (var(--mic-travel) / 100) - 50%))` }} />
      </div>
    </div>
  );
}
