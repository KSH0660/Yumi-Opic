const test = require('node:test');
const assert = require('node:assert/strict');
const {
  guessMicMode,
  isDesktopAgent,
  loadMicMode,
  resolveMicMode,
  usesDictation,
  usesRecording,
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

test('휴대폰은 겪어 보기 전에 녹음만 켠다', () => {
  assert.equal(guessMicMode({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }), 'recording-only');
  assert.equal(guessMicMode({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }), 'recording-only');
  // UA 문자열을 감추는 브라우저는 userAgentData 로 알린다
  assert.equal(guessMicMode({ userAgent: DESKTOP_CHROME, userAgentData: { mobile: true } }), 'recording-only');
});

test('데스크톱 사파리를 자처하는 아이패드도 가려낸다', () => {
  assert.equal(guessMicMode({ userAgent: MAC_SAFARI, maxTouchPoints: 5 }), 'recording-only');
});

const WINDOWS_EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0';
const WINDOWS_WHALE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36';
const CHROMEBOOK = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
/** 안드로이드 태블릿 크롬이 데스크톱 사이트를 요청할 때 보내는 UA */
const LINUX_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

test('윈도·크롬OS·맥 노트북은 데스크톱으로 본다', () => {
  assert.equal(isDesktopAgent({ userAgent: DESKTOP_CHROME, maxTouchPoints: 0, userAgentData: { mobile: false } }), true);
  // 터치스크린 윈도 노트북도 윈도다
  assert.equal(isDesktopAgent({ userAgent: WINDOWS_EDGE, maxTouchPoints: 10 }), true);
  assert.equal(isDesktopAgent({ userAgent: WINDOWS_WHALE, maxTouchPoints: 0 }), true);
  assert.equal(isDesktopAgent({ userAgent: CHROMEBOOK, maxTouchPoints: 10 }), true);
  assert.equal(isDesktopAgent({ userAgent: MAC_SAFARI, maxTouchPoints: 0 }), true);
});

test('휴대폰·태블릿과 데스크톱 UA 를 흉내 낼 수 있는 리눅스는 데스크톱으로 보지 않는다', () => {
  assert.equal(isDesktopAgent(undefined), false);
  assert.equal(isDesktopAgent({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }), false);
  assert.equal(isDesktopAgent({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }), false);
  assert.equal(isDesktopAgent({ userAgent: MAC_SAFARI, maxTouchPoints: 5 }), false);
  assert.equal(isDesktopAgent({ userAgent: DESKTOP_CHROME, userAgentData: { mobile: true } }), false);
  assert.equal(isDesktopAgent({ userAgent: LINUX_DESKTOP, maxTouchPoints: 5 }), false);
});

function withBrowser(navigator, saved, run) {
  const previous = global.window;
  const data = new Map(saved ? [['yumi-opic:mic-mode-2', saved]] : []);
  global.window = { navigator, localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  } };
  try { run(); } finally {
    if (previous === undefined) delete global.window;
    else global.window = previous;
  }
}

test('윈도 노트북은 예전에 받아쓰기만 켜기로 남긴 값이 있어도 녹음을 함께 켠다', () => {
  withBrowser({ userAgent: DESKTOP_CHROME, maxTouchPoints: 0 }, 'dictation-only', () => {
    assert.equal(loadMicMode(), 'share');
  });
  withBrowser({ userAgent: WINDOWS_EDGE, maxTouchPoints: 10 }, 'dictation-only', () => {
    assert.equal(loadMicMode(), 'share');
  });
});

test('데스크톱이 아닌 기기는 골라 남긴 값을 그대로 따른다', () => {
  // 데스크톱 사이트를 요청한 안드로이드 태블릿: 받아쓰기로 바꿔 두었다
  withBrowser({ userAgent: LINUX_DESKTOP, maxTouchPoints: 5 }, 'dictation-only', () => {
    assert.equal(loadMicMode(), 'dictation-only');
  });
  // 휴대폰에서 받아쓰기도 함께 켜보기로 했다
  withBrowser({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }, 'share', () => {
    assert.equal(loadMicMode(), 'share');
  });
  withBrowser({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }, null, () => {
    assert.equal(loadMicMode(), 'recording-only');
  });
});

