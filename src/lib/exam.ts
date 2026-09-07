import type { Exam, ExamItem, Question, QuestionType, Topic } from "./types";
import {
  advancedTopics,
  introQuestion,
  roleplayTopics,
  surpriseTopics,
  surveyTopics,
} from "@/data";

/**
 * 15문항 슬롯 설계.
 * 사용자가 정리한 실제 OPIc 콤보 구조를 그대로 옮겼다.
 *  - 2/3/4  : 서베이 주제 A (묘사 → 루틴 → 과거 경험)
 *  - 5/6/7  : 서베이 주제 B (묘사 → 과거 경험 → 가장 기억에 남는 경험)
 *  - 8/9/10 : 돌발 주제 C  (묘사 → 과거 경험 → 가장 기억에 남는 경험)
 *  - 11/12/13: 롤플레이 D (질문하기 → 문제 해결 → 관련 경험)
 *  - 14/15  : 고난도 E (이슈·변화 → 비교·전망)
 */
export interface SlotSpec {
  slot: number;
  type: QuestionType;
  combo: "A" | "B" | "C" | "D" | "E";
  comboLabel: string;
  typeLabel: string;
}

export const SLOT_PLAN: SlotSpec[] = [
  { slot: 2, type: "description", combo: "A", comboLabel: "콤보 1 · 서베이", typeLabel: "묘사" },
  { slot: 3, type: "routine", combo: "A", comboLabel: "콤보 1 · 서베이", typeLabel: "활동 루틴" },
  { slot: 4, type: "experience", combo: "A", comboLabel: "콤보 1 · 서베이", typeLabel: "과거 경험" },
  { slot: 5, type: "description", combo: "B", comboLabel: "콤보 2 · 서베이", typeLabel: "묘사" },
  { slot: 6, type: "experience", combo: "B", comboLabel: "콤보 2 · 서베이", typeLabel: "과거 경험" },
  { slot: 7, type: "memorable", combo: "B", comboLabel: "콤보 2 · 서베이", typeLabel: "가장 기억에 남는 경험" },
  { slot: 8, type: "description", combo: "C", comboLabel: "콤보 3 · 돌발", typeLabel: "묘사" },
  { slot: 9, type: "experience", combo: "C", comboLabel: "콤보 3 · 돌발", typeLabel: "과거 경험" },
  { slot: 10, type: "memorable", combo: "C", comboLabel: "콤보 3 · 돌발", typeLabel: "가장 기억에 남는 경험" },
  { slot: 11, type: "roleplay_ask", combo: "D", comboLabel: "콤보 4 · 롤플레이", typeLabel: "롤플레이 · 질문하기" },
  { slot: 12, type: "roleplay_problem", combo: "D", comboLabel: "콤보 4 · 롤플레이", typeLabel: "롤플레이 · 문제 해결" },
  { slot: 13, type: "memorable", combo: "D", comboLabel: "콤보 4 · 롤플레이", typeLabel: "롤플레이 · 관련 경험" },
  { slot: 14, type: "issue", combo: "E", comboLabel: "콤보 5 · 고난도", typeLabel: "이슈 · 변화" },
  { slot: 15, type: "comparison", combo: "E", comboLabel: "콤보 5 · 고난도", typeLabel: "비교 · 전망" },
];

export const TYPE_LABELS: Record<QuestionType, string> = {
  intro: "자기소개",
  description: "묘사",
  routine: "활동 루틴",
  experience: "과거 경험",
  memorable: "가장 기억에 남는 경험",
  roleplay_ask: "롤플레이 · 질문하기",
  roleplay_problem: "롤플레이 · 문제 해결",
  issue: "이슈 · 변화",
  comparison: "비교 · 전망",
};

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}


export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function questionsOfType(topic: Topic, type: QuestionType): Question[] {
  return topic.questions.filter((q) => q.type === type);
}

/** 주어진 유형을 모두 갖춘 주제만 남긴다 */
function topicsSupporting(topics: Topic[], types: QuestionType[]): Topic[] {
  return topics.filter((t) => types.every((ty) => questionsOfType(t, ty).length > 0));
}

function buildCombo(
  topic: Topic,
  specs: SlotSpec[],
  /** 주제에 해당 유형이 아예 없을 때 문항을 빌려올 같은 분류의 주제들 */
  siblings: Topic[],
): ExamItem[] {
  /** 같은 주제 안에서 같은 문제가 두 번 나오지 않게 막는다 */
  const used = new Set<string>();
  return specs.map((spec) => {
    const ofType = questionsOfType(topic, spec.type);
    const unused = ofType.filter((q) => !used.has(q.id));
    // 1) 이 주제에서 아직 안 쓴 문항 → 2) 이 주제의 같은 유형(중복 허용)
    // → 3) 같은 분류의 다른 주제에서 빌려온 문항 → 4) 최후로 이 주제의 아무 문항.
    // 유형이 빠진 주제가 은행에 추가되더라도 빈 슬롯이 생기지 않게 한다.
    const borrowed = siblings.flatMap((t) => questionsOfType(t, spec.type));
    const candidates =
      unused.length > 0
        ? unused
        : ofType.length > 0
          ? ofType
          : borrowed.length > 0
            ? borrowed
            : topic.questions;
    const question = pickRandom(candidates);
    used.add(question.id);
    return {
      slot: spec.slot,
      topicId: topic.id,
      topicKo: topic.ko,
      topicEn: topic.en,
      emoji: topic.emoji,
      comboLabel: spec.comboLabel,
      typeLabel: spec.typeLabel,
      question,
    };
  });
}

