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

test('실제 연습 한 문항은 수십 원 수준이다', () => {
  const typical = estimateFeedbackCost({ questionChars: 120, transcriptChars: 700, audioSec: 75 });
  assert.ok(typical.krw > 10 && typical.krw < 100, `got ${typical.krw}`);
});

test('원화 표기는 크기에 따라 자리수를 맞춘다', () => {
  assert.equal(formatKrw(0), '0원');
  assert.equal(formatKrw(-3), '0원');
  assert.equal(formatKrw(0.42), '0.42원');
  assert.equal(formatKrw(4.25), '4.3원');
  assert.equal(formatKrw(28.6), '29원');
  assert.equal(formatKrw(12345), '12,345원');
});
