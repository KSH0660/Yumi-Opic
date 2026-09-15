import { MAX_AUDIO_BYTES, transcribeAudio } from "@/lib/openaiTranscribe";

export const runtime = "nodejs";
export const maxDuration = 60;
/** 키가 있는지를 매번 그 자리에서 읽어야 한다. 한 번 그린 값을 들고 있으면 안 된다. */
export const dynamic = "force-dynamic";

/**
 * 이 서버가 녹음본을 글로 옮길 수 있는지.
 *
 * 휴대폰은 녹음만 하고 답변 텍스트를 전사로 만든다. 그 전사가 불가능한 서버에서
 * 녹음 모드로 연습하면 소리만 남고 기록이 통째로 빈다. 그래서 응시 화면은 시작 전에
 * 여기를 한 번 물어보고, 안 된다고 하면 받아쓰기 모드로 되돌린다.
 */
export async function GET() {
  return Response.json({ available: !!process.env.OPENAI_API_KEY });
}

/** 녹음본 하나를 받아쓴다. 피드백을 만들지 않으므로 값이 싸고 빠르다. */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY가 서버 환경변수에 설정되어 있지 않습니다." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "요청 형식을 읽을 수 없습니다." }, { status: 400 });
  }

  const entry = form.get("audio");
  const audio = entry instanceof File && entry.size > 0 ? entry : null;
  if (!audio) {
    return Response.json({ error: "녹음본이 필요합니다." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "녹음 파일이 너무 큽니다. 12MB 이하만 전사할 수 있습니다." }, { status: 413 });
  }

  try {
    return Response.json({ text: await transcribeAudio(apiKey, audio) });
  } catch (error) {
    console.error("OpenAI transcription failed", error);
    return Response.json(
      { error: "녹음본을 글로 옮기지 못했습니다. 잠시 뒤 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
