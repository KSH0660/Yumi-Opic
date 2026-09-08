const test = require('node:test');
const assert = require('node:assert/strict');
const { hasAnswerText, summarizeAnswers, defaultResultFilter, filterItemsByAnswer, applyAnswerRewrites, sameSpokenText } = require('../.test-build/lib/answers');

test('답변 유무는 텍스트의 공백을 제거한 뒤 판단한다', () => {
  for (const text of [undefined, '', ' \n\t ', '\u00a0']) assert.equal(hasAnswerText(text), false);
  assert.equal(hasAnswerText(' I love music. '), true);
});

test('빈 답변과 건너뛴 문항은 평균 및 시간·힌트·재청취 집계에서 제외한다', () => {
  const stats = summarizeAnswers(
    [{ slot: 2 }, { slot: 5 }, { slot: 8 }, { slot: 11 }],
    { 2: 'I love music.', 5: ' \n\t ', 8: 'Music helps me relax.', 99: 'Not in this exam.' },
    { 2: 30, 5: 120, 8: 40, 11: 200, 99: 999 },
    { 2: 1, 5: 8, 8: 2, 11: 9 },
    { 2: 1, 5: 5, 8: 0, 11: 6 },
  );
  assert.deepEqual(stats, {
    answeredSlots: [2, 8], answeredCount: 2, skippedCount: 2,
    totalWords: 7, averageWords: 3.5, uniqueWords: 6, totalSentences: 2,
    totalTime: 70, totalHints: 3, totalReplays: 1,
  });
});

test('아무 답변도 없으면 평균은 없고 모든 답변 통계는 0이다', () => {
  const stats = summarizeAnswers([{ slot: 1 }, { slot: 2 }], { 1: ' ' }, { 1: 60, 2: 90 }, { 1: 4 }, { 2: 1 });
  assert.deepEqual(stats, {
    answeredSlots: [], answeredCount: 0, skippedCount: 2,
    totalWords: 0, averageWords: null, uniqueWords: 0, totalSentences: 0,
    totalTime: 0, totalHints: 0, totalReplays: 0,
  });
  assert.equal(summarizeAnswers([], {}).averageWords, null);
});

test('결과 화면 기본 보기는 답변과 미답변이 섞였을 때만 답변한 문항만 보여 준다', () => {
  assert.equal(defaultResultFilter(3, 15), 'answered');
  assert.equal(defaultResultFilter(15, 15), 'all');
  assert.equal(defaultResultFilter(0, 15), 'all');
  assert.equal(defaultResultFilter(0, 0), 'all');
});

test('답변한 문항만 보기는 빈 답변을 걸러 내고 전체 보기는 순서를 그대로 둔다', () => {
  const items = [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }];
  const answers = { 1: 'I love music.', 2: ' \n\t ', 4: 'Walking helps me relax.' };
  assert.deepEqual(filterItemsByAnswer(items, answers, 'answered'), [{ slot: 1 }, { slot: 4 }]);
  assert.deepEqual(filterItemsByAnswer(items, answers, 'all'), items);
  assert.deepEqual(filterItemsByAnswer(items, {}, 'answered'), []);
});

test('바꿔 쓴 답변만 덮고 빈 텍스트는 답변을 지우지 않는다', () => {
  const answers = { 2: 'I like running.', 5: 'I go to the gym.' };
  assert.deepEqual(applyAnswerRewrites(answers, {}), answers);
  assert.deepEqual(applyAnswerRewrites(answers, { 2: 'I like jogging.' }),
    { 2: 'I like jogging.', 5: 'I go to the gym.' });
  assert.deepEqual(applyAnswerRewrites(answers, { 2: '  ' }), answers);
  // 원본은 그대로 둔다.
  assert.deepEqual(answers, { 2: 'I like running.', 5: 'I go to the gym.' });
});

test('대소문자·문장부호만 다른 받아쓰기는 같은 말로 본다', () => {
  assert.equal(sameSpokenText('I like running!', 'i like running'), true);
  assert.equal(sameSpokenText('I like running.', 'I like jogging.'), false);
  assert.equal(sameSpokenText('', '  '), true);
});
