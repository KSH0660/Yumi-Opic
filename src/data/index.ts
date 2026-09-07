import { textbookIntro, textbookTopics, textbookStats } from "./textbook/catalog";
export { TEXTBOOK, DEFAULT_SURVEY_IDS, UNSUPPORTED_SURVEY_TOPICS, excludedSets, textbookSets, textbookSetById, textbookStats } from "./textbook/catalog";
export const allTopics = textbookTopics;
export const topicById = new Map(allTopics.map((t) => [t.id, t]));
export const surveyTopics = allTopics.filter((t) => t.category === "survey");
export const surpriseTopics = allTopics.filter((t) => t.category === "surprise");
export const roleplayTopics = allTopics.filter((t) => t.category === "roleplay");
// An overlapping view, not duplicated topics/questions in the active bank.
export const advancedTopics = allTopics.filter((t) => t.sets?.some((s) => s.kind === "advanced"));
export const introQuestion = textbookIntro;
export const totalQuestionCount = textbookStats.questions;
export const textbookQuestionCount = textbookStats.questions;
/** Legacy external reconstructions do not participate in the active textbook bank. */
export const verifiedQuestionCount = 0;
