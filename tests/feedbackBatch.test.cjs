const test = require('node:test');
const assert = require('node:assert/strict');
const { runInPool, slotsAwaitingFeedback } = require('../.test-build/lib/feedbackBatch');

test('이미 피드백을 받았거나 분석 중인 문항은 다시 보내지 않는다', () => {
  const feedback = { 2: { overall: '받음' } };
  assert.deepEqual(slotsAwaitingFeedback([1, 2, 3, 4], feedback, new Set([3])), [1, 4]);
  assert.deepEqual(slotsAwaitingFeedback([2], feedback, new Set()), []);
  assert.deepEqual(slotsAwaitingFeedback([], {}, new Set()), []);
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

test('정해 둔 수보다 많이 겹쳐 보내지 않고 모든 문항을 앞에서부터 보낸다', async () => {
  const started = [];
  let running = 0;
  let peak = 0;
  await runInPool([1, 2, 3, 4, 5, 6, 7], 3, async (slot) => {
    started.push(slot);
    running++;
    peak = Math.max(peak, running);
    await tick();
    running--;
  });
  assert.deepEqual(started, [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(peak, 3);
});

test('멈추면 새 문항은 꺼내지 않고 이미 보낸 문항만 끝낸다', async () => {
  const finished = [];
  let stop = false;
  // 1번이 끝날 때 멈추면, 그때 이미 보낸 2번만 마저 끝나고 3번부터는 보내지 않는다.
  await runInPool([1, 2, 3, 4, 5, 6], 2, async (slot) => {
    await tick();
    finished.push(slot);
    if (slot === 1) stop = true;
  }, () => stop);
  assert.deepEqual(finished.sort(), [1, 2]);
});

test('보낼 문항이 없어도 바로 끝난다', async () => {
  let calls = 0;
  await runInPool([], 3, async () => { calls++; });
  assert.equal(calls, 0);
});
