/**
 * 녹음본을 OpenAI STT 로 받아쓴다. 서버에서만 부른다.
 *
 * 부르는 곳이 둘이다. `/api/feedback` 은 발음 점검과 답변 교정에 쓰려고 피드백을 만드는
 * 김에 함께 받아쓰고, `/api/transcribe` 는 녹음만 하는 기기가 답변을 글로 남기려고
 * 부른다. 두 곳이 같은 파일·같은 모델을 쓰도록 여기 한 곳에 둔다.
 */

/** 한 문항 녹음본의 상한. 90초 답변은 opus 로 1MB 안쪽이라 넉넉하다. */
export const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

/**
 * 파일 이름이 없을 때 쓸 이름.
 *
 * OpenAI 는 확장자로 형식을 가린다. 사파리는 webm 이 아니라 mp4(AAC)로 녹음하므로,
 * 이름이 없다고 늘 `.webm` 을 붙이면 형식이 어긋나 전사가 거절된다.
 */
export function fallbackAudioName(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac") || mimeType.includes("m4a")) return "answer.m4a";
  if (mimeType.includes("ogg")) return "answer.ogg";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "answer.mp3";
  if (mimeType.includes("wav")) return "answer.wav";
  return "answer.webm";
}

export async function transcribeAudio(apiKey: string, audio: File): Promise<string> {
  const body = new FormData();
  body.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe");
  body.append("language", "en");
  body.append("file", audio, audio.name || fallbackAudioName(audio.type));

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!response.ok) {
    throw new Error(`transcription_failed:${response.status}`);
  }

  const payload = (await response.json()) as { text?: unknown };
  return typeof payload.text === "string" ? payload.text.trim() : "";
}