export interface BuildExamOptions {
  /** 서베이에서 선택한 주제 id 목록. 비어 있으면 전체 서베이 주제를 사용한다. */
  enabledSurveyIds?: string[];
  /** 1번 자기소개를 포함할지 */
  includeIntro?: boolean;
}

/** 15문항(기본은 2~15번) 모의고사 한 세트를 새로 뽑는다 */
export function buildFullExam(options: BuildExamOptions = {}): Exam {
  const { enabledSurveyIds, includeIntro = false } = options;

  const surveyPool =
    enabledSurveyIds && enabledSurveyIds.length > 0
      ? surveyTopics.filter((t) => enabledSurveyIds.includes(t.id))
      : surveyTopics;

  const comboASpecs = SLOT_PLAN.filter((s) => s.combo === "A");
  const comboBSpecs = SLOT_PLAN.filter((s) => s.combo === "B");
  const comboCSpecs = SLOT_PLAN.filter((s) => s.combo === "C");
  const comboDSpecs = SLOT_PLAN.filter((s) => s.combo === "D");
  const comboESpecs = SLOT_PLAN.filter((s) => s.combo === "E");

  const aCandidates = topicsSupporting(surveyPool, comboASpecs.map((s) => s.type));
  const bCandidatesAll = topicsSupporting(surveyPool, comboBSpecs.map((s) => s.type));

  const topicA = pickRandom(aCandidates.length > 0 ? aCandidates : surveyPool);
  // 콤보 1과 콤보 2는 서로 다른 주제로 (주제가 하나뿐이면 어쩔 수 없이 같은 주제를 쓴다)
  const bFiltered = bCandidatesAll.filter((t) => t.id !== topicA.id);
  const topicB = pickRandom(bFiltered.length > 0 ? bFiltered : bCandidatesAll);

  const cCandidates = topicsSupporting(surpriseTopics, comboCSpecs.map((s) => s.type));
  const topicC = pickRandom(cCandidates.length > 0 ? cCandidates : surpriseTopics);

  const dCandidates = topicsSupporting(roleplayTopics, comboDSpecs.map((s) => s.type));
  const topicD = pickRandom(dCandidates.length > 0 ? dCandidates : roleplayTopics);

  const eCandidates = topicsSupporting(advancedTopics, comboESpecs.map((s) => s.type));
  const topicE = pickRandom(eCandidates.length > 0 ? eCandidates : advancedTopics);

  const items: ExamItem[] = [
    ...buildCombo(topicA, comboASpecs, surveyTopics),
    ...buildCombo(topicB, comboBSpecs, surveyTopics),
    ...buildCombo(topicC, comboCSpecs, surpriseTopics),
    ...buildCombo(topicD, comboDSpecs, roleplayTopics),
    ...buildCombo(topicE, comboESpecs, advancedTopics),
  ];

  if (includeIntro) {
    items.unshift({
      slot: 1,
      topicId: "intro",
      topicKo: "자기소개",
      topicEn: "Self-introduction",
      emoji: "🙋",
      comboLabel: "1번",
      typeLabel: "자기소개",
      question: introQuestion,
    });
  }

  return {
    id: `exam-${Date.now()}`,
    createdAt: Date.now(),
    mode: "full",
    items: items.sort((a, b) => a.slot - b.slot),
  };
}

/** 주제 하나만 골라 그 주제의 문제를 셔플해서 연습한다 */
export function buildPracticeExam(topic: Topic, count = 5): Exam {
  const picked = shuffle(topic.questions).slice(0, Math.min(count, topic.questions.length));
  return {
    id: `practice-${topic.id}-${Date.now()}`,
    createdAt: Date.now(),
    mode: "practice",
    focusTopicId: topic.id,
    items: picked.map((question, i) => ({
      slot: i + 1,
      topicId: topic.id,
      topicKo: topic.ko,
      topicEn: topic.en,
      emoji: topic.emoji,
      comboLabel: topic.ko,
      typeLabel: TYPE_LABELS[question.type],
      question,
    })),
  };
}

/** 전체 문제 은행에서 아무거나 한 문제 */
export function buildSingleQuestion(topics: Topic[]): Exam {
  const withQuestions = topics.filter((t) => t.questions.length > 0);
  const topic = pickRandom(withQuestions);
  const question = pickRandom(topic.questions);
  return {
    id: `single-${question.id}-${Date.now()}`,
    createdAt: Date.now(),
    mode: "single",
    items: [
      {
        slot: 1,
        topicId: topic.id,
        topicKo: topic.ko,
        topicEn: topic.en,
        emoji: topic.emoji,
        comboLabel: topic.ko,
        typeLabel: TYPE_LABELS[question.type],
        question,
      },
    ],
  };
}
