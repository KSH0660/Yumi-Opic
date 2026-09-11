const test = require('node:test');
const assert = require('node:assert/strict');
const { collectTranscript, joinTranscript } = require('../.test-build/lib/transcript');

/**
 * 라이브러리(startDictation)가 하는 접기 과정을 그대로 흉내 낸다.
 *  - onresult 마다 results 전체를 다시 읽는다
 *  - 인식이 끊기면 지금까지의 결과를 settled 로 접고 인덱스를 0부터 다시 센다
 */
function runSession(events) {
  let settled = '';
  let chunks = [];
  let last = { committed: '', interim: '' };
  for (const event of events) {
    if (event === 'restart' || event === 'end') {
      settled = joinTranscript(settled, collectTranscript(chunks).committed);
      chunks = [];
      last = { committed: settled, interim: '' };
      continue;
    }
    chunks = event.map((c) => ({ isFinal: !!c.isFinal, transcript: c.transcript }));
    const draft = collectTranscript(chunks);
    last = { committed: joinTranscript(settled, draft.committed), interim: draft.interim };
  }
  return last;
}

const FINAL = (transcript) => ({ isFinal: true, transcript });
const PENDING = (transcript) => ({ isFinal: false, transcript });

test('띄어쓰기 하나로 잇는다', () => {
  assert.equal(joinTranscript('I go to the gym', 'every morning'), 'I go to the gym every morning');
  assert.equal(joinTranscript('', 'hello there'), 'hello there');
  assert.equal(joinTranscript('hello there', ''), 'hello there');
  assert.equal(joinTranscript('  ', '  '), '');
  assert.equal(joinTranscript('I run  ', '  a lot'), 'I run a lot');
  // 크롬은 두 번째 조각부터 앞에 공백을 붙여 보낸다
  assert.equal(joinTranscript('I run', ' a lot'), 'I run a lot');
});

test('데스크톱: 한 세션 안의 조각을 순서대로 잇는다', () => {
  const result = runSession([
    [FINAL('I usually go jogging')],
    [FINAL('I usually go jogging'), PENDING(' in the')],
    [FINAL('I usually go jogging'), FINAL(' in the evening')],
    // 같은 결과가 다시 와도 늘어나지 않는다
    [FINAL('I usually go jogging'), FINAL(' in the evening')],
  ]);
  assert.equal(result.committed, 'I usually go jogging in the evening');
  assert.equal(result.interim, '');
});

test('휴대폰: 발화마다 세션이 끝나도 말한 내용이 한 번씩 순서대로 남는다', () => {
  // continuous 를 끈 세션: 가설은 interim 한 칸을 계속 고쳐 쓰고 final 은 끝에 한 번
  const result = runSession([
    [PENDING('I')],
    [PENDING('I goat')],
    [PENDING('I go to the gym')],
    [FINAL('I go to the gym')],
    'restart',
    [PENDING('on')],
    [PENDING('on weekends')],
    [FINAL('on weekends')],
    'end',
  ]);
  assert.equal(result.committed, 'I go to the gym on weekends');
  assert.equal(result.interim, '');
});

test('인식 중인 문장은 확정되기 전까지 임시로만 보인다', () => {
  const result = runSession([
    [FINAL('First of all')],
    'restart',
    [PENDING('I want')],
    [PENDING('I want to say')],
  ]);
  assert.deepEqual(result, { committed: 'First of all', interim: 'I want to say' });
});

test('임시 문장은 확정된 문장과 섞이지 않는다', () => {
  const draft = collectTranscript([FINAL('I go there'), PENDING(' every single')]);
  assert.equal(draft.committed, 'I go there');
  assert.equal(draft.interim, 'every single');
});

test('사용자가 실제로 되풀이한 말은 지우지 않는다', () => {
  assert.equal(joinTranscript('I like it', 'it was fun'), 'I like it it was fun');
  assert.equal(joinTranscript('very', 'very good'), 'very very good');
  assert.equal(joinTranscript('I go to the gym', 'to the gym every day'), 'I go to the gym to the gym every day');
  const result = runSession([
    [FINAL('It was really fun')],
    'restart',
    [FINAL('It was really fun')],
    'end',
  ]);
  assert.equal(result.committed, 'It was really fun It was really fun');
});

test('결과가 비어 있어도 안전하다', () => {
  assert.deepEqual(collectTranscript([]), { committed: '', interim: '' });
  assert.deepEqual(collectTranscript([FINAL('')]), { committed: '', interim: '' });
  assert.deepEqual(runSession(['restart', 'end']), { committed: '', interim: '' });
});
