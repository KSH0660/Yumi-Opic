const test = require('node:test');
const assert = require('node:assert/strict');
const { collectTranscript, mergeTranscript, overlapWordCount } = require('../.test-build/lib/transcript');

/**
 * 라이브러리(startDictation)가 하는 접기 과정을 그대로 흉내 낸다.
 *  - onresult 마다 results 전체를 인덱스 기준으로 다시 읽는다
 *  - 인식이 끊기면 지금까지의 결과를 settled 로 접고 인덱스를 0부터 다시 센다
 * 브라우저 없이 기기별 버그 상황을 재현하려는 것이다.
 */
function runSession(events) {
  let settled = '';
  let chunks = [];
  let last = { committed: '', interim: '' };
  for (const event of events) {
    if (event === 'restart' || event === 'end') {
      settled = mergeTranscript(settled, collectTranscript(chunks).committed);
      chunks = [];
      last = { committed: settled, interim: '' };
      continue;
    }
    chunks = event.map((c) => ({ isFinal: !!c.isFinal, transcript: c.transcript }));
    const draft = collectTranscript(chunks);
    last = { committed: mergeTranscript(settled, draft.committed), interim: draft.interim };
  }
  return last;
}

const FINAL = (transcript) => ({ isFinal: true, transcript });
const PENDING = (transcript) => ({ isFinal: false, transcript });

test('겹치는 단어가 없으면 그대로 이어 붙인다', () => {
  assert.equal(mergeTranscript('I go to the gym', 'every morning'), 'I go to the gym every morning');
  assert.equal(mergeTranscript('', 'hello there'), 'hello there');
  assert.equal(mergeTranscript('hello there', ''), 'hello there');
  assert.equal(mergeTranscript('  ', '  '), '');
  assert.equal(mergeTranscript('I run  ', '  a lot'), 'I run a lot');
});

test('이어 붙이는 자리에서 겹친 말은 한 번만 남긴다', () => {
  assert.equal(mergeTranscript('I go to the gym', 'to the gym every day'), 'I go to the gym every day');
  assert.equal(mergeTranscript('I go to the gym', 'I go to the gym'), 'I go to the gym');
});

test('대소문자와 문장부호가 달라도 같은 말로 본다', () => {
  // 앞 문장을 통째로 품고 있으면 인식기가 다듬은 긴 쪽을 남긴다
  assert.equal(mergeTranscript('I love music.', 'I love music, especially jazz'), 'I love music, especially jazz');
  assert.equal(overlapWordCount('we went there', 'We went there again'), 3);
});

test('한 단어만 같은 경우는 지우지 않는다', () => {
  // "I like it" + "it was fun" 을 합치다 멀쩡한 문장을 망가뜨리면 안 된다
  assert.equal(overlapWordCount('I like it', 'it was fun'), 0);
  assert.equal(mergeTranscript('I like it', 'it was fun'), 'I like it it was fun');
  assert.equal(mergeTranscript('very', 'very good'), 'very very good');
});

test('resultIndex 가 늘 0 이어도 같은 결과가 두 번 쌓이지 않는다', () => {
  // 안드로이드 크롬은 결과 전체를 매 이벤트마다 다시 보낸다
  const result = runSession([
    [FINAL('I usually go jogging')],
    [FINAL('I usually go jogging')],
    [FINAL('I usually go jogging'), PENDING('in the')],
    [FINAL('I usually go jogging'), FINAL('in the evening')],
    [FINAL('I usually go jogging'), FINAL('in the evening')],
  ]);
  assert.equal(result.committed, 'I usually go jogging in the evening');
  assert.equal(result.interim, '');
});

test('앞 문장을 누적해서 보내는 기기에서도 한 번만 남는다', () => {
  const result = runSession([
    [FINAL('I like'), FINAL('I like running'), FINAL('I like running outside')],
  ]);
  assert.equal(result.committed, 'I like running outside');
});

test('인식이 끊겼다 다시 켜져도 직전 문장이 되풀이되지 않는다', () => {
  const result = runSession([
    [FINAL('I went to the beach last summer')],
    'restart',
    // 다시 켜진 세션이 직전 발화 끝을 한 번 더 준다
    [FINAL('last summer with my family')],
    'end',
  ]);
  assert.equal(result.committed, 'I went to the beach last summer with my family');
});

test('여러 번 끊겨도 말한 순서대로 이어진다', () => {
  const result = runSession([
    [FINAL('First of all')],
    'restart',
    [FINAL('I want to say')],
    'restart',
    [PENDING('that the park')],
    [FINAL('that the park is really nice')],
    'end',
  ]);
  assert.equal(result.committed, 'First of all I want to say that the park is really nice');
});

test('임시 문장은 확정된 문장과 섞이지 않는다', () => {
  const draft = collectTranscript([FINAL('I go there'), PENDING('every single')]);
  assert.equal(draft.committed, 'I go there');
  assert.equal(draft.interim, 'every single');
});

test('임시 문장도 누적해서 오면 겹침을 걷어낸다', () => {
  const draft = collectTranscript([PENDING('I go'), PENDING('I go there often')]);
  assert.equal(draft.interim, 'I go there often');
});

test('결과가 비어 있어도 안전하다', () => {
  assert.deepEqual(collectTranscript([]), { committed: '', interim: '' });
  assert.deepEqual(collectTranscript([FINAL('')]), { committed: '', interim: '' });
});

test('부분 겹침은 창 안에서만 본다', () => {
  const words = Array.from({ length: 40 }, (_, i) => `w${i}`);
  const base = words.join(' ');
  // 뒤 24단어가 그대로 다시 오면 창 끝까지 겹침으로 잡는다
  assert.equal(overlapWordCount(base, words.slice(16).concat('tail').join(' ')), 24);
  // 창을 넘는 부분 겹침은 놓친다. 길이 제한을 둔 대가다.
  assert.equal(overlapWordCount(base, words.slice(10).concat('tail').join(' ')), 0);
});

test('아주 긴 발화도 통째로 품고 있으면 한 벌만 남는다', () => {
  const long = Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ');
  // 창(24단어)보다 길어도 포함 관계는 길이 제한 없이 잡는다
  assert.equal(mergeTranscript(long, long), long);
  assert.equal(mergeTranscript(long, `${long} and then some`), `${long} and then some`);
  assert.equal(mergeTranscript(`${long} and then some`, long), `${long} and then some`);
});
