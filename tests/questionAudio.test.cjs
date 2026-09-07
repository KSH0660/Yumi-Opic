const test = require('node:test');
const assert = require('node:assert/strict');
const audio = require('../.test-build/lib/questionAudio');
const manifest = require('../src/data/audio-manifest.json');
const bank = require('../.test-build/data/index');

test('아직 만들지 않은 문항은 주소가 없다 (브라우저 낭독으로 넘어간다)', () => {
  assert.equal(audio.questionAudioUrl('없는-문항'), null);
  assert.equal(audio.questionAudioUrl(''), null);
  assert.equal(audio.questionAudioUrl(undefined), null);
  assert.equal(audio.questionAudioUrl(null), null);
});

test('만들어 둔 문항은 해시가 붙은 mp3 주소가 나온다', () => {
  const [id, hash] = Object.entries(manifest.questions)[0] ?? [];
  if (!id) return; // 아직 한 번도 만들지 않은 상태
  assert.equal(audio.questionAudioUrl(id), `/audio/${id}.mp3?v=${hash}`);
});

test('낭독 파일 목록에는 실제로 있는 문항만 들어간다', () => {
  const ids = new Set([bank.introQuestion.id]);
  for (const topic of bank.allTopics) {
    for (const question of topic.questions) ids.add(question.id);
  }
  for (const id of Object.keys(manifest.questions)) {
    assert.ok(ids.has(id), `문제은행에 없는 낭독 파일: ${id}`);
  }
  assert.equal(audio.recordedQuestionCount(), Object.keys(manifest.questions).length);
});
