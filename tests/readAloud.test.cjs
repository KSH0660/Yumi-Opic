const test = require('node:test');
const assert = require('node:assert/strict');
const {
  READ_WPM_DEFAULT, READ_WPM_MIN, READ_WPM_MAX,
  clampReadWpm, loadReadWpm, saveReadWpm, msPerWord, splitForReading, countReadWords,
} = require('../.test-build/lib/readAloud');

/** localStorage 를 흉내내는 최소 스텁. throws 를 켜면 접근 시 예외를 던진다. */
function withWindow(store, run, { throws = false } = {}) {
  const previous = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem(key) {
        if (throws) throw new Error('storage blocked');
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem(key, value) {
        if (throws) throw new Error('storage blocked');
        store[key] = value;
      },
    },
  };
  try {
    return run();
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test('속도는 눈금에 맞춰 자르고 범위를 넘지 않는다', () => {
  assert.equal(clampReadWpm(113), 110);
  assert.equal(clampReadWpm(115), 120);
  assert.equal(clampReadWpm(5), READ_WPM_MIN);
  assert.equal(clampReadWpm(9999), READ_WPM_MAX);
});

test('알 수 없는 속도는 기본값으로 본다', () => {
  assert.equal(clampReadWpm(Number.NaN), READ_WPM_DEFAULT);
  assert.equal(clampReadWpm(Number.POSITIVE_INFINITY), READ_WPM_DEFAULT);
});

test('고른 속도를 저장하고 다시 읽어 온다', () => {
  const store = {};
  withWindow(store, () => {
    saveReadWpm(140);
    assert.equal(loadReadWpm(), 140);
  });
});

test('저장된 값이 없거나 망가졌으면 기본값을 쓴다', () => {
  withWindow({}, () => assert.equal(loadReadWpm(), READ_WPM_DEFAULT));
  withWindow({ 'yumi-opic:read-wpm': 'abc' }, () => assert.equal(loadReadWpm(), READ_WPM_DEFAULT));
  // 예전에 범위 밖 값을 남겼어도 지금 범위로 당겨 온다.
  withWindow({ 'yumi-opic:read-wpm': '9999' }, () => assert.equal(loadReadWpm(), READ_WPM_MAX));
});

test('저장소를 막아 둔 브라우저에서도 멈추지 않는다', () => {
  withWindow({}, () => {
    assert.equal(loadReadWpm(), READ_WPM_DEFAULT);
    assert.doesNotThrow(() => saveReadWpm(120));
  }, { throws: true });
});

test('서버 렌더에서는 기본값을 돌려주고 아무것도 건드리지 않는다', () => {
  const previous = globalThis.window;
  delete globalThis.window;
  try {
    assert.equal(loadReadWpm(), READ_WPM_DEFAULT);
    assert.doesNotThrow(() => saveReadWpm(120));
  } finally {
    if (previous !== undefined) globalThis.window = previous;
  }
});

test('낱말 하나에 머무는 시간은 속도에 반비례한다', () => {
  assert.equal(msPerWord(60), 1000);
  assert.equal(msPerWord(120), 500);
  assert.ok(msPerWord(180) < msPerWord(90));
});

test('낱말과 그 사이를 번갈아 쪼개고 한 글자도 잃지 않는다', () => {
  const text = "What's really nice is that it clears my head — every day.";
  const tokens = splitForReading(text);
  assert.equal(tokens.map((t) => t.text).join(''), text);
  assert.equal(tokens[0].text, "What's");
  assert.ok(tokens[0].word);
  assert.ok(!tokens[1].word);
});

test('낱말 수는 문장부호를 세지 않는다', () => {
  assert.equal(countReadWords('I go jogging, and then I run.'), 7);
  assert.equal(countReadWords('   '), 0);
  assert.equal(countReadWords(''), 0);
});

/* ── 읽었는지 확인하기 ───────────────────────────────────────────── */

const { readCoverage, READ_COVERAGE_PASS, loadReadCheck, saveReadCheck } = require('../.test-build/lib/readAloud');

const TARGET = 'I go jogging about three times a week, usually in the morning before work.';

test('그대로 읽으면 전부 따라온 것으로 본다', () => {
  assert.equal(readCoverage(TARGET, TARGET), 1);
  // 대소문자와 문장부호는 보지 않는다.
  assert.equal(readCoverage(TARGET, 'i go jogging about three times a week usually in the morning before work'), 1);
});

test('건너뛴 만큼 커버리지가 내려간다', () => {
  const half = 'I go jogging about three times a week';
  const coverage = readCoverage(TARGET, half);
  assert.ok(coverage > 0.5 && coverage < 0.7, `got ${coverage}`);
});

test('받아쓰기가 끼워 넣은 엉뚱한 말은 점수를 올리지 않는다', () => {
  const noisy = 'I go jogging about three times a week usually in the morning before work um yeah okay so anyway';
  assert.equal(readCoverage(TARGET, noisy), 1);
  assert.ok(readCoverage(TARGET, 'completely different words here') < 0.3);
});

test('아무 말도 안 들리면 0이다', () => {
  assert.equal(readCoverage(TARGET, ''), 0);
  assert.equal(readCoverage(TARGET, '   '), 0);
  assert.equal(readCoverage('', 'anything'), 0);
});

test('순서가 뒤집힌 말은 그만큼만 센다', () => {
  // 뒤에서부터 읽으면 순서를 지킨 부분만 겹친다.
  const reversed = TARGET.split(' ').reverse().join(' ');
  assert.ok(readCoverage(TARGET, reversed) < READ_COVERAGE_PASS);
});

test('마이크 확인 설정을 저장하고 다시 읽어 온다', () => {
  const store = {};
  withWindow(store, () => {
    assert.equal(loadReadCheck(), false);
    saveReadCheck(true);
    assert.equal(loadReadCheck(), true);
    saveReadCheck(false);
    assert.equal(loadReadCheck(), false);
  });
  withWindow({}, () => {
    assert.equal(loadReadCheck(), false);
    assert.doesNotThrow(() => saveReadCheck(true));
  }, { throws: true });
});
