import type { QuestionType, ScoreBreakdown, ScoreResult } from "./types";

/* ------------------------------------------------------------------ */
/* 신호 표현 사전                                                        */
/* ------------------------------------------------------------------ */

const CONNECTORS = [
  "because", "so", "but", "however", "also", "actually", "for example",
  "for instance", "that's why", "first of all", "then",
  "after that", "finally", "in addition", "besides", "though", "although",
  "since", "while", "especially", "anyway", "to be honest", "as a result",
  "on top of that", "in fact", "basically", "overall", "at the same time",
  "meanwhile", "therefore", "plus", "which is why", "not only", "as well",
  "in the end", "eventually", "on the other hand", "even though", "such as",
];

const SEQUENCE = [
  "first", "then", "after that", "next", "finally", "in the end", "at first",
  "later", "eventually", "before that", "afterwards", "once i", "as soon as",
  "to begin with", "lastly", "meanwhile",
];

const FREQUENCY = [
  "usually", "often", "always", "sometimes", "normally", "generally",
  "rarely", "seldom", "every day", "every morning", "every night",
  "every week", "every weekend", "once a week", "twice a week",
  "three times a week", "a couple of times", "most of the time",
  "from time to time", "occasionally", "on weekdays", "on weekends",
  "typically", "regularly", "tend to", "these days", "whenever", "hardly ever",
  "day in and day out", "as a rule",
];

const PAST_IRREGULAR = [
  "went", "was", "were", "had", "did", "saw", "took", "came", "got", "made",
  "said", "told", "found", "thought", "felt", "became", "left", "brought",
  "bought", "gave", "knew", "ran", "met", "spent", "held", "kept", "began",
  "broke", "chose", "drove", "ate", "fell", "forgot", "grew", "heard", "lost",
  "paid", "put", "sat", "slept", "spoke", "stood", "understood", "wore", "won",
  "wrote", "could", "would", "flew", "sent", "built", "caught", "taught",
];

const TIME_MARKERS = [
  "ago", "last year", "last week", "last summer", "last winter", "last month",
  "last weekend", "when i was", "back then", "at that time", "one day",
  "the other day", "a while back", "used to", "a few years ago",
  "a couple of years ago", "yesterday", "that day", "growing up",
  "in high school", "in college", "during my", "at the time",
];

const DESCRIPTIVE = [
  "huge", "tiny", "spacious", "cozy", "crowded", "quiet", "peaceful", "modern",
  "beautiful", "clean", "comfortable", "bright", "dark", "colorful", "amazing",
  "incredible", "relaxing", "noisy", "narrow", "wide", "fancy", "simple",
  "gorgeous", "stunning", "convenient", "impressive", "warm", "fresh",
  "gigantic", "old-fashioned", "well-lit", "well-organized", "packed",
  "spotless", "charming", "lively", "breathtaking", "decent", "massive",
];

const SPATIAL = [
  "there is", "there are", "next to", "in the corner", "on the left",
  "on the right", "across from", "in front of", "behind", "in the middle",
  "surrounded by", "along the", "upstairs", "downstairs", "at the end of",
  "on the wall", "by the window", "right next", "on the other side",
  "as soon as you walk in", "facing", "overlooking",
];

const POLITE_REQUEST = [
  "could you", "could i", "can i", "may i", "would it be possible",
  "i was wondering", "i'd like to know", "i would like to", "i'm calling to",
  "would you mind", "if you don't mind", "i'd appreciate",
];

const QUESTION_STARTERS = [
  "can i", "could you", "could i", "do you", "does it", "is there",
  "are there", "what time", "how much", "how long", "how many", "when is",
  "where is", "would it be", "may i", "what kind of", "is it possible",
  "what about", "how do i", "do i need",
];

const PROBLEM_STATE = [
  "the problem is", "i'm afraid", "unfortunately", "something came up",
  "there's a problem", "there is a problem", "it turns out", "i just found out",
  "the thing is", "i have a situation", "let me explain", "i'm calling because",
  "it's not working", "doesn't work", "i can't make it", "i won't be able to",
];

const SUGGESTION = [
  "how about", "what if", "would it be possible", "could we", "maybe we could",
  "i was wondering if", "instead", "alternatively", "another option",
  "or we could", "let me know", "i'd appreciate it", "one option would be",
  "the other option", "if that doesn't work", "in that case", "either way",
  "would you be able to", "is there any chance",
];

const OPINION = [
  "i think", "in my opinion", "i believe", "i'd say", "i would say",
  "personally", "if you ask me", "i feel like", "from my point of view",
  "to me", "i guess", "i'm convinced", "it seems to me", "as far as i know",
  "i'd have to say",
];

