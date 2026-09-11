const test = require('node:test');
const assert = require('node:assert/strict');
const { diffAnswers } = require('../.test-build/lib/answerDiff');

const changed = (pieces) => pieces.filter((piece) => piece.changed).map((piece) => piece.text);
const joined = (pieces) => pieces.map((piece) => piece.text).join('');

test('같은 답변이면 칠할 곳이 없다', () => {
  const diff = diffAnswers('I go to the gym every day.', 'I go to the gym every day.');
  assert.equal(diff.changes, 0);
  assert.deepEqual(changed(diff.before), []);
  assert.deepEqual(changed(diff.after), []);
});

test('대소문자와 문장부호만 다르면 바뀐 것으로 치지 않는다', () => {
  const diff = diffAnswers('i go to the gym every day', 'I go to the gym, every day.');
  assert.equal(diff.changes, 0);
  assert.deepEqual(changed(diff.after), []);
});

test('양쪽 모두 원래 텍스트를 한 글자도 잃지 않고 조각낸다', () => {
  const before = 'Well, I usually go jogging.\nIt was fun!';
  const after = 'I usually go jogging in the park near my house. It was really fun!';
  const diff = diffAnswers(before, after);
  assert.equal(joined(diff.before), before);
  assert.equal(joined(diff.after), after);
});

test('바꾼 단어는 Before 에, 새로 넣은 단어는 After 에 칠한다', () => {
  const diff = diffAnswers('I go to park yesterday.', 'I went to the park yesterday.');
  assert.deepEqual(changed(diff.before), ['go']);
  assert.deepEqual(changed(diff.after), ['went', 'the']);
  assert.equal(diff.changes, 2);
});

test('붙어서 새로 넣은 여러 단어는 띄어쓰기까지 한 덩어리로 칠한다', () => {
  const diff = diffAnswers('I like it.', 'I really like it a lot.');
  assert.deepEqual(changed(diff.after), ['really', 'a lot']);
  assert.deepEqual(changed(diff.before), []);
  assert.equal(diff.changes, 2);
});

test('앞에 두괄식 문장을 더하면 한 곳을 고친 것으로 센다', () => {
  const diff = diffAnswers(
    'So last year I went to Jeju with my family.',
    'My favorite trip was to Jeju. So last year I went to Jeju with my family.',
  );
  assert.equal(diff.changes, 1);
  // 바뀐 말과 그대로 둔 말 사이의 문장부호는 칠하지 않는다.
  assert.deepEqual(changed(diff.after), ['My favorite trip was to Jeju']);
});

test('빼기만 한 곳도 한 곳으로 센다', () => {
  const diff = diffAnswers('I think I think it was fun.', 'I think it was fun.');
  assert.equal(diff.changes, 1);
  assert.deepEqual(changed(diff.before), ['I think']);
});

test('아주 긴 답변도 멈추지 않고 비교한다', () => {
  const words = Array.from({ length: 3000 }, (_, index) => `w${index}`);
  const before = words.join(' ');
  const after = [...words].reverse().join(' ');
  const diff = diffAnswers(before, after);
  assert.equal(joined(diff.before), before);
  assert.equal(joined(diff.after), after);
  assert.ok(diff.changes >= 1);
});
