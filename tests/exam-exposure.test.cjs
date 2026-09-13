const test = require('node:test');
const assert = require('node:assert/strict');
const { allTopics, topicById } = require('../.test-build/data');
const engine = require('../.test-build/lib/exam');
const { questionExposureKey: key, recordQuestionExposure, readExamExposure } = require('../.test-build/lib/examExposure');
const storage = require('../.test-build/lib/storage');

const questions = allTopics.filter(t => !engine.DRAW_EXCLUDED_TOPIC_IDS.includes(t.id)).flatMap(t => t.questions);
const patterns = [
  ['description', 'routine', 'experience'], ['description', 'experience', 'memorable'],
  ['roleplay_ask', 'roleplay_problem', 'roleplay_experience'], ['comparison', 'issue'],
];
function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}
const keys = exam => new Set(exam.items.filter(i => i.topicId !== 'intro').map(i => key(i.question)));
const allSeen = () => Object.fromEntries(questions.map(q => [key(q), { count: 1, lastSeen: 100, lastAttemptId: 'previous' }]));
function remember(exposure, exam, time) {
  for (const item of exam.items) exposure = recordQuestionExposure(exposure, item.question, exam.id, time);
  return exposure;
}

test('every active bank question belongs to a complete full-exam set, including new source variants and surprise roleplay', () => {
  assert.equal(questions.length, 230);
  for (const topic of allTopics.filter(t => !engine.DRAW_EXCLUDED_TOPIC_IDS.includes(t.id))) {
    const allowed = patterns;
    const reachable = new Set(allowed.flatMap(types => engine.completeQuestionSets(topic, types)).flat().map(q => q.id));
    assert.deepEqual([...reachable].sort(), topic.questions.map(q => q.id).sort(), topic.id);
  }
});

test('the legacy omission cannot recur when verified and adapted experience questions coexist', () => {
  for (const topicId of ['shopping', 'gym']) {
    const template = allTopics.find(t => t.category === 'survey' && !t.fixedPracticeSets);
    const experiences = template.questions.filter(q => q.type === 'experience');
    const target = `${topicId}-e2`;
    const topic = { ...template, id: topicId, questions: template.questions.map(q =>
      experiences.includes(q) ? { ...q, id: q === experiences[0] ? `${topicId}-e1` : target,
        source: q === experiences[0] ? 'verified' : 'adapted' } : q) };
    assert.ok(engine.buildPracticeExam(topic, () => 0.999).items.some(i => i.question.id === target));
    const singles = topic.questions.filter(q => !q.dependsOn?.length);
    const index = singles.findIndex(q => q.id === target);
    assert.equal(engine.buildSingleQuestion([topic], () => (index + 0.5) / singles.length).items[0].question.id, target);
    const draws = [0, 0, 0.999];
    assert.ok(engine.buildTopicSet([topic], () => draws.shift()).items.some(i => i.question.id === target));
  }
});

test('every unseen eligible text wins over previously seen sets, across topics and surprise placements', () => {
  const snapshot = allSeen();
  const untouched = JSON.stringify(snapshot);
  for (const questionKey of Object.keys(snapshot)) {
    const exposure = { ...snapshot };
    delete exposure[questionKey];
    const exam = engine.buildFullExam({ exposure, rng: seeded(51) });
    assert.ok(keys(exam).has(questionKey), questionKey);
    assert.equal(new Set(exam.items.map(i => i.question.id)).size, exam.items.length);
    for (const group of new Set(exam.items.map(i => i.comboLabel))) {
      const entries = exam.items.filter(i => i.comboLabel === group);
      entries.forEach((item, index) => {
        for (const dependency of item.question.dependsOn ?? []) {
          assert.ok(entries.slice(0, index).some(i => i.question.id === dependency), item.question.id);
        }
      });
    }
  }
  assert.equal(JSON.stringify(snapshot), untouched);
});

test('when everything was seen, draw less-practiced texts first and use recency to break ties', () => {
  const target = topicById.get('music').questions.find(q => q.id === 'music-advanced1-q14');
  for (const count of [1, 2]) {
    const exposure = Object.fromEntries(Object.entries(allSeen()).map(([k, v]) => [k, { ...v, count: 2 }]));
    exposure[key(target)] = { count, lastSeen: 1, lastAttemptId: 'older' };
    for (let seed = 0; seed < 12; seed++) {
      assert.ok(keys(engine.buildFullExam({ exposure, rng: seeded(seed) })).has(key(target)));
    }
  }
});

test('duplicate IDs, whitespace, curly quotes and trailing punctuation share one exposure record', () => {
  const park = topicById.get('park');
  const first = park.questions.find(q => q.id === 'park-set1-q2');
  const duplicate = park.questions.find(q => q.id === 'park-set3-q8');
  let exposure = recordQuestionExposure({}, first, 'attempt', 100);
  assert.equal(recordQuestionExposure(exposure, duplicate, 'attempt', 101), exposure);
  const alternate = { ...duplicate, id: 'changed-id', en: `  ${duplicate.en.toUpperCase()}!  ` };
  assert.equal(key(first), key(alternate));
  exposure = recordQuestionExposure(exposure, alternate, 'next-attempt', 200);
  assert.equal(Object.keys(exposure).length, 1);
  assert.equal(exposure[key(first)].count, 2);
  const parkRoleplay = park.questions.find(q => q.id === 'park-roleplay1-q13');
  const vacationRoleplay = topicById.get('staycation').questions.find(q => q.id === 'staycation-q13');
  assert.equal(key(parkRoleplay), key(vacationRoleplay));
  assert.equal(key({ en: "What's new?" }), key({ en: 'What’s new?' }));
});

