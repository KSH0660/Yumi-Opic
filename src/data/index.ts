export {
  DEFAULT_SURVEY_IDS,
  SURVEY_BANK_VERSION,
  introQuestion,
  surveyQuestionCount,
  surveyTopicById,
  surveyTopics,
} from "./survey-bank";

import { introQuestion, surveyQuestionCount, surveyTopicById, surveyTopics } from "./survey-bank";

export const allTopics = surveyTopics;
export const topicById = surveyTopicById;
export const totalQuestionCount = surveyQuestionCount + 1;
export { introQuestion };
