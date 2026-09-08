"use client";

/**
 * 실제 응시 화면처럼 세로 축에서만 움직이는 마이크 입력 표시.
 * 원은 하나뿐이다. 현재 입력과 최근 최대 입력을 함께 그리면 두 원이 서로 다른
 * 속도로 오르내려 답변에 집중하기 어려웠다.
 *
 * `indeterminate` 는 마이크를 받아쓰기가 혼자 쓰는 기기(휴대폰)용이다. 입력을
 * 잴 길이 없으니 숫자를 지어내지 않고, 원이 천천히 오르내리며 듣고 있다는 것만
 * 알린다.
 */
export default function MicLevelMeter({
  level,
  active,
  indeterminate = false,
}: {
  level: number;
  active: boolean;
  indeterminate?: boolean;
}) {
  const value = Math.round(Math.min(1, Math.max(0, level)) * 100);
  const blind = active && indeterminate;
  // 잴 수 없을 때는 가운데에 둔다. 애니메이션이 여기서부터 오르내린다.
  const offset = blind ? 50 : 100 - value;
  return (
    <div className="relative h-28 w-8 [--mic-travel:92px] lg:h-40 lg:[--mic-travel:140px]" role="meter" aria-label="마이크 입력 레벨"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={blind ? undefined : value}
      aria-valuetext={blind ? "받아쓰기 중 · 입력 레벨 표시 없음" : active ? `현재 ${value}%` : "대기 중"}>
      <div aria-hidden="true" className="absolute inset-x-0 inset-y-2.5">
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-exam-line" />
        <div data-mic-marker="current" title={blind ? "받아쓰기 중" : active ? "현재 입력" : "대기 중"}
          className={`absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-exam-ink-muted bg-exam-frame transition-transform duration-100 motion-reduce:transition-none ${blind ? "animate-mic-listen" : active ? "" : "opacity-60"}`}
          style={{ top: 0, transform: `translateY(calc(${offset} * (var(--mic-travel) / 100) - 50%))` }} />
      </div>
    </div>
  );
}
