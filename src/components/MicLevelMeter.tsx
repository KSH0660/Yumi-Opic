"use client";

/** 두 원은 같은 세로 축에서만 움직인다. 실선은 현재 입력, 흐린 원은 최근 최대 입력이다. */
export default function MicLevelMeter({ level, peak, active }: { level: number; peak: number; active: boolean }) {
  const value = Math.round(Math.min(1, Math.max(0, level)) * 100);
  const peakValue = Math.round(Math.min(1, Math.max(0, peak)) * 100);
  return (
    <div className="relative h-28 w-8 [--mic-travel:92px] lg:h-40 lg:[--mic-travel:140px]" role="meter" aria-label="마이크 입력 레벨"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
      aria-valuetext={`현재 ${value}%, 최근 최대 ${peakValue}%`}>
      <div aria-hidden="true" className="absolute inset-x-0 inset-y-2.5">
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-exam-line" />
        <div data-mic-marker="peak" title="최근 최대 입력"
          className="absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-exam-ink-muted bg-exam-frame opacity-50 transition-transform duration-150 motion-reduce:transition-none"
          style={{ top: 0, transform: `translateY(calc(${100 - peakValue} * (var(--mic-travel) / 100) - 50%))` }} />
        <div data-mic-marker="current" title="현재 입력"
          className={`absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 bg-exam-frame transition-transform duration-100 motion-reduce:transition-none ${active ? "border-exam-rec" : "border-exam-ink-muted"}`}
          style={{ top: 0, transform: `translateY(calc(${100 - value} * (var(--mic-travel) / 100) - 50%))` }} />
      </div>
    </div>
  );
}
