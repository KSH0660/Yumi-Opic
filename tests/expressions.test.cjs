const test = require('node:test');
const assert = require('node:assert/strict');
const expressions = require('../.test-build/lib/expressions');
const KEY = 'yumi-opic:expressions';

const context = { questionId: 'gym-routine-1', questionEn: 'Tell me about your gym routine.', topicId: 'gym', topicKo: '헬스' };
const feedback = {
  overall: '흐름이 자연스럽습니다.',
  structure: { topic: 'good', detail: 'needs_work', feeling: 'good', note: '루틴 예시를 더 넣어 보세요.' },
  pronunciationBasis: 'browser_only',
  items: [{ category: 'storytelling', title: '루틴 변화 과정을 더 선명하게', message: '한 문장을 넣어 보세요.', example: 'Now, I go three times a week.' }],
};

function withStorage(run) {
  const previous = global.window;
  const data = new Map();
  global.window = { localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  } };
  try { run(data); } finally {
    if (previous === undefined) delete global.window;
    else global.window = previous;
  }
}

test('피드백 항목을 저장하고 같은 버튼으로 해제한다', () => withStorage(() => {
  const draft = expressions.expressionFromFeedbackItem(feedback.items[0], context);
  const saved = expressions.toggleExpression(draft, 10);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, expressions.draftId(draft));
  assert.equal(saved[0].example, 'Now, I go three times a week.');
  assert.equal(saved[0].category, 'storytelling');
  assert.deepEqual(expressions.loadExpressions(), saved);

  assert.deepEqual(expressions.toggleExpression(draft, 20), []);
  assert.deepEqual(expressions.loadExpressions(), []);
}));

test('같은 문항의 같은 조언은 공백이나 대소문자가 달라도 한 번만 저장한다', () => withStorage(() => {
  const draft = expressions.expressionFromFeedbackItem(feedback.items[0], context);
  const sameAgain = { ...draft, title: `  ${draft.title.toUpperCase()} `, example: `${draft.example}  ` };
  expressions.toggleExpression(draft, 10);
  assert.deepEqual(expressions.toggleExpression(sameAgain, 20), []);
}));

test('총평은 흐름 메모까지 한 장으로 저장한다', () => withStorage(() => {
  const [saved] = expressions.toggleExpression(expressions.expressionFromOverall(feedback, context), 10);
  assert.equal(saved.title, '총평');
  assert.equal(saved.body, '흐름이 자연스럽습니다. 루틴 예시를 더 넣어 보세요.');
  assert.equal(saved.example, '');
  assert.equal(saved.category, undefined);
}));

test('최근에 저장한 것을 먼저 돌려주고 깨진 값은 버린다', () => withStorage((data) => {
  data.set(KEY, JSON.stringify([
    { ...context, id: 'a', title: '오래된 것', body: '', example: '', savedAt: 1 },
    { ...context, id: 'b', title: '새 것', body: '', example: '', savedAt: 5 },
    { ...context, id: 'b', title: '같은 키', body: '', example: '', savedAt: 9 },
    { ...context, id: 'c', title: '시각 없음', body: '', example: '' },
    { nope: true },
  ]));
  assert.deepEqual(expressions.loadExpressions().map((entry) => entry.title), ['새 것', '오래된 것']);
}));

test('저장한 값이 배열이 아니거나 JSON이 깨져도 빈 목록으로 시작한다', () => withStorage((data) => {
  data.set(KEY, '{"not":"an array"}');
  assert.deepEqual(expressions.loadExpressions(), []);
  data.set(KEY, '{{{');
  assert.deepEqual(expressions.loadExpressions(), []);
}));

test('연습 화면에서는 이 문항 것과 같은 주제의 다른 문항 것을 나눠 본다', () => withStorage(() => {
  const other = { ...context, questionId: 'gym-experience-1' };
  const away = { ...context, questionId: 'trip-1', topicId: 'travel', topicKo: '해외여행' };
  expressions.toggleExpression(expressions.expressionFromFeedbackItem(feedback.items[0], context), 10);
  expressions.toggleExpression(expressions.expressionFromFeedbackItem(feedback.items[0], other), 20);
  expressions.toggleExpression(expressions.expressionFromFeedbackItem(feedback.items[0], away), 30);

  const shown = expressions.expressionsForQuestion(expressions.loadExpressions(), context.questionId, context.topicId);
  assert.deepEqual(shown.thisQuestion.map((entry) => entry.questionId), ['gym-routine-1']);
  assert.deepEqual(shown.sameTopic.map((entry) => entry.questionId), ['gym-experience-1']);
}));

test('하나만 지우거나 전부 비울 수 있다', () => withStorage(() => {
  const draft = expressions.expressionFromFeedbackItem(feedback.items[0], context);
  const overall = expressions.expressionFromOverall(feedback, context);
  expressions.toggleExpression(draft, 10);
  expressions.toggleExpression(overall, 20);
  assert.equal(expressions.loadExpressions().length, 2);

  assert.deepEqual(expressions.removeExpression(expressions.draftId(overall)).map((entry) => entry.id), [expressions.draftId(draft)]);
  expressions.clearExpressions();
  assert.deepEqual(expressions.loadExpressions(), []);
}));

test('저장 공간이 막히면 사람이 읽을 수 있는 오류를 낸다', () => withStorage(() => {
  global.window.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(
    () => expressions.toggleExpression(expressions.expressionFromOverall(feedback, context), 10),
    /표현을 저장하지 못했습니다/,
  );
}));
