import type { Question, QuestionSet, QuestionType, SetKind, SourceReference, Topic, TopicCategory } from "../../lib/types";
import general1 from "./general-1.json";
import general2 from "./general-2.json";
import general3 from "./general-3.json";
import general4 from "./general-4.json";
import roleplay1 from "./roleplay-1.json";
import roleplay2 from "./roleplay-2.json";

export const TEXTBOOK = {
  id: "pagoda-opic-im2-al-2020",
  title: "파고다 오픽의 신 OPIc IM2-AL",
  edition: "2020 개정판 / 2023년 7쇄",
  analysisThrough: "2020-07",
  version: "2026-09-07-sets-v2",
  wording: "English prompts transcribed from the supplied textbook; whitespace normalized only.",
} as const;

type RawQuestion = [number, string, QuestionType, string, string, number[]?];
type RawSet = [number, number, SetKind, number[], string?, string?];
interface RawUnit {
  id: string; ko: string; en: string; category: TopicCategory; unit: number;
  section: "general" | "roleplay"; questions: RawQuestion[]; sets: RawSet[];
}
const rawUnits = [...general1, ...general2, ...general3, ...general4, ...roleplay1, ...roleplay2] as unknown as RawUnit[];
const taskTypes = new Set<string>(["description", "routine", "experience", "memorable", "roleplay_ask", "roleplay_problem", "issue", "comparison", "intro"]);
export interface ExcludedSet { id: string; topicId: string; sourceRef: SourceReference; reason: string }
export const excludedSets: ExcludedSet[] = [];
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`Invalid textbook data: ${message}`);
}
function questionId(unit: RawUnit, key: number): string {
  return `tb-${unit.section === "general" ? "g" : "r"}${String(unit.unit).padStart(2, "0")}-q${String(key).padStart(2, "0")}`;
}
function source(unit: RawUnit, page: number, label: string): SourceReference {
  return { bookId: TEXTBOOK.id, section: unit.section, unit: unit.unit, page, label, wording: "verbatim" };
}

/** Task tags are editorial annotations, not the book's Int/Adv ratings. Text is unchanged. */
const TASK_OVERRIDES: Record<string, QuestionType> = {
  "tb-g17-q09": "experience", // p.209 explicitly asks HOW the phone was chosen in the past.
};
export const textbookTopics: Topic[] = rawUnits.map((unit) => {
  assert(unit.unit > 0 && unit.id && unit.questions.length, `empty unit ${unit.id}`);
  const questions: Question[] = unit.questions.map(([page, label, type, en, ko, deps], i) => {
    assert(Number.isInteger(page) && page >= 36 && page <= 496, `${unit.id}: page`);
    assert(taskTypes.has(type) && en.length > 10 && ko.length > 0, `${unit.id}: question ${i + 1}`);
    const id = questionId(unit, i + 1);
    return { id, type: TASK_OVERRIDES[id] ?? type, source: "textbook", en, ko,
      sourceRef: source(unit, page, label),
      ...(deps?.length ? { dependsOn: deps.map((key) => questionId(unit, key)) } : {}) };
  });
  const sets: QuestionSet[] = [];
  for (const [number, page, kind, keys, note, reason] of unit.sets) {
    assert(["general", "roleplay", "advanced"].includes(kind), `${unit.id}: set kind`);
    assert(Number.isInteger(number) && number > 0, `${unit.id}: set number`);
    const id = `tb-${unit.section === "general" ? "g" : "r"}${String(unit.unit).padStart(2, "0")}-p${page}-s${number}-${kind}`;
    const sourceRef = source(unit, page, `SET ${number}`);
    if (reason) { excludedSets.push({ id, topicId: unit.id, sourceRef, reason }); continue; }
    assert(keys.length === (kind === "advanced" ? 2 : 3), `${id}: incomplete set`);
    assert(new Set(keys).size === keys.length, `${id}: repeated question`);
    const chosen = keys.map((key) => {
      assert(Number.isInteger(key) && key > 0 && key <= questions.length, `${id}: missing Q${key}`);
      return questions[key - 1];
    });
    const seen = new Set<string>();
    for (const q of chosen) {
      assert(q.dependsOn?.every((dep) => seen.has(dep)) ?? true, `${id}: missing prerequisite before ${q.id}`);
      seen.add(q.id);
    }
    if (kind === "roleplay") {
      assert(chosen.map((q) => q.sourceRef?.label).join() === "Q11,Q12,Q13", `${id}: roleplay order`);
      assert(chosen[0].type === "roleplay_ask" && chosen[1].type === "roleplay_problem", `${id}: roleplay tasks`);
      assert(chosen.every((q) => q.sourceRef?.page === page), `${id}: mixed roleplay situations`);
    }
    sets.push({ id, topicId: unit.id, kind, printedNumber: number, questionIds: chosen.map((q) => q.id), sourceRef, ...(note ? { note } : {}) });
  }
  return { id: unit.id, ko: unit.ko, en: unit.en, category: unit.category,
    emoji: unit.category === "roleplay" ? "🎭" : unit.category === "survey" ? "📘" : "📗", questions, sets };
});
export const textbookSets = textbookTopics.flatMap((t) => t.sets ?? []);
export const textbookTopicById = new Map(textbookTopics.map((t) => [t.id, t]));
export const textbookQuestionById = new Map(textbookTopics.flatMap((t) => t.questions.map((q) => [q.id, q] as const)));
export const textbookSetById = new Map(textbookSets.map((s) => [s.id, s]));
assert(textbookTopicById.size === textbookTopics.length, "duplicate topic IDs");
assert(textbookQuestionById.size === textbookTopics.reduce((n, t) => n + t.questions.length, 0), "duplicate question IDs");
assert(textbookSetById.size === textbookSets.length, "duplicate set IDs");
export const textbookStats = {
  topics: textbookTopics.length,
  questions: textbookQuestionById.size,
  generalSets: textbookSets.filter((s) => s.kind === "general").length,
  roleplaySets: textbookSets.filter((s) => s.kind === "roleplay").length,
  advancedSets: textbookSets.filter((s) => s.kind === "advanced").length,
  excludedSets: excludedSets.length,
};
export const DEFAULT_SURVEY_IDS = ["living-alone-apartment", "music", "shopping", "staycation", "overseas-travel"];
export const UNSUPPORTED_SURVEY_TOPICS = [
  { id: "park", ko: "공원" }, { id: "beach", ko: "해변" }, { id: "concert", ko: "콘서트" },
  { id: "jogging", ko: "조깅" }, { id: "walking", ko: "걷기" }, { id: "gym", ko: "헬스" },
];
export const textbookIntro: Question = {
  id: "tb-intro", type: "intro", source: "textbook",
  en: "Let’s start the interview. Tell me something about yourself.", ko: "자기소개",
  sourceRef: { bookId: TEXTBOOK.id, section: "preface", page: 13, label: "Q1", wording: "verbatim" },
};
