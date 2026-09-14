const test = require('node:test');
const assert = require('node:assert/strict');
const { isWakeLockSupported, requestScreenWakeLock } = require('../.test-build/lib/wakeLock');

/**
 * 화면 잠금을 흉내 낸 기기에서 돌린다. `request` 는 약속을 돌려주므로 확인은
 * 마이크로태스크가 흐른 뒤에 한다.
 */
async function withDevice(run, { supported = true } = {}) {
  const sentinels = [];
  const listeners = new Set();
  const page = {
    visibilityState: 'visible',
    addEventListener: (type, fn) => { if (type === 'visibilitychange') listeners.add(fn); },
    removeEventListener: (type, fn) => { if (type === 'visibilitychange') listeners.delete(fn); },
  };
  const wakeLock = {
    request: () => {
      const handlers = new Set();
      const sentinel = {
        released: false,
        release: async () => { sentinel.released = true; },
        addEventListener: (type, fn) => { if (type === 'release') handlers.add(fn); },
        /** 브라우저가 스스로 놓을 때 보내는 신호. */
        fireRelease: () => { sentinel.released = true; for (const fn of [...handlers]) fn(); },
      };
      sentinels.push(sentinel);
      return Promise.resolve(sentinel);
    },
  };

  // Node 는 navigator 를 읽기 전용 게터로 내놓아 그냥 대입하면 조용히 무시된다.
  const previousNavigator = Object.getOwnPropertyDescriptor(global, 'navigator');
  const previousDocument = global.document;
  Object.defineProperty(global, 'navigator', {
    value: supported ? { wakeLock } : {},
    configurable: true,
    writable: true,
  });
  global.document = page;
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const setVisibility = (state) => {
    page.visibilityState = state;
    // 화면이 꺼지면 브라우저가 잠금을 스스로 놓는다. 그것부터 흉내 낸다.
    if (state !== 'visible') sentinels.at(-1)?.fireRelease();
    for (const fn of [...listeners]) fn();
  };
  try {
    return await run({ sentinels, listeners, settle, setVisibility });
  } finally {
    if (previousNavigator === undefined) delete global.navigator;
    else Object.defineProperty(global, 'navigator', previousNavigator);
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
}

test('화면을 깨워 두고, 놓아 주면 잠금도 풀린다', async () => {
  await withDevice(async ({ sentinels, listeners, settle }) => {
    assert.equal(isWakeLockSupported(), true);
    const handle = requestScreenWakeLock();
    await settle();
    assert.equal(sentinels.length, 1);

    handle.release();
    await settle();
    assert.equal(sentinels[0].released, true);
    // 놓아 준 뒤에는 화면 감시도 거둔다
    assert.equal(listeners.size, 0);
  });
});

test('화면이 꺼졌다 돌아오면 다시 잡는다', async () => {
  await withDevice(async ({ sentinels, settle, setVisibility }) => {
    const handle = requestScreenWakeLock();
    await settle();
    assert.equal(sentinels.length, 1);

    // 브라우저는 화면이 꺼질 때 잠금을 스스로 놓는다. 돌아왔을 때 다시 잡지 않으면
    // 다음 문항부터는 소용이 없다.
    setVisibility('hidden');
    await settle();
    assert.equal(sentinels.length, 1);

    setVisibility('visible');
    await settle();
    assert.equal(sentinels.length, 2);

    handle.release();
    await settle();
    assert.equal(sentinels[1].released, true);
  });
});

test('놓아 준 뒤에는 화면이 돌아와도 다시 잡지 않는다', async () => {
  await withDevice(async ({ sentinels, settle, setVisibility }) => {
    const handle = requestScreenWakeLock();
    await settle();
    handle.release();
    await settle();

    setVisibility('hidden');
    setVisibility('visible');
    await settle();
    assert.equal(sentinels.length, 1);
  });
});

test('화면 잠금이 없는 기기에서는 아무 일도 하지 않는다', async () => {
  await withDevice(() => {
    assert.equal(isWakeLockSupported(), false);
    assert.equal(requestScreenWakeLock(), null);
  }, { supported: false });
});
