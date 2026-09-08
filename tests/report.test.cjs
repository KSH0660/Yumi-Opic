const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFeedbackReport, defaultReportScope, feedbackCount, parseReportIds, reportHref } = require('../.test-build/lib/report');
const { buildPracticeExam } = require('../.test-build/lib/exam');
const { allTopics } = require('../.test-build/data');

const topic = allTopics[0];
const feedback = {
  overall: '구체적인 경험이 잘 드러납니다.',
  structure: { topic: 'good', detail: 'good', feeling: 'needs_work', note: '감정을 덧붙여 보세요.' },
  pronunciationBasis: 'browser_only', items: [],
};

/** 앞의 두 문항만 답변하고, 그중 첫 문항에만 AI 피드백을 받은 회차. */
function entry(id, finishedAt) {
  const exam = buildPracticeExam(topic, () => 0);
  const [first, second] = exam.items;
  return {
    id, finishedAt, mode: 'practice', label: `주제별 연습 · ${topic.ko}`, answered: 2, totalItems: exam.items.length,
    result: {
      exam,
      answers: { [first.slot]: 'I go to the gym.', [second.slot]: 'It was fun.' },
      times: { [first.slot]: 40 }, hintUse: { [first.slot]: 1 }, replays: {},
      feedback: { [first.slot]: feedback },
    },
  };
}

const history = [entry('b', 200), entry('a', 100)];

test('빈 값과 중복을 걸러 최대 20개까지 읽는다', () => {
  assert.deepEqual(parseReportIds('a, b ,,a'), ['a', 'b']);
  assert.deepEqual(parseReportIds(null), []);
  assert.deepEqual(parseReportIds(''), []);
  assert.equal(parseReportIds(Array.from({ length: 30 }, (_, i) => `id${i}`).join(',')).length, 20);
});

test('모아보기 주소는 고른 기록을 그대로 담는다', () => {
  assert.equal(reportHref(['a', 'b']), '/report?ids=a%2Cb');
});

test('피드백 범위는 피드백을 받은 문항만 담는다', () => {
  const report = buildFeedbackReport(history, ['a', 'b'], 'feedback');
  assert.deepEqual(report.totals, { entries: 2, items: 2, feedback: 2 });
  assert.deepEqual(report.sections.map((section) => section.id), ['b', 'a']);
  assert.ok(report.sections.every((section) => section.items.every((item) => item.feedback)));
  assert.equal(report.sections[0].items[0].hints, 1);
  assert.equal(report.sections[0].items[0].elapsedSec, 40);
});

test('답변 범위는 피드백이 없는 답변까지 담는다', () => {
  const report = buildFeedbackReport(history, ['a'], 'answered');
  assert.deepEqual(report.totals, { entries: 1, items: 2, feedback: 1 });
  assert.equal(report.sections[0].items[1].feedback, undefined);
  assert.equal(report.sections[0].items[1].elapsedSec, 0);
});

test('고르지 않은 기록은 담지 않고 없는 기록은 따로 알려 준다', () => {
  const report = buildFeedbackReport(history, ['a', 'gone'], 'feedback');
  assert.deepEqual(report.sections.map((section) => section.id), ['a']);
  assert.deepEqual(report.missingIds, ['gone']);
});

test('담을 문항이 없는 회차는 그 이유를 남긴다', () => {
  const summaryOnly = { id: 'old', finishedAt: 1, mode: 'practice', label: '옛 기록', answered: 0, totalItems: 15 };
  const noFeedback = entry('c', 300);
  delete noFeedback.result.feedback[noFeedback.result.exam.items[0].slot];

  const report = buildFeedbackReport([summaryOnly, noFeedback], ['old', 'c'], 'feedback');
  assert.equal(report.sections[0].emptyReason, 'no-detail');
  assert.equal(report.sections[1].emptyReason, 'no-feedback');
  assert.deepEqual(report.totals, { entries: 2, items: 0, feedback: 0 });
});

test('피드백이 하나도 없으면 답변한 문항을 기본으로 보여 준다', () => {
  const noFeedback = entry('c', 300);
  noFeedback.result.feedback = {};
  assert.equal(defaultReportScope(history, ['a']), 'feedback');
  assert.equal(defaultReportScope([noFeedback], ['c']), 'answered');
});

test('목록에 보여 줄 피드백 개수를 센다', () => {
  assert.equal(feedbackCount(history[0]), 1);
  assert.equal(feedbackCount({ id: 'x', finishedAt: 1, mode: 'full', label: '요약만', answered: 0, totalItems: 15 }), 0);
});

test('다시 받아쓴 문항은 원래 브라우저 받아쓰기까지 담는다', () => {
  const rewritten = entry('c', 300);
  const [first, second] = rewritten.result.exam.items;
  rewritten.updatedAt = 400;
  rewritten.result.browserAnswers = { [first.slot]: 'I go to the gem.' };
  const section = buildFeedbackReport([rewritten], ['c'], 'answered').sections[0];
  assert.equal(section.updatedAt, 400);
  assert.equal(section.items[0].browserAnswer, 'I go to the gem.');
  assert.equal(Object.hasOwn(section.items[1], 'browserAnswer'), false, `${second.slot}번은 바꿔 쓰지 않았다`);
});

test('바꿔 쓰지 않은 회차에는 원본 받아쓰기와 업데이트 시각이 없다', () => {
  const section = buildFeedbackReport(history, ['a'], 'answered').sections[0];
  assert.equal(Object.hasOwn(section, 'updatedAt'), false);
  assert.equal(section.items.every((item) => !Object.hasOwn(item, 'browserAnswer')), true);
});
