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

test('survey bank contains the 11 selected topics', () => {
  assert.equal(bank.surveyTopics.length, 11);
  assert.deepEqual(bank.DEFAULT_SURVEY_IDS, ['home','music','beach','park','concert','shopping','jogging','walking','gym','staycation','overseas']);
  for (const topic of bank.surveyTopics) {
    assert.equal(topic.category, 'survey');
    assert.ok(topic.questions.some((q) => q.source === 'verified'));
  }
});

test('other topic practice uses actual slots 2-15 for one topic, without intro and with coherent roleplay', () => {
  const types = ['description', 'routine', 'experience', 'description', 'experience',
    'memorable', 'description', 'experience', 'memorable',
    'roleplay_ask', 'roleplay_problem', 'roleplay_experience', 'comparison', 'issue'];
  for (const topic of bank.surveyTopics.filter((topic) => topic.id !== 'staycation')) {
    for (let seed = 0; seed < 100; seed++) {
      const exam = engine.buildPracticeExam(topic, seeded(seed));
      assert.deepEqual(exam.items.map((item) => item.question.type), types);
      assert.deepEqual(exam.items.map((item) => item.slot), [2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
      assert.ok(exam.items.every((i) => i.topicId === topic.id));
      assert.equal(exam.focusTopicId, topic.id);
      for (const [index, item] of exam.items.entries()) {
        if (topic.questions.some((q) => q.type === item.question.type && q.source === 'verified')) {
          assert.equal(item.question.source, 'verified');
        }
        for (const dependency of item.question.dependsOn ?? []) {
          assert.ok(ids(exam.items.slice(0, index)).includes(dependency));
        }
      }
    }
    const first = engine.buildPracticeExam(topic, () => 0);
    const last = engine.buildPracticeExam(topic, () => 0.999);
    assert.notEqual(first.items[0].question.id, last.items[0].question.id);
  }
});

test('topic practice draws repeated types independently and allows duplicate questions', () => {
  const topic = bank.surveyTopics[0];
  let draw = 0;
  const exam = engine.buildPracticeExam(topic, () => [0, 0, 0, 0.999][draw++ % 4]);
  assert.equal(draw, 14);
  const descriptions = exam.items.filter((i) => [2,5,8].includes(i.slot));
  assert.deepEqual(ids(descriptions), ['home-d1', 'home-d2', 'home-d1']);
  const repeated = engine.buildPracticeExam(topic, () => 0);
  assert.equal(new Set(ids(repeated.items.filter((i) => [2,5,8].includes(i.slot)))).size, 1);
  assert.equal(repeated.items.length, 14);
});

test('topic practice rejects incomplete topics instead of renumbering slots', () => {
  const topic = bank.surveyTopics[0];
  const questions = topic.questions.filter((q) => q.type === 'description');
  assert.throws(() => engine.buildPracticeExam({ ...topic, questions }), /문항이 부족/);
  assert.throws(() => engine.buildPracticeExam({ ...topic, questions: [] }), /문항이 부족/);
});

test('survey drill includes a coherent roleplay set in slots 11-13', () => {
  for (let seed = 0; seed < 1000; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: bank.DEFAULT_SURVEY_IDS, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    assert.equal(new Set(ids(exam.items)).size, exam.items.length);
    assert.deepEqual(exam.items.filter((i) => [2,5,8].includes(i.slot)).map((i) => i.question.type), ['description','description','description']);
    assert.equal(exam.items.find((i) => i.slot === 3).question.type, 'routine');
    assert.deepEqual(exam.items.filter((i) => [4,6,9].includes(i.slot)).map((i) => i.question.type), ['experience','experience','experience']);
    assert.deepEqual(exam.items.filter((i) => [7,10].includes(i.slot)).map((i) => i.question.type), ['memorable','memorable']);

    const roleplay = exam.items.filter((i) => [11,12,13].includes(i.slot));
    assert.deepEqual(roleplay.map((i) => i.question.type), ['roleplay_ask','roleplay_problem','roleplay_experience']);
    assert.equal(new Set(roleplay.map((i) => i.topicId)).size, 1);
    assert.deepEqual(roleplay[1].question.dependsOn, [roleplay[0].question.id]);
    assert.deepEqual(roleplay[2].question.dependsOn, [roleplay[1].question.id]);

    assert.equal(exam.items.find((i) => i.slot === 14).question.type, 'comparison');
    assert.equal(exam.items.find((i) => i.slot === 15).question.type, 'issue');
  }
});

test('survey drill never substitutes unselected topics and requires at least three valid topics', () => {
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: [] }));
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: ['home','music'] }));
  for (let seed = 0; seed < 100; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: ['home','music','park'], includeIntro: false, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    assert.ok(exam.items.every((i) => ['home','music','park'].includes(i.topicId)));
  }
});

test('single question mode reaches only publicly reconstructed survey questions', () => {
  const allowed = new Set(bank.surveyTopics.flatMap((t) => t.questions.filter((q) => q.source === 'verified').map((q) => q.id)));
  for (let seed = 0; seed < 500; seed++) {
    const exam = engine.buildSingleQuestion(bank.surveyTopics, seeded(seed));
    assert.equal(exam.items.length, 1);
    assert.ok(allowed.has(exam.items[0].question.id));
    assert.equal(exam.items[0].question.source, 'verified');
  }
  assert.throws(() => engine.buildSingleQuestion([]));
});
