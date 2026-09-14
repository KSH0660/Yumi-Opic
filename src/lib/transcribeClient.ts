"use client";

/**
 * 녹음본을 글로 옮기는 쪽(`/api/transcribe`)을 부르는 자리.
 *
 * 녹음만 하는 기기는 답변 텍스트가 여기서 나온다. 텍스트가 없으면 기록도 통계도
 * AI 피드백도 서지 않으므로, 이 길이 살아 있는지를 연습을 시작하기 전에 미리 물어본다.
 */

/** 브라우저가 붙인 녹음 형식에 맞는 파일 이름. 확장자가 어긋나면 전사가 거절된다. */
import { recordingExtension, recordingFileName } from "./mp3";

/**
 * 이 서버가 녹음본을 글로 옮길 수 있는지.
 *
 * 키가 없으면 서버가 false 를 돌려주고, 연결이 끊겨 있으면 요청 자체가 실패한다.
 * 어느 쪽이든 녹음만 켜서는 답변이 남지 않으므로 받아쓰기로 되돌려야 한다.
 */
export async function probeTranscription(signal?: AbortSignal): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    const response = await fetch("/api/transcribe", { method: "GET", cache: "no-store", signal });
    if (!response.ok) return false;
    const payload = (await response.json()) as { available?: unknown };
    return payload.available === true;
  } catch {
    return false;
  }
}

/** 전사에 실패한 까닭. 화면은 이것으로 다시 시도할지 안내를 바꿀지 정한다. */
export class TranscribeError extends Error {
  /** 다른 문항을 보내도 똑같이 실패할 오류(키 없음 등)인지. */
  readonly stopsBatch: boolean;

  constructor(message: string, stopsBatch: boolean) {
    super(message);
    this.stopsBatch = stopsBatch;
  }
}

const TRANSCRIBE_ERROR = "녹음본을 글로 옮기지 못했습니다. 잠시 뒤 다시 시도해 주세요.";

/** 녹음본 하나를 글로 옮긴다. 빈 문자열이면 소리는 있었지만 말이 잡히지 않은 것이다. */
export async function transcribeRecording(recording: { url: string; mimeType: string }, slot: number): Promise<string> {
  let blob: Blob;
  try {
    blob = await (await fetch(recording.url)).blob();
  } catch {
    // 녹음본 주소는 이 페이지 세션 동안만 산다. 탭이 되살아난 뒤라면 여기서 끊긴다.
    throw new TranscribeError("녹음본을 찾지 못했습니다. 이 회차의 녹음은 이미 사라졌습니다.", false);
  }
  if (blob.size === 0) throw new TranscribeError("녹음본이 비어 있습니다.", false);

  const body = new FormData();
  body.append("audio", blob, recordingFileName(slot, recordingExtension(recording.mimeType)));

  let response: Response;
  try {
    response = await fetch("/api/transcribe", { method: "POST", body });
  } catch {
    throw new TranscribeError("네트워크가 끊겨 녹음본을 보내지 못했습니다. 연결을 확인해 주세요.", true);
  }

  const payload = (await response.json().catch(() => null)) as { text?: unknown; error?: unknown } | null;
  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : TRANSCRIBE_ERROR;
    // 503 은 서버에 키가 없다는 뜻이라 남은 문항을 보내도 소용이 없다.
    throw new TranscribeError(message, response.status === 503);
  }
  return typeof payload?.text === "string" ? payload.text.trim() : "";
}
