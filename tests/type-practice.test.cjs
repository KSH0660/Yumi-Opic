const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../.test-build/lib/exam');
const nav = require('../.test-build/lib/nav');
const { allTopics } = require('../.test-build/data');

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const SCOPES = ['all', 'survey', 'surprise'];
const single = engine.PRACTICE_TYPE_GROUPS.filter((group) => !engine.isTypePracticeSet(group));
const sets = engine.PRACTICE_TYPE_GROUPS.filter((group) => engine.isTypePracticeSet(group));
const topicById = new Map(allTopics.map((topic) => [topic.id, topic]));

test('유형 묶음은 자기소개를 뺀 아홉 유형을 한 번씩 덮는다', () => {
  const ids = engine.PRACTICE_TYPE_GROUPS.map((group) => group.id);
  assert.equal(new Set(ids).size, ids.length);
  const covered = engine.PRACTICE_TYPE_GROUPS.flatMap((group) => group.types);
  assert.equal(new Set(covered).size, covered.length);
  assert.deepEqual([...covered].sort(), Object.keys(engine.TYPE_LABELS).filter((type) => type !== 'intro').sort());
  for (const group of engine.PRACTICE_TYPE_GROUPS) {
    assert.ok(group.label && group.note && group.slots);
    assert.equal(engine.practiceTypeGroupById.get(group.id), group);
  }
});

test('유형이 하나인 묶음은 주제를 바꿔 가며 그 유형만 낸다', () => {
  for (const group of single) {
    for (const scope of SCOPES) {
      // 문제은행이 늘고 줄어도 깨지지 않게, 기대값은 지금 가진 양에서 끌어온다.
      const supply = engine.typePracticeSupply(group, scope);
      const wanted = Math.min(5, supply.draws);
      for (let seed = 0; seed < 20; seed++) {
        const exam = engine.buildTypePractice(group, scope, 5, seeded(seed));
        assert.equal(exam.mode, 'type');
        assert.equal(exam.typeGroupId, group.id);
        assert.equal(exam.randomScope, scope);
        assert.equal(exam.items.length, wanted);
        assert.deepEqual(exam.items.map((item) => item.slot), exam.items.map((_, index) => index + 1));
        assert.ok(exam.items.every((item) => item.question.type === group.types[0]));
        // 같은 문항이 한 회차에 두 번 나오지 않고, 주제가 남아 있는 동안에는 주제도 겹치지 않는다.
        assert.equal(new Set(exam.items.map((item) => item.question.id)).size, wanted);
        assert.equal(new Set(exam.items.map((item) => item.topicId)).size, Math.min(wanted, supply.topics));
        // 앞 질문을 전제로 하는 문항은 홀로 낼 수 없다.
        assert.ok(exam.items.every((item) => !(item.question.dependsOn ?? []).length));
        assert.ok(exam.items.every((item) => topicById.get(item.topicId).questions.includes(item.question)));
      }
    }
  }
});

test('롤플레이와 비교·이슈는 한 주제에서 이어지는 세트로 낸다', () => {
  for (const group of sets) {
    for (const scope of SCOPES) {
      const wanted = Math.min(2, engine.typePracticeSupply(group, scope).draws);
      for (let seed = 0; seed < 20; seed++) {
        const exam = engine.buildTypePractice(group, scope, wanted, seeded(seed));
        const size = group.types.length;
        assert.equal(exam.items.length, wanted * size);
        assert.deepEqual(exam.items.map((item) => item.slot), exam.items.map((_, index) => index + 1));
        for (let set = 0; set < wanted; set++) {
          const items = exam.items.slice(set * size, set * size + size);
          assert.equal(new Set(items.map((item) => item.topicId)).size, 1);
          assert.deepEqual(items.map((item) => item.question.type), group.types);
          // 연결 질문은 반드시 같은 세트의 앞 문항 뒤에 온다.
          for (const [index, item] of items.entries()) {
            for (const dependency of item.question.dependsOn ?? []) {
              assert.ok(items.slice(0, index).some((earlier) => earlier.question.id === dependency));
            }
          }
        }
        // 세트마다 주제가 바뀐다.
        assert.equal(new Set(exam.items.map((item) => item.topicId)).size, wanted);
      }
    }
  }
});

test('고른 범위 밖의 주제는 나오지 않는다', () => {
  for (const scope of SCOPES) {
    const allowed = new Set(engine.RANDOM_SCOPE_TOPICS[scope].map((topic) => topic.id));
    for (const group of engine.PRACTICE_TYPE_GROUPS) {
      const draws = Math.min(3, engine.typePracticeSupply(group, scope).draws);
      for (let seed = 0; seed < 10; seed++) {
        const exam = engine.buildTypePractice(group, scope, draws, seeded(seed));
        assert.ok(exam.items.every((item) => allowed.has(item.topicId)));
      }
    }
    // 걷기·콘서트·조깅은 모의고사·랜덤 연습과 마찬가지로 어느 범위에도 없다.
    for (const id of engine.DRAW_EXCLUDED_TOPIC_IDS) assert.ok(!allowed.has(id));
  }
});

