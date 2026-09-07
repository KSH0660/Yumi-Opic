import type { Exam, ExamItem, Question, QuestionType, Topic } from "./types";
import { DEFAULT_SURVEY_IDS, SURVEY_BANK_VERSION, introQuestion, surveyTopics } from "../data";

export type RandomSource = () => number;

export const TYPE_LABELS: Record<QuestionType, string> = {
  intro: "자기소개 · 1번",
  description: "묘사 · 2·5·8번",
  routine: "습관 · 3번",
  experience: "경험 · 4·6·9번",
  memorable: "기억에 남는 경험 · 7·10번",
  comparison: "비교 · 14번",
  issue: "이슈 · 15번",
  roleplay_ask: "롤플레이 질문하기 · 11번",
  roleplay_problem: "롤플레이 문제 해결 · 12번",
  roleplay_experience: "롤플레이 관련 경험 · 13번",
};

export const EXAM_GROUPS = [
  { slots: [2, 5, 8], label: "묘사", note: "장소나 사람의 특징을 현재 시제로 안정적으로 설명합니다." },
  { slots: [3], label: "습관", note: "평소 언제, 누구와, 무엇을 하는지 자연스럽게 이어서 말합니다." },
  { slots: [4, 6, 9], label: "경험", note: "과거 시제를 중심으로 있었던 일을 시간 순서대로 풀어냅니다." },
  { slots: [7, 10], label: "기억에 남는 경험", note: "배경 → 사건 → 행동 → 결과와 감정 순서로 이야기합니다." },
  { slots: [11], label: "롤플레이 질문하기", note: "상황을 짧게 밝힌 뒤 필요한 정보를 3~4가지 질문합니다." },
  { slots: [12], label: "롤플레이 문제 해결", note: "문제 상황을 설명하고 해결책이나 대안을 2~3가지 제안합니다." },
  { slots: [13], label: "롤플레이 관련 경험", note: "11~12번과 이어지는 실제 경험을 배경 → 문제 → 해결 → 결과로 말합니다." },
  { slots: [14], label: "비교", note: "과거와 현재, 또는 두 대상의 공통점과 차이점을 짚습니다." },
  { slots: [15], label: "이슈", note: "요즘의 문제나 변화에 대해 내 의견을 근거와 함께 말합니다." },
] as const;

export function pickRandom<T>(items: readonly T[], rng: RandomSource = Math.random): T {
  if (!items.length) throw new Error("고를 수 있는 문제가 없습니다.");
  const r = rng();
  if (!Number.isFinite(r) || r < 0 || r >= 1) throw new RangeError("Random source must return a number in [0, 1).");
  return items[Math.floor(r * items.length)];
}

