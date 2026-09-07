const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../.test-build/data/survey-bank');
const engine = require('../.test-build/lib/exam');

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const ids = (items) => items.map((x) => x.question.id);

test('survey bank contains only the 11 selected topics and 88 questions', () => {
  assert.equal(bank.surveyTopics.length, 11);
  assert.equal(bank.surveyQuestionCount, 88);
  assert.deepEqual(bank.DEFAULT_SURVEY_IDS, ['home','music','beach','park','concert','shopping','jogging','walking','gym','staycation','overseas']);
  for (const topic of bank.surveyTopics) {
    assert.equal(topic.category, 'survey');
    assert.equal(topic.questions.length, 8);
    assert.equal(topic.questions.filter((q) => q.type === 'description').length, 2);
    assert.equal(topic.questions.filter((q) => q.type === 'routine').length, 1);
    assert.equal(topic.questions.filter((q) => q.type === 'experience').length, 2);
    assert.equal(topic.questions.filter((q) => q.type === 'memorable').length, 1);
    assert.equal(topic.questions.filter((q) => q.type === 'comparison').length, 1);
    assert.equal(topic.questions.filter((q) => q.type === 'issue').length, 1);
  }
});

test('topic practice always returns one question from each of the six training types', () => {
  for (const topic of bank.surveyTopics) {
    const exam = engine.buildPracticeExam(topic, 6, seeded(7));
    assert.equal(exam.items.length, 6);
    assert.deepEqual(exam.items.map((i) => i.question.type), ['description','routine','experience','memorable','comparison','issue']);
    assert.ok(exam.items.every((i) => i.topicId === topic.id));
  }
});

test('survey drill uses three selected topics and omits roleplay slots 11-13', () => {
  for (let seed = 0; seed < 1000; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: bank.DEFAULT_SURVEY_IDS, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [1,2,3,4,5,6,7,8,9,10,14,15]);
    assert.equal(new Set(ids(exam.items)).size, exam.items.length);
    assert.equal(exam.items.some((i) => [11,12,13].includes(i.slot)), false);
    assert.deepEqual(exam.items.filter((i) => [2,5,8].includes(i.slot)).map((i) => i.question.type), ['description','description','description']);
    assert.equal(exam.items.find((i) => i.slot === 3).question.type, 'routine');
    assert.deepEqual(exam.items.filter((i) => [4,6,9].includes(i.slot)).map((i) => i.question.type), ['experience','experience','experience']);
    assert.deepEqual(exam.items.filter((i) => [7,10].includes(i.slot)).map((i) => i.question.type), ['memorable','memorable']);
    assert.equal(exam.items.find((i) => i.slot === 14).question.type, 'comparison');
    assert.equal(exam.items.find((i) => i.slot === 15).question.type, 'issue');
  }
});

test('survey drill never substitutes unselected topics and requires at least three valid topics', () => {
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: [] }));
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: ['home','music'] }));
  for (let seed = 0; seed < 100; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: ['home','music','park'], includeIntro: false, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [2,3,4,5,6,7,8,9,10,14,15]);
    assert.ok(exam.items.every((i) => ['home','music','park'].includes(i.topicId)));
  }
});

test('single question mode reaches only active survey questions', () => {
  const allowed = new Set(bank.surveyTopics.flatMap((t) => t.questions.map((q) => q.id)));
  for (let seed = 0; seed < 500; seed++) {
    const exam = engine.buildSingleQuestion(bank.surveyTopics, seeded(seed));
    assert.equal(exam.items.length, 1);
    assert.ok(allowed.has(exam.items[0].question.id));
  }
  assert.throws(() => engine.buildSingleQuestion([]));
});
