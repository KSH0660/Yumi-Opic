const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../.test-build/data/textbook/catalog');
const engine = require('../.test-build/lib/textbook-exam');
const { textbookSets: sets, textbookTopics: topics, textbookSetById: setById, textbookQuestionById: questionById } = bank;
function seeded(seed) { let state = seed >>> 0; return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }; }
const ids = (items) => items.map((x) => x.question.id);

test('catalog counts and explicit exclusions', () => {
  assert.deepEqual(bank.textbookStats, { topics: 54, questions: 359, generalSets: 84, roleplaySets: 47, advancedSets: 27, excludedSets: 3 });
  assert.equal(topics.filter((t) => t.category === 'survey').length, 8);
  assert.equal(topics.filter((t) => t.category === 'surprise').length, 20);
  for (const excluded of bank.excludedSets) {
    assert.ok(excluded.reason.length > 20);
    assert.equal(setById.has(excluded.id), false);
    assert.throws(() => engine.buildSetPractice(excluded.id));
  }
});
test('all 158 source SETs are playable, in printed order, with prerequisites', () => {
  for (const set of sets) {
    const exam = engine.buildSetPractice(set.id);
    assert.deepEqual(ids(exam.items), set.questionIds);
    assert.equal(exam.items.length, set.kind === 'advanced' ? 2 : 3);
    const seen = new Set();
    for (const [i, item] of exam.items.entries()) {
      assert.equal(item.topicId, set.topicId);
      assert.equal(item.setId, set.id);
      assert.equal(item.setPosition, i + 1);
      assert.equal(item.question.source, 'textbook');
      assert.ok(item.question.sourceRef.page > 0);
      for (const dependency of item.question.dependsOn ?? []) assert.ok(seen.has(dependency));
      seen.add(item.question.id);
    }
    if (set.kind === 'roleplay') {
      assert.deepEqual(exam.items.map((i) => i.slot), [11, 12, 13]);
      assert.deepEqual(exam.items.map((i) => i.question.sourceRef.label), ['Q11', 'Q12', 'Q13']);
    }
  }
});
test('5000 seeded mocks retain source sets, contain no duplicates/legacy questions, and reach every complete SET', () => {
  const before = JSON.stringify(topics);
  const generalTypes = new Set(); const commonPositions = new Set(); const observedSets = new Set();
  for (let seed = 0; seed < 5000; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: topics.filter((t) => t.category === 'survey').map((t) => t.id), rng: seeded(seed) });
    assert.equal(exam.items.length, 15);
    assert.deepEqual(exam.items.map((i) => i.slot), Array.from({ length: 15 }, (_, k) => k + 1));
    assert.equal(new Set(ids(exam.items)).size, 15);
    assert.equal(exam.bank, 'textbook');
    for (const [index, [from, to]] of [[1,4],[4,7],[7,10],[10,13],[13,15]].entries()) {
      const chunk = exam.items.slice(from, to); const set = setById.get(exam.setIds[index]);
      assert.deepEqual(ids(chunk), set.questionIds);
      assert.ok(chunk.every((i) => i.setId === set.id && i.topicId === set.topicId));
      observedSets.add(set.id);
      if (index < 3) {
        generalTypes.add(chunk.map((i) => i.question.type).join(','));
        if (bank.textbookTopicById.get(set.topicId).category === 'surprise') commonPositions.add(index);
      }
    }
    const generalTopics = exam.setIds.slice(0,3).map((id) => setById.get(id).topicId);
    assert.equal(new Set(generalTopics).size, 3);
    assert.equal(generalTopics.filter((id) => bank.textbookTopicById.get(id).category === 'survey').length, 2);
    for (const item of exam.items) assert.equal(item.question.source, 'textbook');
  }
  assert.equal(JSON.stringify(topics), before);
  assert.equal(commonPositions.size, 3);
  assert.ok(generalTypes.has('description,description,experience'));
  assert.ok(generalTypes.has('description,comparison,memorable'));
  assert.equal(observedSets.size, sets.length);
});
test('empty/unsupported survey choices fail instead of silently selecting other topics', () => {
  for (const enabledSurveyIds of [[], ['music'], ['park','beach'], ['unknown']]) assert.throws(() => engine.buildFullExam({ enabledSurveyIds }));
  for (let seed = 0; seed < 200; seed++) {
    const exam = engine.buildFullExam({ enabledSurveyIds: ['music','shopping','park'], rng: seeded(seed) });
    const selected = exam.items.filter((i) => bank.textbookTopicById.get(i.topicId)?.category === 'survey');
    assert.ok(selected.every((i) => ['music','shopping'].includes(i.topicId)));
    assert.match(exam.notices[0], /park/);
  }
  const noIntro = engine.buildFullExam({ includeIntro: false });
  assert.equal(noIntro.items.length, 14); assert.equal(noIntro.items[0].slot, 2);
});
test('regressions: double description, housing dependency, Internet Q14/Q15, numeric lines', () => {
  assert.deepEqual(engine.buildSetPractice('tb-g07-p95-s1-general').items.map((i) => i.question.type), ['description','description','experience']);
  const housing = engine.buildSetPractice('tb-g03-p50-s6-general');
  assert.deepEqual(ids(housing.items), ['tb-g03-q01','tb-g03-q09','tb-g03-q10']);
  assert.match(housing.items[2].question.en, /those problems you just mentioned/);
  const internet = engine.buildSetPractice('tb-g16-p195-s6-advanced');
  assert.deepEqual(internet.items.map((i) => i.question.type), ['issue','comparison']);
  assert.match(internet.items[0].question.en, /security/);
  assert.match(internet.items[1].question.en, /age groups/);
  assert.match(questionById.get('tb-g03-q12').en, /5 or 10 years/);
  assert.equal(questionById.get('tb-g17-q09').type, 'experience');
});
test('source numbering anomalies remain annotated instead of silently corrected', () => {
  for (const kind of ['general','advanced']) {
    const set = setById.get(`tb-g28-p294-s3-${kind}`);
    assert.equal(set.printedNumber, 3); assert.ok(set.note);
  }
  const hotel = setById.get('tb-g24-p266-s1-general');
  assert.deepEqual(hotel.questionIds, ['tb-g24-q01','tb-g24-q02','tb-g24-q03']); assert.ok(hotel.note);
});
test('roleplay variants never mix pages and Q13 is not forced into an invented problem story', () => {
  for (const set of sets.filter((s) => s.kind === 'roleplay')) assert.ok(engine.buildSetPractice(set.id).items.every((i) => i.question.sourceRef.page === set.sourceRef.page));
  const rental = engine.buildSetPractice('tb-r10-p398-s1-roleplay');
  assert.match(rental.items[2].question.en, /Have you ever rented a car/);
  assert.equal(rental.items[2].question.type, 'experience');
  assert.equal(engine.buildSetPractice('tb-r07-p383-s1-roleplay').items[2].question.type, 'comparison');
});
test('standalone mode excludes dependencies; topic practice never cuts a SET', () => {
  for (let seed = 0; seed < 1000; seed++) {
    const question = engine.buildSingleQuestion(topics, seeded(seed)).items[0].question;
    assert.equal(question.source, 'textbook'); assert.ok(!question.dependsOn?.length);
    assert.notEqual(question.sourceRef.section, 'roleplay');
  }
  for (const topic of topics) {
    const exam = engine.buildPracticeExam(topic, 1);
    assert.deepEqual(ids(exam.items), setById.get(exam.setIds[0]).questionIds);
  }
  assert.throws(() => engine.buildSingleQuestion([]));
  assert.throws(() => engine.pickRandom([]));
  assert.throws(() => engine.pickRandom([1], () => 1));
});
