const test = require('node:test');
const assert = require('node:assert/strict');
const form = require('../.test-build/data/survey-form');
const bank = require('../.test-build/data/survey-bank');

test('실제 오픽 서베이 8문항의 순서와 선택지 개수를 그대로 옮긴다', () => {
  assert.deepEqual(form.surveyFormQuestions.map(question => question.number), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(form.surveyFormQuestions.map(question => question.kind),
    ['single', 'single', 'single', 'single', 'multi', 'multi', 'multi', 'multi']);
  assert.deepEqual(form.surveyFormQuestions.map(question => question.choices.length), [4, 2, 4, 5, 26, 14, 24, 5]);
  assert.deepEqual([...new Set(form.surveyFormQuestions.map(question => question.section))],
    ['직업 관련', '거주지 관련', '여가 활동 관련']);
});

test('선택지 ID는 서로 겹치지 않는다', () => {
  const ids = form.surveyFormChoices.map(choice => choice.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('문제은행이 있는 주제마다 서베이 선택지가 하나씩 있다', () => {
  const linked = form.surveyFormChoices.filter(choice => choice.topicId).map(choice => choice.topicId);
  assert.equal(new Set(linked).size, linked.length);
  assert.deepEqual([...linked].sort(), [...bank.DEFAULT_SURVEY_IDS].sort());
  for (const topicId of linked) assert.ok(bank.surveyTopicById.has(topicId), `${topicId} 주제가 문제은행에 없다`);
});

test('선택지와 주제를 서로 바꿔도 문제은행에 있는 주제만 남는다', () => {
  assert.deepEqual(form.topicIdsForChoices(['housing-alone', 'leisure-park', 'hobby-music']), ['home', 'park', 'music']);
  // 문제은행이 없는 항목과 모르는 ID 는 주제로 이어지지 않는다.
  assert.deepEqual(form.topicIdsForChoices(['housing-dorm', 'sport-yoga', 'unknown']), []);
  assert.deepEqual(form.choiceIdsForTopics(['gym', 'staycation']), ['sport-gym', 'vacation-home']);
  assert.deepEqual(form.choiceIdsForTopics(['unknown']), []);
});

test('기본 선택은 업무·학업을 피하고 문제은행이 있는 항목을 모두 켠다', () => {
  assert.deepEqual(form.topicIdsForChoices(form.DEFAULT_SURVEY_CHOICE_IDS).sort(), [...bank.DEFAULT_SURVEY_IDS].sort());
  for (const id of form.DEFAULT_SINGLE_CHOICE_IDS) assert.ok(form.DEFAULT_SURVEY_CHOICE_IDS.includes(id));
  assert.deepEqual(form.DEFAULT_SINGLE_CHOICE_IDS, ['job-none', 'student-no', 'course-lapsed']);
  assert.equal(new Set(form.DEFAULT_SURVEY_CHOICE_IDS).size, form.DEFAULT_SURVEY_CHOICE_IDS.length);
});

test('실제 시험의 합산 기준과 모의고사 최소 주제 수를 한곳에서 관리한다', () => {
  assert.equal(form.OFFICIAL_MIN_CHOICES, 12);
  assert.equal(form.MIN_PRACTICE_TOPICS, 3);
});
