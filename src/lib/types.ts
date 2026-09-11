/** Task labels describe the prompt, never a fixed position in the exam. */
export type QuestionType = "description" | "routine" | "experience" | "memorable" | "roleplay_ask" | "roleplay_problem" | "roleplay_experience" | "issue" | "comparison" | "intro";
export type TopicCategory = "survey" | "surprise" | "roleplay" | "advanced";
export type QuestionSource = "textbook" | "verified" | "adapted" | "provided";
export type SetKind = "general" | "roleplay" | "advanced";
export interface SourceReference {
  bookId: string;
  section: "general" | "roleplay" | "preface";
  unit?: number;
  page: number;
  label: string;
  wording: "verbatim";
}
export interface Question {
  id: string;
  /** 자료에 적힌 번호. 답변 저장용 slot과 구분하며 5-A/5-B도 보존합니다. */
  number?: string;
  title?: string;
  type: QuestionType;
  source?: QuestionSource;
  en: string;
  ko: string;
  hints?: string[];
  sourceRef?: SourceReference;
  /** These questions must occur earlier in the same SET. */
  dependsOn?: string[];
}
export interface QuestionSet {
  id: string;
  topicId: string;
  kind: SetKind;
  printedNumber: number;
  questionIds: string[];
  sourceRef: SourceReference;
  note?: string;
}
export interface Topic {
  id: string;
  category: TopicCategory;
  ko: string;
  en: string;
  emoji: string;
  questions: Question[];
  sets?: QuestionSet[];
}
export interface ExamItem {
  slot: number;
  topicId: string;
  topicKo: string;
  topicEn: string;
  emoji: string;
  comboLabel: string;
  typeLabel: string;
  question: Question;
  setId?: string;
  setPosition?: number;
  setSource?: SourceReference;
}
export interface Exam {
  id: string;
  createdAt: number;
  mode: "full" | "practice" | "single";
  items: ExamItem[];
  focusTopicId?: string;
  bank?: "textbook" | "legacy";
  bankVersion?: string;
  setIds?: string[];
  notices?: string[];
}
export interface AnswerRecord { slot: number; text: string; elapsedSec: number }
