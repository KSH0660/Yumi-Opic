/**
 * 음성 인식 결과를 답변 텍스트로 모으는 순수 로직.
 *
 * 인식 세션 하나의 `event.results` 는 그 세션에서 받아 적은 말을 앞에서부터
 * 차례로 나눈 조각이다. 확정(final) 조각은 다시 바뀌지 않고 서로 겹치지 않으며,
 * 끝에 붙은 임시(interim) 조각만 계속 고쳐진다. 그래서 조각을 순서대로 이으면 그
 * 세션의 받아쓰기가 되고, 세션이 끝나면 그 값을 앞 세션 뒤에 잇기만 하면 된다.
 *
 * 조각이 이 모양으로 오도록 인식기를 켜는 일은 `./speech` 가 맡는다. 겹친 말을
 * 여기서 걷어내지 않는다. 사용자가 실제로 되풀이한 말까지 지우게 되기 때문이다.
 * 브라우저 API 를 쓰지 않으므로 테스트에서 그대로 부를 수 있다.
 */

/** 인식 결과 한 칸. 브라우저 SpeechRecognitionResult 를 옮겨 담은 값이다. */
export interface TranscriptChunk {
  isFinal: boolean;
  transcript: string;
}

export interface TranscriptDraft {
  /** 확정된 문장을 이어 붙인 값 */
  committed: string;
  /** 아직 인식 중인 임시 문장 */
  interim: string;
}

/**
 * 받아 적은 두 대목을 띄어쓰기 하나로 잇는다. 한쪽이 비면 다른 쪽만 남는다.
 * 앞쪽은 손으로 쓴 답변일 수 있어 끝의 공백만 정리한다.
 */
export function joinTranscript(base: string, addition: string): string {
  const left = base.replace(/\s+$/, "");
  const right = addition.trim();
  if (!left) return right;
  if (!right) return left;
  return `${left} ${right}`;
}

/**
 * 인식 세션 하나가 들고 있는 결과 전체를 텍스트로 접는다.
 *
 * 매번 결과 전체를 통째로 다시 읽는 쪽에서 부른다. 같은 결과가 두 번 와도
 * 같은 값이 나오므로 텍스트가 늘어나지 않는다.
 */
export function collectTranscript(chunks: readonly TranscriptChunk[]): TranscriptDraft {
  let committed = "";
  let interim = "";
  for (const chunk of chunks) {
    if (chunk.isFinal) committed = joinTranscript(committed, chunk.transcript);
    else interim = joinTranscript(interim, chunk.transcript);
  }
  return { committed, interim };
}