test('가진 것보다 많이 요청하면 가진 만큼만 내고 그 사실을 알린다', () => {
  for (const group of engine.PRACTICE_TYPE_GROUPS) {
    for (const scope of SCOPES) {
      const supply = engine.typePracticeSupply(group, scope);
      const exam = engine.buildTypePractice(group, scope, supply.draws + 5, seeded(7));
      assert.equal(exam.items.length, supply.questions);
      assert.ok(exam.notices.some((notice) => notice.includes('일부만')));
      // 넉넉히 뽑는 회차에는 그 알림이 붙지 않는다.
      const enough = engine.buildTypePractice(group, scope, 1, seeded(7));
      assert.ok(!enough.notices.some((notice) => notice.includes('일부만')));
    }
  }
});

test('같은 씨앗은 같은 회차를, 다른 씨앗은 다른 회차를 만든다', () => {
  const group = engine.practiceTypeGroupById.get('description');
  const ids = (exam) => exam.items.map((item) => item.question.id);
  assert.deepEqual(ids(engine.buildTypePractice(group, 'all', 5, seeded(3))), ids(engine.buildTypePractice(group, 'all', 5, seeded(3))));
  assert.notDeepEqual(ids(engine.buildTypePractice(group, 'all', 5, seeded(3))), ids(engine.buildTypePractice(group, 'all', 5, seeded(9))));
});

test('추첨 횟수는 고를 수 있는 값만 받고 나머지는 기본값으로 둔다', () => {
  for (const group of engine.PRACTICE_TYPE_GROUPS) {
    const choices = engine.typePracticeDrawChoices(group);
    assert.ok(choices.includes(engine.defaultTypePracticeDraws(group)));
    for (const value of choices) assert.equal(engine.parseTypePracticeDraws(group, String(value)), value);
    for (const value of [null, undefined, '', '0', '-1', '999', 'many', '2.5']) {
      if (choices.includes(Number(value))) continue;
      assert.equal(engine.parseTypePracticeDraws(group, value), engine.defaultTypePracticeDraws(group));
    }
    // 저장된 회차의 문항 수로 몇 번 뽑았는지 되짚는다.
    for (const draws of choices) {
      const exam = engine.buildTypePractice(group, 'all', draws, seeded(1));
      assert.equal(engine.typePracticeDraws(group, exam.items.length), draws);
    }
  }
});

test('모르는 유형은 고르지 않는다', () => {
  for (const value of [null, undefined, '', 'unknown', 'intro']) {
    assert.equal(engine.parsePracticeTypeGroup(value), undefined);
  }
  assert.equal(engine.parsePracticeTypeGroup('roleplay').id, 'roleplay');
});

test('화면에 적는 보유량은 실제로 뽑을 수 있는 양과 같다', () => {
  for (const group of engine.PRACTICE_TYPE_GROUPS) {
    for (const scope of SCOPES) {
      const supply = engine.typePracticeSupply(group, scope);
      assert.ok(supply.topics > 0 && supply.draws > 0);
      assert.equal(supply.questions, engine.isTypePracticeSet(group) ? supply.draws * group.types.length : supply.draws);
      assert.equal(engine.buildTypePractice(group, scope, supply.draws, seeded(5)).items.length, supply.questions);
    }
  }
});

test('유형별 연습은 자기 목록으로 나가고 같은 유형·범위·문항 수로 다시 뽑는다', () => {
  assert.deepEqual(nav.examExitLink('type'), { href: '/types', label: '← 유형별 연습' });
  assert.equal(nav.nextPracticeLink('type').href, '/types');
  const group = engine.practiceTypeGroupById.get('memorable');
  assert.deepEqual(nav.typePracticeLink(group), { href: '/exam?mode=type&type=memorable', label: '기억에 남는 경험 유형 연습 (서베이+돌발)' });
  assert.deepEqual(nav.typePracticeLink(group, 'surprise', 10), { href: '/exam?mode=type&type=memorable&scope=surprise&draws=10', label: '기억에 남는 경험 유형 연습 (돌발)' });
  assert.equal(nav.typePracticeTitle(group), '유형별 연습 · 기억에 남는 경험');
  assert.equal(nav.typePracticeTitle(group, 'survey'), '유형별 연습 · 기억에 남는 경험 (서베이)');

  for (const candidate of engine.PRACTICE_TYPE_GROUPS) {
    for (const scope of SCOPES) {
      const draws = engine.typePracticeDrawChoices(candidate)[0];
      const exam = engine.buildTypePractice(candidate, scope, draws, seeded(2));
      const entry = { id: 'a', finishedAt: 1, mode: 'type', label: '유형별 연습', answered: 0, totalItems: exam.items.length,
        result: { exam, answers: {}, times: {}, hintUse: {}, replays: {}, feedback: {} } };
      assert.deepEqual(nav.repeatPracticeLink(entry, allTopics), nav.typePracticeLink(candidate, scope, draws));
    }
  }
  // 유형을 적어 두지 않은 기록은 다시 뽑을 링크를 만들지 않는다.
  assert.equal(nav.repeatPracticeLink({ id: 'b', finishedAt: 1, mode: 'type', label: '유형별 연습', answered: 0, totalItems: 1 }, allTopics), undefined);
});
