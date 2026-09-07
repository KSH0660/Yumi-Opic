import type { Exam, ExamItem, Question, QuestionType, Topic } from "./types";
import { DEFAULT_SURVEY_IDS, SURVEY_BANK_VERSION, introQuestion, surveyTopics } from "../data";

export type RandomSource = () => number;

export const TYPE_LABELS: Record<QuestionType, string> = {
  intro: "자기소개",
  description: "묘사 · 2/5/8형",
  routine: "루틴 · 3형",
  experience: "최근·최초 경험 · 4/6/9형",
  memorable: "기억·문제 경험 · 7/10형",
  comparison: "비교·변화 · 14형",
  issue: "이슈·관심사 · 15형",
  roleplay_ask: "문의하기 · 11형",
  roleplay_problem: "문제 해결 · 12형",
};

export const EXAM_GROUPS = [
  { slots: [2, 5, 8], label: "묘사", note: "장소·사람·특징을 현재시제로 안정적으로 설명" },
  { slots: [3], label: "루틴", note: "평소 언제·누구와·무엇을 하는지 자연스럽게 연결" },
  { slots: [4, 6, 9], label: "최근·최초 경험", note: "단순 과거를 중심으로 시간 순서대로 설명" },
  { slots: [7, 10], label: "기억·문제 경험", note: "배경 → 사건/문제 → 행동 → 결과·감정" },
  { slots: [14], label: "비교·변화", note: "과거와 현재 또는 두 대상을 비교" },
  { slots: [15], label: "이슈·관심사", note: "현재의 문제·트렌드·중요한 점에 의견 제시" },
] as const;

export function pickRandom<T>(items: readonly T[], rng: RandomSource = Math.random): T {
  if (!items.length) throw new Error("선택 가능한 문제가 없습니다.");
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

function questionOfType(topic: Topic, type: QuestionType, rng: RandomSource): Question {
  return pickRandom(topic.questions.filter((q) => q.type === type), rng);
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
  if (enabled.length < 3) throw new Error("서베이 집중 드릴을 만들려면 주제를 3개 이상 선택해 주세요.");

  const [a, b, c] = shuffle(enabled, rng).slice(0, 3);
  const items: ExamItem[] = [
    item(2, a, questionOfType(a, "description", rng), "서베이 SET 1"),
    item(3, a, questionOfType(a, "routine", rng), "서베이 SET 1"),
    item(4, a, questionOfType(a, "experience", rng), "서베이 SET 1"),
    item(5, b, questionOfType(b, "description", rng), "서베이 SET 2"),
    item(6, b, questionOfType(b, "experience", rng), "서베이 SET 2"),
    item(7, b, questionOfType(b, "memorable", rng), "서베이 SET 2"),
    item(8, c, questionOfType(c, "description", rng), "서베이 SET 3"),
    item(9, c, questionOfType(c, "experience", rng), "서베이 SET 3"),
    item(10, c, questionOfType(c, "memorable", rng), "서베이 SET 3"),
  ];

  const comparisonTopic = pickRandom(enabled, rng);
  const issueTopic = pickRandom(enabled, rng);
  items.push(item(14, comparisonTopic, questionOfType(comparisonTopic, "comparison", rng), "고난도 서베이"));
  items.push(item(15, issueTopic, questionOfType(issueTopic, "issue", rng), "고난도 서베이"));

  if (includeIntro) {
    items.unshift({
      slot: 1,
      topicId: "intro",
      topicKo: "자기소개",
      topicEn: "Self-introduction",
      emoji: "👋",
      comboLabel: "Q1",
      typeLabel: TYPE_LABELS.intro,
      question: introQuestion,
    });
  }

  return {
    ...base("full"),
    items,
    notices: ["현재 리셋 버전은 서베이 전용입니다. 실제 시험의 11~13번 롤플레이는 의도적으로 제외했습니다."],
  };
}

const PRACTICE_TYPES: QuestionType[] = ["description", "routine", "experience", "memorable", "comparison", "issue"];

export function buildPracticeExam(topic: Topic, _count = 6, rng: RandomSource = Math.random): Exam {
  const items = PRACTICE_TYPES.map((type, index) => item(index + 1, topic, questionOfType(topic, type, rng), "주제별 6유형"));
  return { ...base("practice"), focusTopicId: topic.id, items };
}

export function buildSingleQuestion(topics: Topic[] = surveyTopics, rng: RandomSource = Math.random): Exam {
  const candidates = topics.flatMap((topic) => topic.questions.map((question) => ({ topic, question })));
  const { topic, question } = pickRandom(candidates, rng);
  return { ...base("single"), items: [item(1, topic, question, "서베이 랜덤 1문제")] };
}
