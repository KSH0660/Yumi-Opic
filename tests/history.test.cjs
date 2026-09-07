const test = require('node:test');
const assert = require('node:assert/strict');
const { historyTopicId, topicPracticeCounts } = require('../.test-build/lib/history');
const { buildPracticeExam } = require('../.test-build/lib/exam');
const { allTopics } = require('../.test-build/data');

const jogging = allTopics.find(topic => topic.id === 'jogging') ?? allTopics[0];
const other = allTopics.find(topic => topic.id !== jogging.id);

function entry(overrides) {
  return { id: 'a', finishedAt: 1, mode: 'practice', label: `주제별 연습 · ${jogging.ko}`, answered: 1, totalItems: 15, ...overrides };
}

test('저장된 시험의 focusTopicId 로 주제를 찾는다', () => {
  const exam = buildPracticeExam(jogging, () => 0);
  const saved = entry({ label: '이름이 바뀐 라벨', result: { exam, answers: {}, times: {}, hintUse: {}, replays: {}, feedback: {} } });
  assert.equal(historyTopicId(saved, allTopics), jogging.id);
});

test('상세 결과가 없는 예전 기록은 라벨로 주제를 되짚는다', () => {
  assert.equal(historyTopicId(entry(), allTopics), jogging.id);
});

test('주제별 연습이 아닌 기록과 모르는 주제는 세지 않는다', () => {
  assert.equal(historyTopicId(entry({ mode: 'full', label: '실전 모의고사' }), allTopics), undefined);
  assert.equal(historyTopicId(entry({ mode: 'single', label: '1문제 연습' }), allTopics), undefined);
  assert.equal(historyTopicId(entry({ label: '주제별 연습 · 없는 주제' }), allTopics), undefined);
});

test('주제별 연습 횟수를 센다', () => {
  const counts = topicPracticeCounts([
    entry({ id: '1' }),
    entry({ id: '2' }),
    entry({ id: '3', label: `주제별 연습 · ${other.ko}` }),
    entry({ id: '4', mode: 'full', label: '실전 모의고사' }),
  ], allTopics);
  assert.deepEqual(counts, { [jogging.id]: 2, [other.id]: 1 });
});
