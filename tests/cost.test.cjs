const test = require('node:test');
const assert = require('node:assert/strict');
const { estimateFeedbackCost, formatKrw, RATES } = require('../.test-build/lib/cost');

test('녹음본이 있으면 전사 비용이 붙고 없으면 붙지 않는다', () => {
  const base = { questionChars: 100, transcriptChars: 600 };
  const silent = estimateFeedbackCost({ ...base, audioSec: 0 });
  const spoken = estimateFeedbackCost({ ...base, audioSec: 60 });
  assert.equal(silent.transcribeKrw, 0);
  assert.equal(spoken.transcribeKrw, RATES.transcribePerMin * RATES.krwPerUsd);
  assert.ok(spoken.krw > silent.krw);
});

test('답변이 길수록 비용이 오르고, 출력 상한 덕분에 한 자릿수 배로 튀지 않는다', () => {
  const short = estimateFeedbackCost({ questionChars: 100, transcriptChars: 200, audioSec: 0 });
  const long = estimateFeedbackCost({ questionChars: 100, transcriptChars: 4000, audioSec: 0 });
  assert.ok(long.krw > short.krw);
  assert.ok(long.krw < short.krw * 3);
});

test('음수 입력은 0으로 본다', () => {
  const negative = estimateFeedbackCost({ questionChars: -50, transcriptChars: -10, audioSec: -30 });
  const empty = estimateFeedbackCost({ questionChars: 0, transcriptChars: 0, audioSec: 0 });
  assert.deepEqual(negative, empty);
});

test('실제 연습 한 문항은 백 원 남짓이다', () => {
  // 기본 추론 강도(high)의 최대치다. 추론 토큰을 상한까지 쓰는 일은 드물어 실제로는 더 싸다.
  const typical = estimateFeedbackCost({ questionChars: 120, transcriptChars: 700, audioSec: 75 });
  assert.ok(typical.krw > 10 && typical.krw < 150, `got ${typical.krw}`);
});

test('추론 강도를 낮추면 최대 비용도 함께 내려간다', () => {
  const base = { questionChars: 120, transcriptChars: 700, audioSec: 75 };
  const efforts = ['minimal', 'low', 'medium', 'high'];
  const costs = efforts.map((effort) => estimateFeedbackCost({ ...base, effort }).krw);
  for (let i = 1; i < costs.length; i += 1) assert.ok(costs[i] > costs[i - 1], efforts[i]);
  // 강도를 적지 않으면 route.ts 와 같은 기본 강도로 본다.
  assert.equal(estimateFeedbackCost(base).krw, costs[costs.length - 1]);
});

test('원화 표기는 크기에 따라 자리수를 맞춘다', () => {
  assert.equal(formatKrw(0), '0원');
  assert.equal(formatKrw(-3), '0원');
  assert.equal(formatKrw(0.42), '0.42원');
  assert.equal(formatKrw(4.25), '4.3원');
  assert.equal(formatKrw(28.6), '29원');
  assert.equal(formatKrw(12345), '12,345원');
});
