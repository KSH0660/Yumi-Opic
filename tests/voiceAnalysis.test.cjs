const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildVoiceAnalysis,
  createVad,
  observeVadLevel,
  vadSignals,
  fillerFeedback,
  variation,
} = require('../.test-build/lib/voiceAnalysis');

/** 받아쓰기로 잰 신호. 낱말 수로 덩어리를 센다. */
function wordSignals(overrides = {}) {
  return {
    speakingTimeSec: 60,
    longPauseCount: 0,
    chunks: { kind: 'words', values: [] },
    cadenceSamples: [],
    energySamples: [],
    ...overrides,
  };
}

test('텍스트가 없으면 분석을 만들지 않는다', () => {
  // 낱말 수 없이는 속도도 군더더기도 잴 수 없다. 빈 분석을 그리느니 없는 편이 정직하다.
  assert.equal(buildVoiceAnalysis('', wordSignals()), null);
  assert.equal(buildVoiceAnalysis('   ', wordSignals()), null);
});

test('속도는 낱말 수와 말한 시간으로 잰다', () => {
  const text = Array.from({ length: 100 }, () => 'word').join(' ');
  const analysis = buildVoiceAnalysis(text, wordSignals({ speakingTimeSec: 60 }));
  assert.equal(analysis.wordsPerMinute, 100);
  assert.match(analysis.pace, /적절한 속도/);

  const fast = buildVoiceAnalysis(text, wordSignals({ speakingTimeSec: 40 }));
  assert.equal(fast.wordsPerMinute, 150);
  assert.match(fast.pace, /속도가 빠릅니다/);
});

test('느린 속도는 더 빠르게 말하라고 하지 않는다', () => {
  const text = Array.from({ length: 60 }, () => 'word').join(' ');
  const analysis = buildVoiceAnalysis(text, wordSignals({ speakingTimeSec: 60 }));
  assert.equal(analysis.wordsPerMinute, 60);
  assert.match(analysis.pace, /더 빠르게 말할 필요는 없습니다/);
});

test('짧은 덩어리가 이어지면 토막 난 것으로 본다', () => {
  const text = Array.from({ length: 40 }, () => 'word').join(' ');
  const fragmented = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'words', values: [3, 2, 3, 2, 3] } }));
  assert.match(fragmented.chunking, /Fragmented/);

  const connected = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'words', values: [12, 14, 9, 11] } }));
  assert.match(connected.chunking, /Connected/);
});

test('짧은 도입 뒤의 쉼은 토막으로 세지 않는다', () => {
  // "Well," 하고 한 박자 쉬는 것은 답변을 만드는 자연스러운 방식이다.
  const text = `Well, ${Array.from({ length: 40 }, () => 'word').join(' ')}`;
  const analysis = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'words', values: [1, 12, 14, 13] } }));
  assert.match(analysis.chunking, /Connected/);
});

test('녹음으로 잰 덩어리는 초로 판단한다', () => {
  const text = Array.from({ length: 60 }, () => 'word').join(' ');
  const fragmented = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'seconds', values: [0.8, 1.1, 0.9, 1.2, 0.7] } }));
  assert.match(fragmented.chunking, /Fragmented/);

  const connected = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'seconds', values: [4.2, 6.0, 3.5, 5.1] } }));
  assert.match(connected.chunking, /Connected/);
});

test('긴 쉼 횟수는 잰 그대로 넘긴다', () => {
  const analysis = buildVoiceAnalysis('I like running.', wordSignals({ longPauseCount: 2 }));
  assert.equal(analysis.longPauseCount, 2);
});

test('세기 표본이 모자라면 없는 것으로 알린다', () => {
  // 없는 값을 "고르다"로 읽으면 멀쩡한 억양을 단조롭다고 하게 된다.
  const analysis = buildVoiceAnalysis('I like running.', wordSignals({ energySamples: [0.4, 0.5] }));
  assert.equal(variation([0.4, 0.5]), null);
  assert.match(analysis.energy, /unavailable/);
  assert.match(analysis.stressDelivery, /Not enough audio data/);
});

test('자연스러운 생각 표현은 준비된 답변 신호를 덜어 준다', () => {
  const text = `Well, let me think. ${Array.from({ length: 90 }, () => 'word').join(' ')}`;
  const flat = Array.from({ length: 20 }, () => 0.3);
  const analysis = buildVoiceAnalysis(text, wordSignals({ chunks: { kind: 'words', values: [2, 90] }, energySamples: flat }));
  assert.match(analysis.spontaneity, /Natural \/ spontaneous/);
});

test('군더더기는 양이 아니라 흐름을 끊는지로 본다', () => {
  assert.match(fillerFeedback('I go to the gym every day.', 7), /No tracked fillers/);
  assert.match(fillerFeedback('Well, I go to the gym.', 6), /natural real-time thinking/);
});

