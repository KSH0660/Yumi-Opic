const test = require('node:test');
const assert = require('node:assert/strict');
const { requiresFrontLoadedOpening, isOpicFeedback } = require('../.test-build/lib/feedback');

test('서술형 문항은 두괄식 기준으로 보고 롤플레이는 빼 준다', () => {
  for (const type of ['description', 'routine', 'experience', 'memorable', 'comparison', 'issue', 'intro']) {
    assert.equal(requiresFrontLoadedOpening(type), true, type);
  }
  for (const type of ['roleplay_ask', 'roleplay_problem', 'roleplay_experience']) {
    assert.equal(requiresFrontLoadedOpening(type), false, type);
  }
});

test('유형을 모르면 일반 서술형으로 본다', () => {
  assert.equal(requiresFrontLoadedOpening(undefined), true);
  assert.equal(requiresFrontLoadedOpening(''), true);
});

test('두괄식 규칙을 넣어도 저장된 피드백 형태는 그대로 통과한다', () => {
  const stored = {
    overall: '핵심을 먼저 말했습니다.',
    structure: { topic: 'good', detail: 'needs_work', feeling: 'good', note: '디테일을 더 붙여 보세요.' },
    pronunciationBasis: 'browser_only',
    items: [{ category: 'storytelling', title: '도입', message: '첫 문장이 좋습니다.', example: '' }],
  };
  assert.equal(isOpicFeedback(stored), true);
  assert.equal(isOpicFeedback({ ...stored, structure: { ...stored.structure, topic: 'front_loaded' } }), false);
});
