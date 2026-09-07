const test = require('node:test');
const assert = require('node:assert/strict');
const theme = require('../.test-build/lib/theme');

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

test('라이트가 기본 테마다', () => {
  assert.equal(theme.DEFAULT_THEME, 'light');
  assert.deepEqual([...theme.THEMES], ['light', 'dark']);
});

test('저장된 값이 없으면 라이트를 쓴다', () => {
  assert.equal(withWindow({}, () => theme.loadTheme()), 'light');
});

test('저장된 테마를 그대로 복원한다', () => {
  for (const value of ['light', 'dark']) {
    const store = { [theme.THEME_KEY]: value };
    assert.equal(withWindow(store, () => theme.loadTheme()), value);
  }
});

test('알 수 없는 값이나 스토리지 오류는 기본 테마로 되돌린다', () => {
  assert.equal(withWindow({ [theme.THEME_KEY]: 'solarized' }, () => theme.loadTheme()), 'light');
  assert.equal(withWindow({}, () => theme.loadTheme(), { throws: true }), 'light');
  assert.doesNotThrow(() => withWindow({}, () => theme.saveTheme('dark'), { throws: true }));
});

test('saveTheme 이 loadTheme 과 같은 키를 쓴다', () => {
  const store = {};
  withWindow(store, () => theme.saveTheme('dark'));
  assert.equal(store[theme.THEME_KEY], 'dark');
  assert.equal(withWindow(store, () => theme.loadTheme()), 'dark');
});

test('서버 렌더에서는 기본 테마를 반환하고 아무것도 건드리지 않는다', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(theme.loadTheme(), 'light');
  assert.doesNotThrow(() => theme.saveTheme('dark'));
  assert.doesNotThrow(() => theme.applyTheme('dark'));
});

test('isTheme 이 테마 값만 통과시킨다', () => {
  for (const ok of ['light', 'dark']) assert.equal(theme.isTheme(ok), true);
  for (const no of ['Light', 'system', '', null, undefined, 0, {}]) assert.equal(theme.isTheme(no), false);
});

test('초기화 스크립트는 저장된 선택만 적용하고 OS 설정은 보지 않는다', () => {
  const script = theme.THEME_INIT_SCRIPT;
  assert.ok(script.includes(JSON.stringify(theme.THEME_KEY)));
  // 라이트가 기본이므로 prefers-color-scheme 로 다크를 켜면 안 된다.
  assert.ok(!script.includes('prefers-color-scheme'), 'OS 다크 선호를 따라가면 안 된다');
  assert.ok(script.includes('try'), '스토리지 예외를 삼켜야 한다');
});

test('초기화 스크립트가 저장값에 따라 data-theme 을 세팅한다', () => {
  const run = (stored) => {
    const el = { dataset: {} };
    const fn = new Function('localStorage', 'document', theme.THEME_INIT_SCRIPT);
    fn({ getItem: () => stored }, { documentElement: el, querySelector: () => null });
    return el.dataset.theme;
  };
  assert.equal(run('dark'), 'dark');
  assert.equal(run('light'), 'light');
  assert.equal(run(null), undefined, '저장값이 없으면 서버가 그린 기본값을 유지한다');
  assert.equal(run('bogus'), undefined);
});