/* ------------------------------------------------------------------ */
/* 입력 레벨로 말한 구간 가르기                                          */
/* ------------------------------------------------------------------ */

/** rAF 한 프레임씩 흘려보낸다. `atMs` 는 계속 이어진다. */
function feed(state, { level, ms, step = 16, atMs = 0 }) {
  let now = atMs;
  const until = atMs + ms;
  while (now < until) {
    now += step;
    state = observeVadLevel(state, level, now);
  }
  return { state, atMs: now };
}

test('말하는 구간과 쉬는 구간을 가른다', () => {
  let { state, atMs } = feed(createVad(0), { level: 0.5, ms: 3_000 });
  ({ state, atMs } = feed(state, { level: 0.01, ms: 2_000, atMs }));
  ({ state, atMs } = feed(state, { level: 0.5, ms: 2_000, atMs }));
  const signals = vadSignals(state, atMs);
  assert.equal(signals.chunks.kind, 'seconds');
  assert.equal(signals.chunks.values.length, 2);
  assert.ok(signals.chunks.values[0] > 2.5 && signals.chunks.values[0] < 3.5);
});

test('낱말 사이의 짧은 숨은 같은 덩어리로 본다', () => {
  // 0.2초마다 구간을 끊으면 모든 답변이 토막 난 것으로 나온다.
  let { state, atMs } = feed(createVad(0), { level: 0.5, ms: 2_000 });
  ({ state, atMs } = feed(state, { level: 0.02, ms: 200, atMs }));
  ({ state, atMs } = feed(state, { level: 0.5, ms: 2_000, atMs }));
  const signals = vadSignals(state, atMs);
  assert.equal(signals.chunks.values.length, 1);
});

test('5초를 넘겨 쉬면 긴 쉼으로 센다', () => {
  let { state, atMs } = feed(createVad(0), { level: 0.5, ms: 2_000 });
  ({ state, atMs } = feed(state, { level: 0.01, ms: 6_000, atMs }));
  ({ state, atMs } = feed(state, { level: 0.5, ms: 2_000, atMs }));
  assert.equal(vadSignals(state, atMs).longPauseCount, 1);

  // 3초는 생각하는 시간이다. 세지 않는다.
  let short = feed(createVad(0), { level: 0.5, ms: 2_000 });
  short = feed(short.state, { level: 0.01, ms: 3_000, atMs: short.atMs });
  short = feed(short.state, { level: 0.5, ms: 2_000, atMs: short.atMs });
  assert.equal(vadSignals(short.state, short.atMs).longPauseCount, 0);
});

test('한 번 튀는 소리는 말소리로 세지 않는다', () => {
  // 문 닫는 소리처럼 한 프레임만 크게 들어오는 것.
  let state = createVad(0);
  state = observeVadLevel(state, 0.9, 16);
  state = observeVadLevel(state, 0.01, 32);
  const { state: quiet, atMs } = feed(state, { level: 0.01, ms: 2_000, atMs: 32 });
  assert.equal(vadSignals(quiet, atMs).chunks.values.length, 0);
});

test('조용히 있기만 하면 말한 구간이 없다', () => {
  const { state, atMs } = feed(createVad(0), { level: 0.03, ms: 10_000 });
  const signals = vadSignals(state, atMs);
  assert.equal(signals.chunks.values.length, 0);
  assert.equal(signals.longPauseCount, 0);
  // 말한 시간 자체는 답변을 받은 시간 그대로다. 속도는 이 시간으로 잰다.
  assert.equal(signals.speakingTimeSec, 10);
});

test('화면이 멈췄다 돌아온 긴 간격은 쉼으로도 말로도 세지 않는다', () => {
  let { state, atMs } = feed(createVad(0), { level: 0.5, ms: 2_000 });
  // 화면이 꺼져 30초 동안 프레임이 오지 않았다
  state = observeVadLevel(state, 0.5, atMs + 30_000);
  const resumed = feed(state, { level: 0.5, ms: 2_000, atMs: atMs + 30_000 });
  assert.equal(vadSignals(resumed.state, resumed.atMs).longPauseCount, 0);
});

test('말하는 도중에 끝나도 그 구간까지 센다', () => {
  const { state, atMs } = feed(createVad(0), { level: 0.5, ms: 3_000 });
  const signals = vadSignals(state, atMs);
  assert.equal(signals.chunks.values.length, 1);
});

test('입력 세기 표본은 녹음에서도 모인다', () => {
  // 휴대폰에서 처음으로 전달력(Stress & Delivery)을 잴 수 있게 된 근거다.
  const { state, atMs } = feed(createVad(0), { level: 0.5, ms: 3_000 });
  assert.ok(vadSignals(state, atMs).energySamples.length >= 6);
});
