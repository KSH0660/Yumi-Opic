/**
 * 녹음본을 받을 때 mp3 로 바꿔 준다.
 *
 * 브라우저 녹음(MediaRecorder)이 내놓는 파일은 webm/opus 뿐이다. 이 확장자는
 * 카카오톡으로 보내거나 아이폰·기본 음악 앱에서 열면 재생되지 않는 일이 잦아,
 * 받아 두고도 못 듣는 녹음본이 된다. 그래서 다운로드를 누른 그 자리에서
 * 브라우저가 직접 mp3 로 다시 만든다.
 *
 * 변환은 전부 브라우저 안에서 끝나므로 녹음이 서버로 나가지 않는다. 인코더
 * (lamejs)는 다운로드를 누른 뒤에 불러오기 때문에 평소 화면 무게도 그대로다.
 */

/** mp3(MPEG-1/2/2.5)가 담을 수 있는 표본율. 이 밖의 값은 44.1kHz 로 다시 만든다. */
const MP3_SAMPLE_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];

/** 한 채널짜리 말소리라 96kbps 면 원본(opus 약 32kbps)보다 넉넉하다. */
const MP3_KBPS = 96;

/**
 * 한 번에 인코더로 넘길 표본 수.
 *
 * mp3 한 프레임이 1152 표본이라 그 배수로 잘라야 인코더가 남는 표본을 들고
 * 있지 않는다. 44.1kHz 기준 약 1.3초 분량이며, 이 단위마다 진행률을 올리고
 * 화면에 손을 놓는다.
 */
const ENCODE_BLOCK = 1152 * 50;

/** 브라우저가 남긴 녹음 파일의 확장자. mp3 로 못 바꿨을 때 원본을 받는 이름에 쓴다. */
export function recordingExtension(mimeType: string): string {
  return mimeType.includes("ogg") ? "ogg" : "webm";
}

/** 문항 번호로 짓는 내려받기 파일 이름. */
export function recordingFileName(slot: number, extension: string): string {
  return `yumi-opic-question-${slot}.${extension}`;
}

/** 인코더가 받아 주는 가장 가까운 표본율. 목록에 없으면 44.1kHz 로 맞춘다. */
export function mp3SampleRate(rate: number): number {
  const rounded = Math.round(rate);
  return MP3_SAMPLE_RATES.includes(rounded) ? rounded : 44100;
}

/**
 * 여러 채널을 한 채널 16비트 PCM 으로 섞는다.
 *
 * 마이크 하나로 받은 말소리라 채널을 나눠 둘 이유가 없고, 한 채널로 만들면
 * 파일도 절반이 된다. 16비트 정수는 음수 쪽이 한 칸 더 넓어(-32768~32767)
 * 양쪽에 다른 배율을 쓴다.
 */
export function mixToMonoPcm16(channels: ReadonlyArray<Float32Array>): Int16Array {
  const length = channels[0]?.length ?? 0;
  const pcm = new Int16Array(length);
  if (channels.length === 0) return pcm;

  for (let i = 0; i < length; i += 1) {
    let sum = 0;
    for (const channel of channels) sum += channel[i] ?? 0;
    const sample = Math.max(-1, Math.min(1, sum / channels.length));
    pcm[i] = Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
  }
  return pcm;
}

/** 0~1 사이의 진행률. 변환이 몇 초 걸리므로 버튼에 퍼센트를 적는다. */
export type Mp3Progress = (ratio: number) => void;

/** 한 채널 PCM 을 mp3 로 인코딩한다. 블록마다 손을 놓아 화면이 멈추지 않는다. */
export async function encodeMonoMp3(pcm: Int16Array, sampleRate: number, onProgress?: Mp3Progress): Promise<Blob> {
  const lame = await import("@breezystack/lamejs");
  // 번들러에 따라 이름 내보내기가 default 안에만 들어오는 경우가 있다.
  const Encoder = lame.Mp3Encoder ?? (lame as { default?: { Mp3Encoder?: typeof lame.Mp3Encoder } }).default?.Mp3Encoder;
  if (!Encoder) throw new Error("mp3 인코더를 불러오지 못했습니다.");

  const encoder = new Encoder(1, sampleRate, MP3_KBPS);
  const parts: BlobPart[] = [];
  for (let offset = 0; offset < pcm.length; offset += ENCODE_BLOCK) {
    const frame = encoder.encodeBuffer(pcm.subarray(offset, offset + ENCODE_BLOCK));
    // 인코더가 돌려주는 배열을 다시 쓸 수도 있어 바이트를 복사해 들고 있는다.
    if (frame.length > 0) parts.push(new Uint8Array(frame));
    onProgress?.(Math.min(1, (offset + ENCODE_BLOCK) / pcm.length));
    // 90초짜리 답변이면 몇 초가 걸린다. 그동안 버튼이 얼어붙지 않게 한 틱 쉰다.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const tail = encoder.flush();
  if (tail.length > 0) parts.push(new Uint8Array(tail));
  onProgress?.(1);
  return new Blob(parts, { type: "audio/mpeg" });
}

type OfflineCtor = new (channels: number, length: number, sampleRate: number) => OfflineAudioContext;

/** 소리를 내지 않고 디코딩·리샘플만 하므로 마이크나 스피커를 잡지 않는다. */
function offlineContext(frames: number, sampleRate: number): OfflineAudioContext {
  const scope = globalThis as { OfflineAudioContext?: OfflineCtor; webkitOfflineAudioContext?: OfflineCtor };
  const Ctor = scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext;
  if (!Ctor) throw new Error("이 브라우저는 녹음본 변환을 지원하지 않습니다.");
  return new Ctor(1, Math.max(1, Math.ceil(frames)), sampleRate);
}

function decodeAudioData(context: OfflineAudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  // 옛 사파리는 약속(Promise) 대신 콜백만 준다. 둘 다 받아 두면 어느 쪽이든 걸린다.
  return new Promise((resolve, reject) => {
    const pending = context.decodeAudioData(data, resolve, reject) as Promise<AudioBuffer> | undefined;
    if (pending && typeof pending.then === "function") pending.then(resolve, reject);
  });
}

/** 표본율을 바꾼다. 내보낼 채널이 하나뿐이라 이 과정에서 한 채널로도 섞인다. */
async function resample(buffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> {
  const context = offlineContext((buffer.length * sampleRate) / buffer.sampleRate, sampleRate);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
  return context.startRendering();
}

/** 녹음본(webm/ogg)을 mp3 Blob 으로 바꾼다. 실패하면 그대로 던져 원본 내려받기로 넘긴다. */
export async function recordingToMp3(recording: Blob, onProgress?: Mp3Progress): Promise<Blob> {
  const raw = await recording.arrayBuffer();
  // 디코딩 표본율을 44.1kHz 로 걸어 두면 대개 여기서 바로 mp3 가 받는 값이 나온다.
  const decoded = await decodeAudioData(offlineContext(1, 44100), raw);

  const rate = mp3SampleRate(decoded.sampleRate);
  const ready = decoded.sampleRate === rate ? decoded : await resample(decoded, rate);
  const channels = Array.from({ length: ready.numberOfChannels }, (_, i) => ready.getChannelData(i));

  const pcm = mixToMonoPcm16(channels);
  if (pcm.length === 0) throw new Error("녹음본이 비어 있습니다.");
  return encodeMonoMp3(pcm, rate, onProgress);
}
