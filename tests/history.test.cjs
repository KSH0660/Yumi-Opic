const test = require('node:test');
const assert = require('node:assert/strict');
const { historyTopicId, topicPracticeCounts, historyStampAt, formatHistoryStamp } = require('../.test-build/lib/history');
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

test('보여 줄 시각은 답변·피드백을 마지막으로 저장한 때다', () => {
  const finishedAt = new Date(2026, 8, 8, 14, 32).getTime();
  const updatedAt = new Date(2026, 8, 8, 16, 5).getTime();
  assert.equal(historyStampAt({ finishedAt }), finishedAt);
  assert.equal(historyStampAt({ finishedAt, updatedAt }), updatedAt);
});

test('저장 시각이 연습보다 앞서면 연습을 마친 시각을 쓴다', () => {
  const finishedAt = new Date(2026, 8, 8, 14, 32).getTime();
  assert.equal(historyStampAt({ finishedAt, updatedAt: finishedAt - 60_000 }), finishedAt);
});

test('같은 날 여러 번 연습해도 분까지 적어 회차를 구분한다', () => {
  const morning = formatHistoryStamp({ finishedAt: new Date(2026, 8, 8, 9, 7).getTime() });
  const evening = formatHistoryStamp({ finishedAt: new Date(2026, 8, 8, 21, 40).getTime() });
  assert.match(morning, /09:07$/);
  assert.match(evening, /21:40$/);
  assert.notEqual(morning, evening);
  // 자정은 24시가 아니라 00시로 적는다.
  assert.match(formatHistoryStamp({ finishedAt: new Date(2026, 8, 8, 0, 5).getTime() }), /00:05$/);
});
