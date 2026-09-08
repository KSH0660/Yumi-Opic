const test = require('node:test');
const assert = require('node:assert/strict');
const { requiresFrontLoadedOpening, isOpicFeedback, readFeedbackResponse } = require('../.test-build/lib/feedback');

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

const sampleFeedback = {
  overall: '핵심을 먼저 말했습니다.',
  structure: { topic: 'good', detail: 'good', feeling: 'good', note: '' },
  pronunciationBasis: 'audio_compare',
  items: [],
};

test('응답에서 피드백과 녹음본 전사를 함께 읽는다', () => {
  const read = readFeedbackResponse({ feedback: sampleFeedback, audioTranscript: '  I go to the gym.  ' });
  assert.deepEqual(read.feedback, sampleFeedback);
  assert.equal(read.audioTranscript, 'I go to the gym.');
});

test('전사가 없거나 형식이 어긋난 응답을 가려낸다', () => {
  assert.equal(readFeedbackResponse({ feedback: sampleFeedback }).audioTranscript, '');
  assert.equal(readFeedbackResponse({ feedback: sampleFeedback, audioTranscript: 3 }).audioTranscript, '');
  assert.equal(readFeedbackResponse({ error: '실패' }), null);
  assert.equal(readFeedbackResponse(sampleFeedback), null);
  assert.equal(readFeedbackResponse(null), null);
});

test('피드백 항목은 5개까지만 읽는다', () => {
  const many = Array.from({ length: 7 }, (_, index) => ({
    category: 'storytelling', title: `${index}`, message: '', example: '',
  }));
  assert.equal(readFeedbackResponse({ feedback: { ...sampleFeedback, items: many } }).feedback.items.length, 5);
});
