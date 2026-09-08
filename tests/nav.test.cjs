const test = require('node:test');
const assert = require('node:assert/strict');
const { examExitLink, nextPracticeLink, repeatPracticeLink } = require('../.test-build/lib/nav');
const { buildPracticeExam } = require('../.test-build/lib/exam');
const { allTopics } = require('../.test-build/data');

const jogging = allTopics.find(topic => topic.id === 'jogging') ?? allTopics[0];

function entry(overrides) {
  return { id: 'a', finishedAt: 1, mode: 'practice', label: `주제별 연습 · ${jogging.ko}`, answered: 1, totalItems: 15, ...overrides };
}

test('연습 화면은 홈이 아니라 그 연습을 고른 목록으로 나간다', () => {
  assert.deepEqual(examExitLink('practice'), { href: '/topics', label: '← 주제별 연습' });
  assert.deepEqual(examExitLink('single'), { href: '/topics', label: '← 주제별 연습' });
  assert.deepEqual(examExitLink('full'), { href: '/exam?mode=full', label: '← 실전 모의고사' });
});

test('결과 화면의 다음 행동은 늘 주제 목록으로 이어진다', () => {
  for (const mode of ['practice', 'single', 'full']) {
    assert.equal(nextPracticeLink(mode).href, '/topics');
  }
});

test('마지막 주제별 연습은 같은 주제로 다시 시작한다', () => {
  const exam = buildPracticeExam(jogging, () => 0);
  const link = repeatPracticeLink(entry({ label: '이름이 바뀐 라벨', result: { exam, answers: {}, times: {}, hintUse: {}, replays: {}, feedback: {} } }), allTopics);
  assert.equal(link.href, `/exam?mode=practice&topic=${encodeURIComponent(jogging.id)}`);
  assert.ok(link.label.includes(jogging.ko));
});

test('상세 결과가 없는 예전 기록도 라벨로 주제를 되짚는다', () => {
  assert.equal(repeatPracticeLink(entry(), allTopics).href, `/exam?mode=practice&topic=${encodeURIComponent(jogging.id)}`);
});

test('주제를 알 수 없는 주제별 기록은 링크를 만들지 않는다', () => {
  assert.equal(repeatPracticeLink(entry({ label: '주제별 연습 · 사라진 주제' }), allTopics), undefined);
});

test('모의고사와 1문제 연습은 주제 없이 같은 모드로 다시 시작한다', () => {
  assert.equal(repeatPracticeLink(entry({ mode: 'full', label: '실전 모의고사' }), allTopics).href, '/exam?mode=full');
  assert.equal(repeatPracticeLink(entry({ mode: 'single', label: '1문제 연습' }), allTopics).href, '/exam?mode=single');
});

test('주제 ID 에 특수문자가 있어도 링크가 깨지지 않는다', () => {
  const odd = { id: 'a/b?c', ko: '이상한 주제', emoji: '🌀' };
  const link = repeatPracticeLink(entry({ label: '주제별 연습 · 이상한 주제' }), [odd]);
  assert.equal(link.href, '/exam?mode=practice&topic=a%2Fb%3Fc');
});
