const test = require('node:test');
const assert = require('node:assert/strict');
const {
  guessMicMode,
  createMicProbe,
  observeMicLevel,
  observeMicResult,
  isMicConflict,
} = require('../.test-build/lib/micShare');

const DESKTOP_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const MAC_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; SM-S926N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

test('노트북 브라우저는 받아쓰기와 녹음을 함께 켠다', () => {
  assert.equal(guessMicMode(undefined), 'share');
  assert.equal(guessMicMode({ userAgent: DESKTOP_CHROME, maxTouchPoints: 0 }), 'share');
  assert.equal(guessMicMode({ userAgent: MAC_SAFARI, maxTouchPoints: 0 }), 'share');
});

test('휴대폰은 겪어 보기 전에 받아쓰기만 켠다', () => {
  assert.equal(guessMicMode({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }), 'dictation-only');
  assert.equal(guessMicMode({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }), 'dictation-only');
  // UA 문자열을 감추는 브라우저는 userAgentData 로 알린다
  assert.equal(guessMicMode({ userAgent: DESKTOP_CHROME, userAgentData: { mobile: true } }), 'dictation-only');
});

test('데스크톱 사파리를 자처하는 아이패드도 가려낸다', () => {
  assert.equal(guessMicMode({ userAgent: MAC_SAFARI, maxTouchPoints: 5 }), 'dictation-only');
});

/** rAF 한 프레임씩 흘려보낸다. `atMs` 는 계속 이어진다. */
function feed(probe, { level, ms, step = 16, atMs = 0 }) {
  let now = atMs;
  const until = atMs + ms;
  while (now < until) {
    now += step;
    probe = observeMicLevel(probe, level, now);
  }
  return { probe, atMs: now };
}

test('조용한 방에서는 아무리 기다려도 충돌로 보지 않는다', () => {
  const { probe } = feed(createMicProbe(0), { level: 0.04, ms: 20_000 });
  assert.equal(isMicConflict(probe), false);
});

test('사람 목소리가 3초 넘게 들어오는데 한 글자도 없으면 충돌이다', () => {
  const short = feed(createMicProbe(0), { level: 0.6, ms: 2_000 });
  assert.equal(isMicConflict(short.probe), false);
  const long = feed(short.probe, { level: 0.6, ms: 1_500, atMs: short.atMs });
  assert.equal(isMicConflict(long.probe), true);
});

test('받아쓰기가 한 번이라도 글자를 주면 충돌로 보지 않는다', () => {
  const heard = observeMicResult(createMicProbe(0));
  const { probe } = feed(heard, { level: 0.9, ms: 60_000 });
  assert.equal(isMicConflict(probe), false);
});

test('화면이 멈췄다 돌아온 긴 간격은 말한 시간으로 세지 않는다', () => {
  // 1초에 한 프레임씩만 도착하면 그 사이 무슨 일이 있었는지 알 수 없다
  const { probe } = feed(createMicProbe(0), { level: 0.9, ms: 30_000, step: 1_000 });
  assert.equal(isMicConflict(probe), false);
});
