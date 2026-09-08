const test = require('node:test');
const assert = require('node:assert/strict');
const mp3 = require('../.test-build/lib/mp3');

test('녹음 파일 확장자는 mime 을 따라간다', () => {
  assert.equal(mp3.recordingExtension('audio/webm;codecs=opus'), 'webm');
  assert.equal(mp3.recordingExtension('audio/ogg;codecs=opus'), 'ogg');
  assert.equal(mp3.recordingExtension(''), 'webm');
});

test('내려받는 파일 이름에는 문항 번호와 확장자가 들어간다', () => {
  assert.equal(mp3.recordingFileName(3, 'mp3'), 'yumi-opic-question-3.mp3');
  assert.equal(mp3.recordingFileName(11, 'webm'), 'yumi-opic-question-11.webm');
});

test('mp3 가 담을 수 있는 표본율은 그대로 쓴다', () => {
  assert.equal(mp3.mp3SampleRate(48000), 48000);
  assert.equal(mp3.mp3SampleRate(44100), 44100);
  assert.equal(mp3.mp3SampleRate(16000), 16000);
});

test('mp3 가 못 담는 표본율은 44.1kHz 로 맞춘다', () => {
  // 일부 기기의 마이크는 44.1·48kHz 가 아닌 값으로 녹음한다.
  assert.equal(mp3.mp3SampleRate(37800), 44100);
  assert.equal(mp3.mp3SampleRate(0), 44100);
  assert.equal(mp3.mp3SampleRate(Number.NaN), 44100);
});

test('여러 채널은 평균으로 한 채널이 된다', () => {
  const left = Float32Array.from([1, 0, -1]);
  const right = Float32Array.from([0, 0, -1]);
  const pcm = mp3.mixToMonoPcm16([left, right]);
  assert.equal(pcm.length, 3);
  assert.equal(pcm[0], Math.round(0.5 * 0x7fff));
  assert.equal(pcm[1], 0);
  assert.equal(pcm[2], -0x8000);
});

test('1을 넘는 표본도 잘라 내 16비트 범위를 지킨다', () => {
  const pcm = mp3.mixToMonoPcm16([Float32Array.from([2, -2, 0.5])]);
  assert.equal(pcm[0], 0x7fff);
  assert.equal(pcm[1], -0x8000);
  assert.equal(pcm[2], Math.round(0.5 * 0x7fff));
});

test('빈 녹음은 빈 PCM 이 된다', () => {
  assert.equal(mp3.mixToMonoPcm16([]).length, 0);
  assert.equal(mp3.mixToMonoPcm16([new Float32Array(0)]).length, 0);
});
