import type { Question, Topic } from "@/lib/types";
import { surveyTopics } from "./survey-topics";
import { surpriseTopics } from "./surprise-topics";
import { roleplayTopics } from "./roleplay-topics";
import { advancedTopics } from "./advanced-topics";

export { surveyTopics, surpriseTopics, roleplayTopics, advancedTopics };

export const allTopics: Topic[] = [
  ...surveyTopics,
  ...surpriseTopics,
  ...roleplayTopics,
  ...advancedTopics,
];

export const topicById = new Map(allTopics.map((t) => [t.id, t]));

/** 1번 자기소개 — 기본적으로 건너뛰지만, 원하면 연습할 수 있게 남겨둔다. */
export const introQuestion: Question = {
  id: "intro-1",
  type: "intro",
  en: "Let's start the interview now. Tell me a little bit about yourself.",
  ko: "간단한 자기소개를 하세요. (실전에서는 채점에 거의 반영되지 않아 보통 건너뜁니다.)",
  hints: [
    "My name is ... and I'm currently",
    "I've been working as ... for about",
    "In my free time I usually",
    "That's pretty much it about me",
  ],
};

export const totalQuestionCount = allTopics.reduce(
  (sum, t) => sum + t.questions.length,
  0,
);
