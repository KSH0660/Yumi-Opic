/**
 * AI 피드백 한 번에 드는 대략적인 비용.
 *
 * 정확한 청구액이 아니라 "이 버튼이 얼마짜리인지" 감을 주기 위한 값이다.
 * 실제로는 출력 토큰을 끝까지 쓰는 일이 드물어 여기서 나온 금액보다 적게 나온다.
 * 단가가 바뀌면 아래 RATES 만 고치면 된다.
 */
export interface CostRates {
  /** 피드백 모델 입력 100만 토큰당 USD. */
  inputPerMTok: number;
  /** 피드백 모델 출력 100만 토큰당 USD. 추론 토큰도 출력으로 청구된다. */
  outputPerMTok: number;
  /** 전사 모델 1분당 USD. */
  transcribePerMin: number;
  /** USD → KRW. 환율은 매일 움직이므로 넉넉하게 잡는다. */
  krwPerUsd: number;
}

/** 2026-09 기준 gpt-5.6-terra · gpt-transcribe 공개 단가. */
export const RATES: CostRates = {
  inputPerMTok: 2,
  outputPerMTok: 12,
  transcribePerMin: 0.0045,
  krwPerUsd: 1400,
};

/** route.ts 가 매번 함께 보내는 고정 지시문 분량. 두괄식 규칙이 붙어 500 → 700 으로 늘렸다. */
const PROMPT_OVERHEAD_TOKENS = 700;
/** route.ts 의 max_output_tokens. 추론 토큰까지 여기서 잘린다. */
const MAX_OUTPUT_TOKENS = 1_200;
/** 영어 기준 대략 4글자에 1토큰. */
const CHARS_PER_TOKEN = 4;

export interface FeedbackCostInput {
  questionChars: number;
  transcriptChars: number;
  /** 녹음본 길이(초). 0이면 전사를 건너뛰어 그만큼 싸진다. */
  audioSec: number;
}

export interface FeedbackCost {
  usd: number;
  krw: number;
  /** 전사 비용(KRW). 녹음본이 없으면 0. */
  transcribeKrw: number;
  /** 피드백 생성 비용(KRW). */
  modelKrw: number;
}

/** 이번 요청에 들 수 있는 최대 비용. 출력 토큰을 상한까지 쓴다고 본다. */
export function estimateFeedbackCost(input: FeedbackCostInput, rates: CostRates = RATES): FeedbackCost {
  const chars = Math.max(0, input.questionChars) + Math.max(0, input.transcriptChars);
  const audioSec = Math.max(0, input.audioSec);
  // 녹음본이 있으면 전사 결과도 프롬프트에 함께 들어가 받아쓰기 분량만큼 입력이 늘어난다.
  const transcriptTokens = Math.ceil(chars / CHARS_PER_TOKEN) * (audioSec > 0 ? 2 : 1);
  const inputTokens = PROMPT_OVERHEAD_TOKENS + transcriptTokens;

  const inputUsd = (inputTokens / 1_000_000) * rates.inputPerMTok;
  const outputUsd = (MAX_OUTPUT_TOKENS / 1_000_000) * rates.outputPerMTok;
  const transcribeUsd = (audioSec / 60) * rates.transcribePerMin;

  const modelKrw = (inputUsd + outputUsd) * rates.krwPerUsd;
  const transcribeKrw = transcribeUsd * rates.krwPerUsd;
  return {
    usd: inputUsd + outputUsd + transcribeUsd,
    krw: modelKrw + transcribeKrw,
    modelKrw,
    transcribeKrw,
  };
}

/** 화면에 쓸 원화 표기. 1원보다 적으면 자리수를 살려 준다. */
export function formatKrw(krw: number): string {
  if (!Number.isFinite(krw) || krw <= 0) return "0원";
  if (krw < 1) return `${krw.toFixed(2)}원`;
  if (krw < 10) return `${krw.toFixed(1)}원`;
  return `${Math.round(krw).toLocaleString("ko-KR")}원`;
}