const COMPARE_CHANGE = [
  "used to", "compared to", "whereas", "on the other hand", "unlike",
  "in the past", "these days", "nowadays", "back then", "much more",
  "far less", "the biggest difference", "similar to", "different from",
  "rather than", "has changed", "have changed", "is changing", "more and more",
  "less and less", "than it used to", "shifted", "trend", "over the years",
  "while", "meanwhile", "not only", "the main reason",
];

const INTRO_MARKERS = [
  "my name is", "i'm currently", "i work", "i'm a", "i live in",
  "in my free time", "i've been", "i graduated", "let me tell you about myself",
  "that's pretty much it", "i'd describe myself as",
];

const COMPLEXITY = [
  "because", "which", "that", "when", "if", "so that", "although", "though",
  "while", "since", "after", "before", "who", "whether", "even though",
  "in order to", "as if", "unless",
];

/* ------------------------------------------------------------------ */
/* 유형별 목표치                                                        */
/* ------------------------------------------------------------------ */

interface Signal {
  label: string;
  list: string[];
  per: number;
  cap: number;
}

const WORD_TARGET: Record<QuestionType, { min: number; ideal: number }> = {
  intro: { min: 45, ideal: 95 },
  description: { min: 70, ideal: 130 },
  routine: { min: 70, ideal: 130 },
  experience: { min: 85, ideal: 160 },
  memorable: { min: 90, ideal: 170 },
  roleplay_ask: { min: 45, ideal: 90 },
  roleplay_problem: { min: 60, ideal: 120 },
  issue: { min: 95, ideal: 175 },
  comparison: { min: 95, ideal: 175 },
};

const TYPE_SIGNALS: Record<QuestionType, Signal[]> = {
  intro: [{ label: "자기소개 표현", list: INTRO_MARKERS, per: 6, cap: 25 }],
  description: [
    { label: "묘사 형용사", list: DESCRIPTIVE, per: 3, cap: 12 },
    { label: "위치·존재 표현", list: SPATIAL, per: 3.5, cap: 13 },
  ],
  routine: [
    { label: "빈도 표현", list: FREQUENCY, per: 3, cap: 15 },
    { label: "순서 표현", list: SEQUENCE, per: 2.5, cap: 10 },
  ],
  experience: [
    { label: "시점 표현", list: TIME_MARKERS, per: 3.5, cap: 8 },
    { label: "이야기 전개 표현", list: SEQUENCE, per: 2.5, cap: 7 },
  ],
  memorable: [
    { label: "시점 표현", list: TIME_MARKERS, per: 3.5, cap: 8 },
    { label: "이야기 전개 표현", list: SEQUENCE, per: 2.5, cap: 7 },
  ],
  roleplay_ask: [
    { label: "정중한 요청 표현", list: POLITE_REQUEST, per: 3.5, cap: 10 },
    { label: "질문 형태", list: QUESTION_STARTERS, per: 3, cap: 15 },
  ],
  roleplay_problem: [
    { label: "상황 설명 표현", list: PROBLEM_STATE, per: 3, cap: 9 },
    { label: "대안 제안 표현", list: SUGGESTION, per: 4, cap: 16 },
  ],
  issue: [
    { label: "변화·비교 표현", list: COMPARE_CHANGE, per: 3, cap: 15 },
    { label: "의견 표현", list: OPINION, per: 3.5, cap: 10 },
  ],
  comparison: [
    { label: "변화·비교 표현", list: COMPARE_CHANGE, per: 3, cap: 15 },
    { label: "의견 표현", list: OPINION, per: 3.5, cap: 10 },
  ],
};

/* ------------------------------------------------------------------ */
/* 텍스트 분석 도구                                                     */
/* ------------------------------------------------------------------ */

const HANGUL = /[가-힣ㄱ-ㆎ]/;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 표현 목록 중 실제로 등장한 것만 돌려준다.
 * - 단어 경계로 매칭한다 ("also" 안의 "so" 같은 오탐 방지)
 * - 더 긴 표현에 포함되는 짧은 표현은 중복 계산하지 않는다 ("at first" / "first")
 */