export function shuffle<T>(items: readonly T[], rng: RandomSource = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const r = rng();
    if (!Number.isFinite(r) || r < 0 || r >= 1) throw new RangeError("Invalid random source.");
    const j = Math.floor(r * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function verifiedQuestions(topic: Topic): Question[] {
  return topic.questions.filter((q) => q.source === "verified");
}

function questionOfType(topic: Topic, type: QuestionType, rng: RandomSource): Question {
  const typed = topic.questions.filter((q) => q.type === type);
  const verified = typed.filter((q) => q.source === "verified");
  return pickRandom(verified.length ? verified : typed, rng);
}

function item(slot: number, topic: Topic, question: Question, comboLabel: string): ExamItem {
  return {
    slot,
    topicId: topic.id,
    topicKo: topic.ko,
    topicEn: topic.en,
    emoji: topic.emoji,
    comboLabel,
    typeLabel: TYPE_LABELS[question.type],
    question,
  };
}

let serial = 0;
function base(mode: Exam["mode"]): Pick<Exam, "id" | "createdAt" | "mode" | "bankVersion"> {
  return {
    id: `${mode}-${Date.now()}-${++serial}`,
    createdAt: Date.now(),
    mode,
    bankVersion: SURVEY_BANK_VERSION,
  };
}

export interface BuildExamOptions {
  enabledSurveyIds?: string[];
  includeIntro?: boolean;
  rng?: RandomSource;
}

export function buildFullExam(options: BuildExamOptions = {}): Exam {
  const { includeIntro = true, rng = Math.random } = options;
  const requested = [...new Set(options.enabledSurveyIds ?? DEFAULT_SURVEY_IDS)];
  const enabled = surveyTopics.filter((topic) => requested.includes(topic.id));
  if (enabled.length < 3) throw new Error("실전 모의고사를 만들려면 서베이 주제를 3개 이상 선택해 주세요.");

  const [a, b, c] = shuffle(enabled, rng).slice(0, 3);
  const items: ExamItem[] = [
    item(2, a, questionOfType(a, "description", rng), "세트 1"),
    item(3, a, questionOfType(a, "routine", rng), "세트 1"),
    item(4, a, questionOfType(a, "experience", rng), "세트 1"),
    item(5, b, questionOfType(b, "description", rng), "세트 2"),
    item(6, b, questionOfType(b, "experience", rng), "세트 2"),
    item(7, b, questionOfType(b, "memorable", rng), "세트 2"),
    item(8, c, questionOfType(c, "description", rng), "세트 3"),
    item(9, c, questionOfType(c, "experience", rng), "세트 3"),
    item(10, c, questionOfType(c, "memorable", rng), "세트 3"),
  ];

  const roleplayTopic = pickRandom(enabled, rng);
  items.push(item(11, roleplayTopic, questionOfType(roleplayTopic, "roleplay_ask", rng), "롤플레이 세트"));
  items.push(item(12, roleplayTopic, questionOfType(roleplayTopic, "roleplay_problem", rng), "롤플레이 세트"));
  items.push(item(13, roleplayTopic, questionOfType(roleplayTopic, "roleplay_experience", rng), "롤플레이 세트"));

  const comparisonTopic = pickRandom(enabled, rng);
  const issueTopic = pickRandom(enabled, rng);
  items.push(item(14, comparisonTopic, questionOfType(comparisonTopic, "comparison", rng), "어드밴스"));
  items.push(item(15, issueTopic, questionOfType(issueTopic, "issue", rng), "어드밴스"));

  if (includeIntro) {
    items.unshift({
      slot: 1,
      topicId: "intro",
      topicKo: "자기소개",
      topicEn: "Self-introduction",
      emoji: "👋",
      comboLabel: "자기소개",
      typeLabel: TYPE_LABELS.intro,
      question: introQuestion,
    });
  }

  return {
    ...base("full"),
    items,
    notices: ["기출 복원 기반 문항을 먼저 출제하고, 선택한 주제에 그 유형의 복원 문항이 없을 때만 출제 유형 기반 문항으로 채웁니다.", "11~13번은 실제 시험처럼 한 주제에서 질문하기 → 문제 해결 → 관련 경험으로 이어지는 롤플레이 세트입니다."],
  };
}

const PRACTICE_TYPES: QuestionType[] = [
  "description", "routine", "experience", "memorable",
  "roleplay_ask", "roleplay_problem", "roleplay_experience", "comparison", "issue",
];

/** 같은 유형은 한 문항만 뽑고, 복원 문항이 없는 유형도 빠뜨리지 않는다. */
export function selectPracticeQuestions(topic: Topic, rng: RandomSource = Math.random): Question[] {
  return PRACTICE_TYPES.filter((type) => topic.questions.some((q) => q.type === type))
    .map((type) => questionOfType(topic, type, rng));
}

export function buildPracticeExam(topic: Topic, rng: RandomSource = Math.random): Exam {
  const questions = selectPracticeQuestions(topic, rng);
  if (!questions.length) throw new Error("이 주제에는 아직 연습할 문항이 없습니다.");
  const items = questions.map((question, index) => item(index + 1, topic, question, "주제별 연습"));
  return { ...base("practice"), focusTopicId: topic.id, items,
    notices: ["각 유형에서 한 문항씩 연습합니다. 원하는 문항만 답변하고 나머지는 건너뛸 수 있습니다."] };
}

export function buildSingleQuestion(topics: Topic[] = surveyTopics, rng: RandomSource = Math.random): Exam {
  const candidates = topics.flatMap((topic) => verifiedQuestions(topic).map((question) => ({ topic, question })));
  const { topic, question } = pickRandom(candidates, rng);
  return { ...base("single"), items: [item(1, topic, question, "1문제 연습")] };
}
