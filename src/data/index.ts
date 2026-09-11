import {
  DEFAULT_SURVEY_IDS,
  SURVEY_BANK_VERSION,
  introQuestion,
  surveyQuestionCount,
  surveyTopicById,
  surveyTopics,
} from "./survey-bank";
import { surpriseQuestionCount, surpriseTopics } from "./surprise-bank";
export { surpriseQuestionCount, surpriseTopics } from "./surprise-bank";
import {
  DEFAULT_SINGLE_CHOICE_IDS,
  DEFAULT_SURVEY_CHOICE_IDS,
  MIN_PRACTICE_TOPICS,
  OFFICIAL_MIN_CHOICES,
  choiceIdsForTopics,
  surveyChoiceById,
  surveyFormChoices,
  surveyFormQuestions,
  topicIdsForChoices,
} from "./survey-form";

export {
  DEFAULT_SINGLE_CHOICE_IDS,
  DEFAULT_SURVEY_CHOICE_IDS,
  DEFAULT_SURVEY_IDS,
  MIN_PRACTICE_TOPICS,
  OFFICIAL_MIN_CHOICES,
  SURVEY_BANK_VERSION,
  choiceIdsForTopics,
  introQuestion,
  surveyChoiceById,
  surveyFormChoices,
  surveyFormQuestions,
  surveyQuestionCount,
  surveyTopicById,
  surveyTopics,
  topicIdsForChoices,
};
export type { SurveyFormChoice, SurveyFormQuestion } from "./survey-form";

export const allTopics = [...surveyTopics, ...surpriseTopics];
export const topicById = new Map(allTopics.map((topic) => [topic.id, topic]));
export const totalQuestionCount = surveyQuestionCount + surpriseQuestionCount + 1;