test('consecutive exams cover the expanded bank and repeat less than independent draws', () => {
  for (const seed of [1, 27, 20260913]) {
    let exposure = {};
    const seen = new Set();
    const randomSeen = new Set();
    let previous = new Set(), randomPrevious = new Set(), repeats = 0, randomRepeats = 0;
    const rng = seeded(seed), randomRng = seeded(seed);
    for (let attempt = 0; attempt < 40; attempt++) {
      const exam = engine.buildFullExam({ exposure, rng });
      const drawn = keys(exam);
      const randomDrawn = keys(engine.buildFullExam({ rng: randomRng }));
      repeats += [...drawn].filter(k => previous.has(k)).length;
      randomRepeats += [...randomDrawn].filter(k => randomPrevious.has(k)).length;
      drawn.forEach(k => seen.add(k)); randomDrawn.forEach(k => randomSeen.add(k));
      previous = drawn; randomPrevious = randomDrawn;
      exposure = remember(exposure, exam, attempt + 1);
    }
    assert.equal(seen.size, new Set(questions.map(key)).size, `coverage for seed ${seed}`);
    assert.ok(seen.size > randomSeen.size, `coverage improvement for seed ${seed}`);
    assert.ok(repeats < randomRepeats, `repeat improvement for seed ${seed}`);
  }
});

function withStorage(run) {
  const previous = global.window;
  const data = new Map();
  global.window = { localStorage: {
    getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k),
  } };
  try { run(data); } finally { if (previous === undefined) delete global.window; else global.window = previous; }
}

test('drawing does not mark questions seen; actual exposures survive storage reload and result-history rotation', () => withStorage(() => {
  const exam = engine.buildFullExam({ exposure: storage.loadFullExamExposure(), rng: seeded(20) });
  assert.deepEqual(storage.loadFullExamExposure(), {});
  const question = exam.items[1].question;
  storage.recordFullExamQuestion(exam, question, 'heard', 10);
  storage.recordFullExamQuestion(exam, question, 'heard', 11);
  storage.recordFullExamQuestion(exam, exam.items[0].question, 'heard', 11); // Intro
  storage.recordFullExamQuestion({ ...exam, mode: 'practice' }, question, 'practice', 12);
  assert.deepEqual(storage.loadFullExamExposure(), { [key(question)]: { count: 1, lastSeen: 10, lastAttemptId: 'heard' } });
  for (let i = 0; i < 21; i++) {
    storage.pushHistory({ id: `summary-${i}`, mode: 'full', label: '모의고사', finishedAt: i, answered: 0, totalItems: 15 });
  }
  assert.equal(storage.loadHistory().length, 20);
  assert.equal(storage.loadFullExamExposure()[key(question)].count, 1);
  storage.recordFullExamQuestion(exam, question, 'retry', 20);
  assert.equal(storage.loadFullExamExposure()[key(question)].count, 2);
  storage.clearHistory();
  assert.deepEqual(storage.loadFullExamExposure(), {});
}));

test('migration uses only evidence of exposure in old full-exam results, and imports it once', () => withStorage(data => {
  const exam = engine.buildFullExam({ rng: seeded(7) });
  const [intro, answered, timed, hinted, replayed, skipped] = exam.items;
  const result = { exam, answers: { [answered.slot]: 'My answer' }, times: { [timed.slot]: 5 },
    hintUse: { [hinted.slot]: 1 }, replays: { [replayed.slot]: 1 }, feedback: {} };
  const entry = { id: 'legacy', mode: 'full', label: 'Old', finishedAt: 100, answered: 1, totalItems: 15, result };
  data.set('yumi-opic:history', JSON.stringify([entry, { ...entry, id: 'practice', mode: 'practice' }]));
  const exposure = storage.loadFullExamExposure();
  assert.equal(Object.keys(exposure).length, 4);
  assert.equal(exposure[key(skipped.question)], undefined);
  assert.equal(exposure[key(intro.question)], undefined);
  storage.recordFullExamQuestion(exam, skipped.question, 'new', 200);
  assert.equal(storage.loadFullExamExposure()[key(answered.question)].count, 1);
  assert.equal(storage.loadFullExamExposure()[key(skipped.question)].count, 1);
  assert.equal(Object.keys(storage.loadFullExamExposure()).length, 5);
}));

test('bad saved exposure entries and unavailable storage do not prevent an exam', () => withStorage(data => {
  assert.equal(readExamExposure(null), undefined);
  assert.deepEqual(readExamExposure({ bad: { count: -1 }, empty: null }), {});
  const good = { count: 1, lastSeen: 1, lastAttemptId: 'ok' };
  assert.deepEqual(readExamExposure({ good, bad: { ...good, lastSeen: '1' } }), { good });
  data.set('yumi-opic:exam-exposure', '{broken');
  assert.deepEqual(storage.loadFullExamExposure(), {});
  window.localStorage.getItem = () => { throw new Error('unavailable'); };
  window.localStorage.setItem = () => { throw new Error('quota'); };
  assert.doesNotThrow(() => {
    const exam = engine.buildFullExam({ exposure: storage.loadFullExamExposure() });
    storage.recordFullExamQuestion(exam, exam.items[1].question);
  });
}));