test('예전 키에 남은 값은 따르지 않는다', () => {
  // 옛 `dictation-only` 는 "이 기기는 마이크를 한 곳에서만 쓴다"를 겪어 보고 남긴 값이다.
  // 그것은 녹음 기반을 피할 까닭이 아니라 그 전제라, 그대로 따르면 예전에 한 번 연습해 본
  // 휴대폰만 새 방식으로 넘어오지 못한다.
  const previous = global.window;
  const data = new Map([['yumi-opic:mic-mode', 'dictation-only']]);
  global.window = { navigator: { userAgent: ANDROID_CHROME, maxTouchPoints: 5 }, localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  } };
  try {
    assert.equal(loadMicMode(), 'recording-only');
  } finally {
    if (previous === undefined) delete global.window;
    else global.window = previous;
  }
});

const ALL = { dictation: true, recording: true, transcription: true };

test('모드마다 무엇을 켜는지', () => {
  assert.equal(usesDictation('share'), true);
  assert.equal(usesRecording('share'), true);
  assert.equal(usesDictation('recording-only'), false);
  assert.equal(usesRecording('recording-only'), true);
  assert.equal(usesDictation('dictation-only'), true);
  assert.equal(usesRecording('dictation-only'), false);
});

test('할 수 있는 것이 다 되면 고른 모드를 그대로 쓴다', () => {
  for (const mode of ['share', 'recording-only', 'dictation-only']) {
    assert.deepEqual(resolveMicMode(mode, ALL), { mode, fallback: null });
  }
});

test('전사를 쓸 수 없으면 녹음 대신 받아쓰기로 답변을 받는다', () => {
  // 안전망의 핵심이다. 녹음만 켜 두면 소리는 남지만 답변이 글로 남지 않는다.
  assert.deepEqual(
    resolveMicMode('recording-only', { ...ALL, transcription: false }),
    { mode: 'dictation-only', fallback: 'no-transcription' },
  );
});

test('받아쓰기조차 없으면 전사를 못 써도 녹음이라도 남긴다', () => {
  // 소리까지 잃는 것보다는 낫다. 나중에 전사가 살아나면 그때 글로 옮길 수 있다.
  assert.deepEqual(
    resolveMicMode('recording-only', { dictation: false, recording: true, transcription: false }),
    { mode: 'recording-only', fallback: 'no-transcription' },
  );
});

test('녹음을 못 하는 브라우저는 받아쓰기로 받는다', () => {
  assert.deepEqual(
    resolveMicMode('recording-only', { ...ALL, recording: false }),
    { mode: 'dictation-only', fallback: 'no-recording' },
  );
  assert.deepEqual(
    resolveMicMode('share', { ...ALL, recording: false }),
    { mode: 'dictation-only', fallback: 'no-recording' },
  );
});

test('받아쓰기가 없는 브라우저는 녹음과 전사로 답변을 만든다', () => {
  // 파이어폭스처럼 SpeechRecognition 이 없는 노트북 브라우저가 여기에 든다.
  assert.deepEqual(
    resolveMicMode('share', { dictation: false, recording: true, transcription: true }),
    { mode: 'recording-only', fallback: 'no-dictation' },
  );
  assert.deepEqual(
    resolveMicMode('dictation-only', { dictation: false, recording: true, transcription: true }),
    { mode: 'recording-only', fallback: 'no-dictation' },
  );
  // 전사까지 막혀 있으면 어느 쪽으로도 갈 수 없다. 화면이 직접 입력을 안내한다.
  assert.deepEqual(
    resolveMicMode('dictation-only', { dictation: false, recording: true, transcription: false }),
    { mode: 'dictation-only', fallback: 'no-dictation' },
  );
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
