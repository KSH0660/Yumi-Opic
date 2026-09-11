/**
 * 여러 문항의 AI 피드백을 한 번에 받을 때 쓰는 도우미.
 *
 * 문항 하나하나는 개별 버튼과 똑같은 요청을 보낸다. 여기서는 어느 문항을 보낼지와
 * 몇 개씩 동시에 보낼지만 정한다.
 */

/**
 * 한 번에 받기로 보낼 문항. 답변한 문항 가운데 피드백이 아직 없고 지금 분석 중이지도
 * 않은 것만 고른다. 이미 받은 문항을 다시 보내면 같은 답변을 한 번 더 분석하게 된다.
 */
export function slotsAwaitingFeedback(
  answeredSlots: readonly number[],
  feedbackBySlot: Readonly<Record<number, unknown>>,
  busy: ReadonlySet<number>,
): number[] {
  return answeredSlots.filter((slot) => !feedbackBySlot[slot] && !busy.has(slot));
}

/**
 * 일을 앞에서부터 꺼내 최대 limit 개씩 동시에 돌린다. shouldStop 이 참이 되면 새 일은
 * 꺼내지 않고, 이미 시작한 일이 끝나기만 기다린다. worker 는 오류를 스스로 처리한다.
 */
export async function runInPool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
  shouldStop: () => boolean = () => false,
): Promise<void> {
  let next = 0;
  const lane = async () => {
    while (next < items.length && !shouldStop()) await worker(items[next++]);
  };
  const lanes = Math.max(1, Math.min(Math.floor(limit) || 1, items.length));
  await Promise.all(Array.from({ length: lanes }, lane));
}
