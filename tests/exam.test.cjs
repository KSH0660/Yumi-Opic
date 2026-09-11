const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../.test-build/data/survey-bank');
const data = require('../.test-build/data');
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

const EXCLUDED = ['walking', 'concert', 'jogging'];

test('full exam uses two survey sets, a surprise set in 8-10 and a coherent roleplay set in 11-13', () => {
  const surpriseById = new Map(data.surpriseTopics.map((t) => [t.id, t]));
  for (let seed = 0; seed < 1000; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: bank.DEFAULT_SURVEY_IDS, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    assert.equal(new Set(ids(exam.items)).size, exam.items.length);
    assert.deepEqual(exam.items.filter((i) => [2,5].includes(i.slot)).map((i) => i.question.type), ['description','description']);
    assert.equal(exam.items.find((i) => i.slot === 3).question.type, 'routine');
    assert.deepEqual(exam.items.filter((i) => [4,6].includes(i.slot)).map((i) => i.question.type), ['experience','experience']);
    assert.equal(exam.items.find((i) => i.slot === 7).question.type, 'memorable');
    const setA = exam.items.filter((i) => [2,3,4].includes(i.slot));
    const setB = exam.items.filter((i) => [5,6,7].includes(i.slot));
    assert.equal(new Set(setA.map((i) => i.topicId)).size, 1);
    assert.equal(new Set(setB.map((i) => i.topicId)).size, 1);
    assert.notEqual(setA[0].topicId, setB[0].topicId);

    const surprise = exam.items.filter((i) => [8,9,10].includes(i.slot));
    assert.equal(new Set(surprise.map((i) => i.topicId)).size, 1);
    const topic = surpriseById.get(surprise[0].topicId);
    assert.ok(topic, `slot 8 must come from a surprise topic, got ${surprise[0].topicId}`);
    assert.equal(surprise[0].question.id, topic.questions[0].id);
    const order = surprise.map((i) => topic.questions.findIndex((q) => q.id === i.question.id));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    for (const [index, item] of surprise.entries()) {
      assert.ok(!['comparison', 'issue'].includes(item.question.type));
      assert.doesNotMatch(item.typeLabel, /번/);
      for (const dependency of item.question.dependsOn ?? []) {
        assert.ok(ids(surprise.slice(0, index)).includes(dependency));
      }
    }
    assert.ok(exam.items.every((i) => !EXCLUDED.includes(i.topicId)));

    const roleplay = exam.items.filter((i) => [11,12,13].includes(i.slot));
    assert.deepEqual(roleplay.map((i) => i.question.type), ['roleplay_ask','roleplay_problem','roleplay_experience']);
    assert.equal(new Set(roleplay.map((i) => i.topicId)).size, 1);
    assert.deepEqual(roleplay[1].question.dependsOn, [roleplay[0].question.id]);
    assert.deepEqual(roleplay[2].question.dependsOn, [roleplay[1].question.id]);

    assert.equal(exam.items.find((i) => i.slot === 14).question.type, 'comparison');
    assert.equal(exam.items.find((i) => i.slot === 15).question.type, 'issue');
  }
});

test('full exam never substitutes unselected survey topics and requires at least three valid topics', () => {
  const surpriseIds = data.surpriseTopics.map((t) => t.id);
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: [] }));
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: ['home','music'] }));
  for (let seed = 0; seed < 100; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: ['home','music','park'], includeIntro: false, rng: seeded(seed) });
    assert.deepEqual(exam.items.map((i) => i.slot), [2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    for (const item of exam.items) {
      const allowed = [8,9,10].includes(item.slot) ? surpriseIds : ['home','music','park'];
      assert.ok(allowed.includes(item.topicId), `slot ${item.slot}: ${item.topicId}`);
    }
  }
});

test('walking, concert and jogging never appear in the full exam even when selected', () => {
  assert.deepEqual(engine.drawableSurveyTopics.map((t) => t.id), bank.DEFAULT_SURVEY_IDS.filter((id) => !EXCLUDED.includes(id)));
  // 제외 주제만 남으면 세트를 만들 주제가 모자라 모의고사를 만들지 않는다.
  assert.throws(() => engine.buildFullExam({ enabledSurveyIds: [...EXCLUDED, 'home', 'music'] }), /3개 이상/);
  for (let seed = 0; seed < 300; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: [...EXCLUDED, 'home', 'music', 'park'], rng: seeded(seed) });
    assert.ok(exam.items.every((i) => !EXCLUDED.includes(i.topicId)));
  }
  // 주제별 연습에는 그대로 남는다.
  for (const id of EXCLUDED) {
    assert.equal(engine.buildPracticeExam(bank.surveyTopicById.get(id), seeded(1)).focusTopicId, id);
  }
});