function hits(lower: string, list: string[]): string[] {
  const found: string[] = [];
  for (const raw of list) {
    const phrase = raw.trim();
    if (!phrase) continue;
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`);
    if (re.test(lower)) found.push(phrase);
  }
  return found.filter(
    (p) => !found.some((other) => other !== p && other.includes(p)),
  );
}

function countPastTense(lower: string): number {
  const words = lower.match(/[a-z']+/g) ?? [];
  let count = 0;
  for (const w of words) {
    if (PAST_IRREGULAR.includes(w)) count++;
    else if (/^[a-z]{3,}ed$/.test(w)) count++;
  }
  return count;
}

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/* ------------------------------------------------------------------ */
/* 등급 추정                                                            */
/* ------------------------------------------------------------------ */

function estimateLevel(total: number): { level: string; note: string } {
  if (total >= 88) return { level: "AL 도전권", note: "분량·구조·표현이 모두 안정적입니다. 실전에서는 발화 속도와 자연스러움이 마지막 관문이에요." };
  if (total >= 76) return { level: "IH 권장권", note: "IH에 필요한 길이와 논리가 나옵니다. 고난도(14·15번)에서 한 번 더 밀어붙이면 AL이 보입니다." };
  if (total >= 63) return { level: "IM3 ~ IH 경계", note: "내용은 충분한데 연결어와 유형별 필수 표현이 조금씩 빕니다. 그 부분만 채우면 IH입니다." };
  if (total >= 50) return { level: "IM2 ~ IM3", note: "핵심은 말하고 있지만 아직 짧고 단조롭습니다. 문장마다 이유·예시를 한 줄씩 덧붙여 보세요." };
  if (total >= 35) return { level: "IL ~ IM1", note: "답변 길이를 먼저 늘리는 게 가장 빠른 개선입니다. 목표 단어 수를 채우는 연습부터 하세요." };
  return { level: "NH ~ IL", note: "아직 문장 수가 많이 부족합니다. 한 문항당 최소 6~8문장을 목표로 시작해 보세요." };
}

/* ------------------------------------------------------------------ */
/* 채점 본체                                                            */
/* ------------------------------------------------------------------ */

export function scoreAnswer(rawText: string, type: QuestionType): ScoreResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  const wordCount = words.length;
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  const sentenceCount = Math.max(sentences.length, wordCount > 0 ? 1 : 0);
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  const lowered = words.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lowered);
  const uniqueRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  const good: string[] = [];
  const improve: string[] = [];
  const breakdown: ScoreBreakdown[] = [];

  /* 1. 분량 (30점) */
  const target = WORD_TARGET[type];
  const lengthScore = clamp(Math.round((wordCount / target.ideal) * 30), 0, 30);
  breakdown.push({
    key: "length",
    label: "분량",
    score: lengthScore,
    max: 30,
    comment: `${wordCount}단어 / 목표 ${target.ideal}단어 (최소 ${target.min}단어)`,
  });
  if (wordCount >= target.ideal) good.push(`분량이 충분합니다 (${wordCount}단어).`);
  else if (wordCount >= target.min) improve.push(`조금만 더 늘려 보세요. ${target.ideal}단어까지 ${target.ideal - wordCount}단어 남았습니다.`);
  else improve.push(`분량이 부족합니다. 최소 ${target.min}단어는 채워야 합니다 (현재 ${wordCount}단어).`);

  /* 2. 유형 적합성 (25점) */
  let typeScore = 0;
  const typeComments: string[] = [];

  for (const signal of TYPE_SIGNALS[type]) {
    const matched = hits(lower, signal.list);
    const sub = clamp(matched.length * signal.per, 0, signal.cap);
    typeScore += sub;
    typeComments.push(`${signal.label} ${matched.length}개`);
    if (sub >= signal.cap * 0.7) good.push(`${signal.label}을(를) 잘 활용했습니다.`);
    else improve.push(`${signal.label}이(가) 부족합니다. (예: ${signal.list.slice(0, 3).join(", ")})`);
  }

  // 경험 유형은 과거 시제 사용량을 따로 본다
  if (type === "experience" || type === "memorable") {
    const pastCount = countPastTense(lower);
    const pastScore = clamp(pastCount * 1.2, 0, 10);
    typeScore += pastScore;
    typeComments.push(`과거시제 ${pastCount}회`);
    if (pastCount >= 8) good.push("과거 시제를 일관되게 유지했습니다.");
    else improve.push("경험 문항은 과거 시제가 핵심입니다. went, was, did, -ed 형태를 더 쓰세요.");
  }

  // 롤플레이 질문하기는 실제 물음표 개수를 본다
  if (type === "roleplay_ask") {
    const qCount = countQuestions(text);
    const qScore = qCount >= 3 ? 10 : clamp(qCount * 3.3, 0, 10);
    typeScore += qScore;
    typeComments.push(`질문 ${qCount}개`);
    if (qCount >= 3) good.push(`질문을 ${qCount}개 던졌습니다 (3~4개가 권장 범위).`);
    else improve.push(`질문이 ${qCount}개뿐입니다. 최소 3개는 물어봐야 합니다.`);
  }

  // 문제 해결은 대안 개수를 본다
  if (type === "roleplay_problem") {
    const altCount = hits(lower, ["how about", "or we could", "another option", "alternatively", "instead", "what if", "the other option", "or i could"]).length;
    const altScore = clamp(altCount * 3.3, 0, 10);
    typeScore += altScore;
    typeComments.push(`대안 표현 ${altCount}개`);
    if (altCount >= 2) good.push("대안을 두 가지 이상 제시했습니다.");
    else improve.push("문제 해결 문항은 대안을 2~3개 제시해야 만점권입니다.");
  }

  const typeScoreFinal = clamp(Math.round(typeScore), 0, 25);
  breakdown.push({
    key: "typeFit",
    label: "유형 적합성",
    score: typeScoreFinal,
    max: 25,
    comment: typeComments.join(" · "),
  });

  /* 3. 연결어 (20점) */
  const connectorHits = hits(lower, CONNECTORS);
  const cohesionScore = clamp(Math.round(connectorHits.length * 3.4), 0, 20);
  breakdown.push({
    key: "cohesion",
    label: "연결어 · 담화 표지",
    score: cohesionScore,
    max: 20,
    comment: connectorHits.length > 0 ? connectorHits.slice(0, 8).join(", ") : "연결어가 감지되지 않았습니다",
  });
  if (connectorHits.length >= 5) good.push(`연결어를 ${connectorHits.length}종류 사용했습니다.`);
  else improve.push("because / so / actually / for example / that's why 같은 연결어를 더 섞으세요. 채점자가 가장 먼저 듣는 부분입니다.");

  /* 4. 어휘 다양성 (15점) */
  const lengthWeight = clamp(wordCount / target.min, 0, 1);
  const varietyRaw = ((uniqueRatio - 0.3) / 0.25) * 15 * lengthWeight;
  const varietyScore = clamp(Math.round(varietyRaw), 0, 15);
  breakdown.push({
    key: "variety",
    label: "어휘 다양성",
    score: varietyScore,
    max: 15,
    comment: `서로 다른 단어 ${uniqueWords.size}개 / 전체 ${wordCount}단어 (비율 ${(uniqueRatio * 100).toFixed(0)}%)`,
  });
  if (uniqueRatio >= 0.55 && wordCount >= target.min) good.push("같은 단어 반복 없이 어휘를 다양하게 썼습니다.");
  else if (wordCount >= target.min) improve.push("같은 단어가 반복됩니다. 동의어나 조금 더 구체적인 단어로 바꿔 보세요.");

  /* 5. 문장 구조 (10점) */
  const complexityHits = hits(lower, COMPLEXITY);
  let structureScore = 0;
  if (avgSentenceLength >= 9 && avgSentenceLength <= 22) structureScore += 6;
  else if (avgSentenceLength >= 6 && avgSentenceLength <= 28) structureScore += 4;
  else if (wordCount > 0) structureScore += 2;
  structureScore += clamp(complexityHits.length, 0, 4);
  const structureFinal = clamp(Math.round(structureScore), 0, 10);
  breakdown.push({
    key: "structure",
    label: "문장 구조",
    score: structureFinal,
    max: 10,
    comment: `문장 ${sentenceCount}개 · 평균 ${avgSentenceLength.toFixed(1)}단어 · 복문 표현 ${complexityHits.length}종`,
  });
  if (avgSentenceLength > 28) improve.push("한 문장이 너무 깁니다. 마침표를 찍고 끊어 말하는 게 더 잘 들립니다.");
  if (avgSentenceLength > 0 && avgSentenceLength < 9) improve.push("문장이 짧고 단조롭습니다. because나 which로 한 번씩 이어 붙여 보세요.");

  let total = breakdown.reduce((sum, b) => sum + b.score, 0);

  /* 한국어가 섞였으면 감점 */
  if (HANGUL.test(text)) {
    total = Math.round(total * 0.6);
    improve.unshift("답변에 한국어가 섞여 있습니다. 실전은 영어로만 말해야 하므로 크게 감점했습니다.");
  }

  total = clamp(Math.round(total), 0, 100);
  const { level, note } = estimateLevel(total);

  return {
    total,
    level,
    levelNote: note,
    breakdown,
    good: good.slice(0, 5),
    improve: improve.slice(0, 5),
    stats: {
      words: wordCount,
      sentences: sentenceCount,
      avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
      uniqueRatio: Number(uniqueRatio.toFixed(2)),
      connectors: connectorHits,
    },
  };
}

/** 여러 문항 점수를 평균 내 시험 전체 결과를 만든다 */
export function summarizeExam(scores: ScoreResult[]): {
  average: number;
  level: string;
  levelNote: string;
  totalWords: number;
} {
  if (scores.length === 0) {
    return { average: 0, level: "-", levelNote: "채점된 답변이 없습니다.", totalWords: 0 };
  }
  const average = Math.round(
    scores.reduce((sum, s) => sum + s.total, 0) / scores.length,
  );
  const { level, note } = estimateLevel(average);
  return {
    average,
    level,
    levelNote: note,
    totalWords: scores.reduce((sum, s) => sum + s.stats.words, 0),
  };
}
