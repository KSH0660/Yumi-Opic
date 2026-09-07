import type { Question, Topic } from "@/lib/types";
import { surveyTopics as rawSurvey } from "./survey-topics";
import { surpriseTopics as rawSurprise } from "./surprise-topics";
import { roleplayTopics as rawRoleplay } from "./roleplay-topics";
import { advancedTopics as rawAdvanced } from "./advanced-topics";
import { verifiedByTopic } from "./verified";
import {
  textbookAdvancedTopics,
  textbookRoleplayTopics,
  textbookSurveyTopics,
  textbookSurpriseTopics,
} from "./textbook-bank";

/**
 * 자체 제작 문항과 복원 기출을 한 주제로 합친다.
 * 복원 기출을 앞에 두어 같은 유형이면 기출이 먼저 눈에 띄게 한다.
 */
function withVerified(topics: Topic[]): Topic[] {
  return topics.map((topic) => {
    const extra = verifiedByTopic[topic.id];
    if (!extra || extra.length === 0) return topic;
    return { ...topic, questions: [...extra, ...topic.questions] };
  });
}

/**
 * 기존 문제은행은 그대로 보존하고, 사용자가 제공한 Pagoda OPIc 교재에서 추출한
 * 문제 유형/세트 구조를 바탕으로 만든 교재 기반 문항을 추가한다.
 * 교재 문구를 그대로 복제하지 않고 task를 자연스럽게 재구성했기 때문에
 * source는 adapted로 유지한다.
 */
export const surveyTopics = withVerified([...rawSurvey, ...textbookSurveyTopics]);
export const surpriseTopics = withVerified([...rawSurprise, ...textbookSurpriseTopics]);
export const roleplayTopics = withVerified([...rawRoleplay, ...textbookRoleplayTopics]);
export const advancedTopics = withVerified([...rawAdvanced, ...textbookAdvancedTopics]);

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
  source: "verified",
  en: "Let's start the interview now. Tell me about yourself",
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

export const verifiedQuestionCount = allTopics.reduce(
  (sum, t) => sum + t.questions.filter((q) => q.source === "verified").length,
  0,
);
