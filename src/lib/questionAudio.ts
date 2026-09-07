/**
 * 미리 만들어 둔 문제 낭독 파일을 찾는다.
 *
 * 문제은행은 고정돼 있으므로 `npm run tts` 로 한 번 mp3 를 만들어
 * `public/audio/<문항 id>.mp3` 로 넣어 둔다. 브라우저 낭독보다 훨씬 사람에
 * 가깝고, 기기가 달라도 같은 목소리로 들리며, 재생 중 비용도 들지 않는다.
 *
 * 아직 만들지 않은 문항은 여기서 null 이 나가고 `./speech` 가 브라우저 낭독으로
 * 돌아간다. 그래서 mp3 가 하나도 없어도 앱은 그대로 돌아간다.
 */
import manifest from "../data/audio-manifest.json";

/** 문항 id → 지문 해시. 지문이나 목소리 설정이 바뀌면 해시도 바뀐다. */
const recorded = manifest.questions as Record<string, string>;

export function questionAudioUrl(id?: string | null): string | null {
  if (!id) return null;
  const hash = recorded[id];
  if (!hash) return null;
  // 해시를 붙여 두면 같은 이름으로 다시 만든 파일이 캐시에 막히지 않는다.
  return `/audio/${encodeURIComponent(id)}.mp3?v=${hash}`;
}

/** 낭독 파일이 준비된 문항 수. 설정 화면이나 테스트에서 쓴다. */
export function recordedQuestionCount(): number {
  return Object.keys(recorded).length;
}