test('every surprise topic can fill the 8-10 set and slot numbers, not source numbers, are shown', () => {
  const seen = new Set();
  for (let seed = 0; seed < 500; seed++) {
    const exam = engine.buildFullExam({ rng: seeded(seed) });
    const surprise = exam.items.filter((i) => [8,9,10].includes(i.slot));
    seen.add(surprise[0].topicId);
    assert.deepEqual(surprise.map((i) => engine.itemNumber(exam.mode, i)), ['8', '9', '10']);
  }
  assert.deepEqual([...seen].sort(), data.surpriseTopics.map((t) => t.id).sort());

  const practice = engine.buildPracticeExam(data.topicById.get('recycling'));
  assert.deepEqual(practice.items.map((i) => engine.itemNumber(practice.mode, i)), ['1', '2', '3', '4', '5-A', '5-B', '6']);
});

test('1-topic random practice gives a three-question set from one survey or surprise topic', () => {
  const surveySets = [['description','routine','experience'], ['description','experience','memorable']];
  const drawable = data.allTopics.filter((t) => !EXCLUDED.includes(t.id));
  const count = drawable.length;
  const seen = new Set();
  // 첫 추첨으로 주제를 하나씩 차례로 고르고, 세트 안의 추첨은 시드마다 달리한다.
  for (let index = 0; index < count * 50; index++) {
    const rest = seeded(index);
    let first = true;
    const rng = () => first ? (first = false, ((index % count) + 0.5) / count) : rest();
    const exam = engine.buildRandomPractice('set', 'all', rng);
    const topic = data.topicById.get(exam.focusTopicId);
    assert.equal(topic.id, drawable[index % count].id);
    seen.add(topic.id);
    assert.equal(exam.mode, 'set');
    assert.deepEqual(exam.items.map((i) => i.slot), [1, 2, 3]);
    assert.deepEqual(exam.items.map((i) => engine.itemNumber(exam.mode, i)), ['1', '2', '3']);
    assert.ok(exam.items.every((i) => i.topicId === topic.id));
    assert.equal(new Set(ids(exam.items)).size, 3);
    if (topic.category === 'survey') {
      assert.ok(surveySets.some((types) => types.join() === exam.items.map((i) => i.question.type).join()));
    } else {
      assert.equal(exam.items[0].question.id, topic.questions[0].id);
      const order = exam.items.map((i) => topic.questions.findIndex((q) => q.id === i.question.id));
      assert.deepEqual(order, [...order].sort((a, b) => a - b));
      exam.items.forEach((item, index) => {
        assert.ok(!['comparison', 'issue'].includes(item.question.type));
        for (const dependency of item.question.dependsOn ?? []) assert.ok(ids(exam.items.slice(0, index)).includes(dependency));
      });
    }
  }
  // 걷기·콘서트·조깅을 뺀 서베이 8개와 돌발 7개가 모두 나온다.
  assert.deepEqual([...seen].sort(), drawable.map((t) => t.id).sort());
});

test('random practice draws only from the chosen scope and records it on the exam', () => {
  const categoryOf = (id) => data.topicById.get(id).category;
  for (const mode of ['single', 'set']) {
    for (let seed = 0; seed < 300; seed++) {
      const survey = engine.buildRandomPractice(mode, 'survey', seeded(seed));
      assert.equal(survey.mode, mode);
      assert.equal(survey.randomScope, 'survey');
      assert.ok(survey.items.every((i) => categoryOf(i.topicId) === 'survey'));
      const surprise = engine.buildRandomPractice(mode, 'surprise', seeded(seed));
      assert.equal(surprise.randomScope, 'surprise');
      assert.ok(surprise.items.every((i) => categoryOf(i.topicId) === 'surprise'));
    }
    const all = engine.buildRandomPractice(mode, 'all', seeded(1));
    assert.equal(all.randomScope, 'all');
  }
  // 걷기·콘서트·조깅은 모의고사처럼 어느 범위의 랜덤 연습에도 나오지 않는다.
  for (const [scope, topics] of Object.entries(engine.RANDOM_SCOPE_TOPICS)) {
    assert.ok(topics.length > 0, scope);
    assert.ok(topics.every((t) => !EXCLUDED.includes(t.id)), scope);
  }
  for (let seed = 0; seed < 500; seed++) {
    for (const mode of ['single', 'set']) {
      for (const scope of ['all', 'survey']) {
        const exam = engine.buildRandomPractice(mode, scope, seeded(seed));
        assert.ok(exam.items.every((i) => !EXCLUDED.includes(i.topicId)), `${mode}/${scope}: ${exam.items[0].topicId}`);
      }
    }
  }
  assert.equal(engine.parseRandomScope('survey'), 'survey');
  assert.equal(engine.parseRandomScope('surprise'), 'surprise');
  for (const value of [null, undefined, '', 'all', 'SURVEY', 'roleplay']) assert.equal(engine.parseRandomScope(value), 'all');
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
