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

/* ── 표시 등급 ────────────────────────────────────────────────────
 * 고칠 점이 인용해 온 After 의 한 조각으로 진한 등급과 연한 등급을 가른다.
 */

const marks = (pieces) => pieces
  .filter((piece) => piece.changed)
  .map((piece) => [piece.text, piece.tier, piece.itemNumber]);

const BEFORE = 'I go to the gym every day and it is good.';
const AFTER = 'I go to the gym every single day and it is really good.';

test('고칠 점이 인용한 자리만 진한 등급이 된다', () => {
  const diff = diffAnswers(BEFORE, AFTER, ['every single day']);
  assert.deepEqual(marks(diff.after), [['single', 'item', 1], ['really', 'fluency', undefined]]);
  assert.equal(diff.itemChanges, 1);
  assert.equal(diff.fluencyChanges, 1);
  assert.equal(diff.changes, 2);
  assert.deepEqual(diff.locatedItems, [1]);
});

test('빈 인용문은 번호를 차지하지 않는다', () => {
  const diff = diffAnswers(BEFORE, AFTER, ['', 'every single day']);
  assert.deepEqual(marks(diff.after), [['single', 'item', 2], ['really', 'fluency', undefined]]);
  assert.deepEqual(diff.locatedItems, [2]);
});

test('인용문을 못 찾으면 조용히 연한 등급으로 남는다', () => {
  const diff = diffAnswers(BEFORE, AFTER, ['something the answer never says']);
  assert.deepEqual(diff.locatedItems, []);
  assert.equal(diff.itemChanges, 0);
  assert.equal(diff.fluencyChanges, 2);
  assert.ok(diff.after.filter((piece) => piece.changed).every((piece) => piece.tier === 'fluency'));
});

test('인용문이 바뀐 단어를 하나도 품지 않으면 칠할 것이 없다', () => {
  const diff = diffAnswers(BEFORE, AFTER, ['I go to the gym']);
  assert.deepEqual(diff.locatedItems, []);
  assert.equal(diff.itemChanges, 0);
  assert.equal(diff.fluencyChanges, 2);
});

test('인용문이 없는 예전 피드백은 바뀐 곳을 모두 진한 등급으로 둔다', () => {
  const diff = diffAnswers(BEFORE, AFTER);
  assert.deepEqual(marks(diff.after), [['single', 'item', undefined], ['really', 'item', undefined]]);
  assert.equal(diff.itemChanges, 2);
  assert.equal(diff.fluencyChanges, 0);
  assert.deepEqual(diff.locatedItems, []);
});

test('같은 말이 여러 번 나오면 바뀐 단어를 품은 자리를 고른다', () => {
  const diff = diffAnswers(
    'I like the big park and the park.',
    'I like the big park and the big park.',
    ['the big park'],
  );
  assert.deepEqual(marks(diff.after), [['big', 'item', 1]]);
  assert.deepEqual(diff.locatedItems, [1]);
});

test('Before 에서 뺀 말도 같은 곳이면 같은 등급을 받는다', () => {
  const diff = diffAnswers(
    'It is good for me. I feel refreshed.',
    'What is really nice is that it clears my head. I feel refreshed.',
    ['What is really nice is that it clears my head'],
  );
  assert.ok(marks(diff.before).every(([, tier, item]) => tier === 'item' && item === 1));
  assert.ok(marks(diff.after).every(([, tier, item]) => tier === 'item' && item === 1));
  assert.equal(diff.fluencyChanges, 0);
});

test('등급을 나눠도 텍스트는 한 글자도 잃지 않는다', () => {
  const diff = diffAnswers(BEFORE, AFTER, ['every single day']);
  assert.equal(joined(diff.before), BEFORE);
  assert.equal(joined(diff.after), AFTER);
});

test('말을 빼기만 한 고칠 점도 인용문으로 자리를 찾는다', () => {
  // 되풀이한 "So" 를 지우면 뒤따르는 "after that" 은 글자 하나 안 바뀐다.
  const diff = diffAnswers(
    'So after that I come home.',
    'After that, I come home.',
    ['After that,'],
  );
  assert.deepEqual(diff.locatedItems, [1]);
  assert.equal(diff.itemChanges, 1);
  assert.equal(diff.fluencyChanges, 0);
  assert.deepEqual(marks(diff.before), [['So', 'item', 1]]);
});

test('인용문이 그대로인데 옆이 새로 넣은 말뿐이면 번호를 붙이지 않는다', () => {
  // 말을 뺀 자리만 이 항목의 몫으로 본다. 새로 넣은 말은 이 항목이 인용하지 않았으니
  // 다른 항목이나 다듬기의 것이고, 거기에 번호를 붙이면 엉뚱한 자리를 가리킨다.
  const diff = diffAnswers('I come home.', 'After work, I come home.', ['I come home.']);
  assert.deepEqual(diff.locatedItems, []);
  assert.equal(diff.itemChanges, 0);
  assert.equal(diff.fluencyChanges, 1);
});
