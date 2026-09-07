import type { Exam, ExamItem, QuestionSet, QuestionType, Topic } from "./types";
import { DEFAULT_SURVEY_IDS, TEXTBOOK, textbookIntro, textbookQuestionById, textbookSetById, textbookTopicById, textbookTopics } from "../data/textbook/catalog";

export type RandomSource = () => number;
export const TYPE_LABELS: Record<QuestionType, string> = {
  intro: "자기소개", description: "묘사", routine: "일과·활동", experience: "과거 경험", memorable: "기억에 남는 경험",
  roleplay_ask: "문의하기", roleplay_problem: "문제 해결", comparison: "비교·변화", issue: "이슈·관심사·의견",
};
/** Position groups only. Task order comes from each printed SET. */
export const EXAM_GROUPS = [
  { slots: [2, 3, 4], label: "일반 SET 1" },
  { slots: [5, 6, 7], label: "일반 SET 2" },
  { slots: [8, 9, 10], label: "일반 SET 3" },
  { slots: [11, 12, 13], label: "롤플레이 SET" },
  { slots: [14, 15], label: "고난도 SET" },
];
export function pickRandom<T>(items: readonly T[], rng: RandomSource = Math.random): T {
  if (!items.length) throw new Error("선택 가능한 교재 SET이 없습니다. 다른 주제의 질문으로 대체하지 않습니다.");
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
function itemsForSet(set: QuestionSet, start: number, label: string): ExamItem[] {
  const topic = textbookTopicById.get(set.topicId);
  if (!topic) throw new Error(`Unknown SET topic: ${set.topicId}`);
  return set.questionIds.map((id, i) => {
    const question = textbookQuestionById.get(id);
    if (!question || !topic.questions.some((q) => q.id === id)) throw new Error(`Invalid SET member: ${id}`);
    return {
      slot: start + i, topicId: topic.id, topicKo: topic.ko, topicEn: topic.en, emoji: topic.emoji,
      comboLabel: label, typeLabel: set.kind === "roleplay" && i === 2 ? `롤플레이 후속 · ${TYPE_LABELS[question.type]}` : TYPE_LABELS[question.type],
      question, setId: set.id, setPosition: i + 1, setSource: set.sourceRef,
    };
  });
}
let serial = 0;
function examBase(mode: Exam["mode"], bank: "textbook" | "legacy" = "textbook") {
  return { id: `${mode}-${Date.now()}-${++serial}`, createdAt: Date.now(), mode, bank,
    ...(bank === "textbook" ? { bankVersion: TEXTBOOK.version } : {}) };
}
function selectSet(topic: Topic, kind: QuestionSet["kind"], rng: RandomSource) {
  return pickRandom((topic.sets ?? []).filter((s) => s.kind === kind), rng);
}
export interface BuildExamOptions { enabledSurveyIds?: string[]; includeIntro?: boolean; rng?: RandomSource }
export function buildFullExam(options: BuildExamOptions = {}): Exam {
  const { includeIntro = true, rng = Math.random } = options;
  const requested = [...new Set(options.enabledSurveyIds ?? DEFAULT_SURVEY_IDS)];
  const survey = textbookTopics.filter((t) => t.category === "survey" && requested.includes(t.id) && t.sets?.some((s) => s.kind === "general"));
  if (survey.length < 2) throw new Error("교재에 일반 SET이 있는 서베이 주제를 2개 이상 선택해 주세요. 다른 주제로 임의 대체하지 않습니다.");
  const pickedSurvey = shuffle(survey, rng).slice(0, 2);
  const common = pickRandom(textbookTopics.filter((t) => t.category === "surprise" && t.sets?.some((s) => s.kind === "general")), rng);
  // Training distribution modeled on p.13; NOT a claim about official exam probabilities.
  const general = shuffle([...pickedSurvey, common].map((t) => selectSet(t, "general", rng)), rng);
  const roleTopic = pickRandom(textbookTopics.filter((t) => t.category === "roleplay" && t.sets?.length), rng);
  const roleSet = selectSet(roleTopic, "roleplay", rng);
  const advancedTopics = textbookTopics.filter((t) =>
    (t.category === "surprise" || (t.category === "survey" && requested.includes(t.id))) && t.sets?.some((s) => s.kind === "advanced"));
  const advancedSet = selectSet(pickRandom(advancedTopics, rng), "advanced", rng);
  const selected = [...general, roleSet, advancedSet];
  const items = selected.flatMap((set, i) => itemsForSet(set, EXAM_GROUPS[i].slots[0], EXAM_GROUPS[i].label));
  if (includeIntro) items.unshift({ slot: 1, topicId: "intro", topicKo: TYPE_LABELS.intro, topicEn: "Self-introduction", emoji: "👋", comboLabel: "Q1", typeLabel: TYPE_LABELS.intro, question: textbookIntro });
  const unsupported = requested.filter((id) => !survey.some((t) => t.id === id));
  return { ...examBase("full"), items, setIds: selected.map((s) => s.id),
    notices: unsupported.length ? [`교재 독립 SET 미수록/미인식 주제는 출제하지 않았습니다: ${unsupported.join(", ")}`] : [] };
}
export function buildSetPractice(setId: string): Exam {
  const set = textbookSetById.get(setId);
  if (!set) throw new Error("존재하지 않거나 검토 과정에서 제외된 교재 SET입니다.");
  const start = set.kind === "roleplay" ? 11 : set.kind === "advanced" ? 14 : 2;
  return { ...examBase("practice"), focusTopicId: set.topicId, setIds: [set.id],
    items: itemsForSet(set, start, `${set.sourceRef.label} (p.${set.sourceRef.page})`) };
}
/** A textbook SET is never truncated or shuffled. Legacy data remains separate. */
export function buildPracticeExam(topic: Topic, count = 5): Exam {
  if (topic.sets?.length) return buildSetPractice(pickRandom(topic.sets).id);
  if (topic.questions.some((q) => q.source === "textbook")) throw new Error("완전한 교재 SET이 없는 주제입니다.");
  if (!Number.isFinite(count) || count < 1) throw new RangeError("Practice count must be positive.");
  const picked = shuffle(topic.questions.filter((q) => !q.dependsOn?.length)).slice(0, Math.min(50, Math.floor(count)));
  if (!picked.length) throw new Error("독립적으로 연습할 문항이 없습니다.");
  return { ...examBase("practice", "legacy"), focusTopicId: topic.id,
    items: picked.map((question, i) => ({ slot: i + 1, topicId: topic.id, topicKo: topic.ko, topicEn: topic.en, emoji: topic.emoji, comboLabel: "기존 별도 연습", typeLabel: TYPE_LABELS[question.type], question })) };
}
/** Only independent questions. Contextual follow-ups and roleplays stay inside SETs. */
export function buildSingleQuestion(topics: Topic[] = textbookTopics, rng: RandomSource = Math.random): Exam {
  const candidates = topics.filter((t) => t.category !== "roleplay")
    .flatMap((topic) => topic.questions.filter((q) => q.source === "textbook" && !q.dependsOn?.length).map((question) => ({ topic, question })));
  const { topic, question } = pickRandom(candidates, rng);
  return { ...examBase("single"), items: [{ slot: 1, topicId: topic.id, topicKo: topic.ko, topicEn: topic.en, emoji: topic.emoji, comboLabel: "교재 독립 문항", typeLabel: TYPE_LABELS[question.type], question }] };
}
