import type { Question, QuestionSource, QuestionType } from "../lib/types";

function rp(
  id: string,
  type: QuestionType,
  en: string,
  ko: string,
  source: QuestionSource = "verified",
  dependsOn?: string[],
): Question {
  return { id, type, en, ko, source, dependsOn };
}

/**
 * Q11 -> Q12 -> Q13 roleplay sets for the active survey topics.
 *
 * `verified` means the prompt is grounded in publicly available OPIc recall /
 * question-compilation material and then lightly normalized for this app. It does
 * NOT mean ACTFL has officially released or authenticated the exact wording.
 *
 * Keep `adapted` only where a directly matching public Q12/Q13 continuation was
 * not found and the prompt was completed from the established roleplay pattern.
 */
export const surveyRoleplayQuestionsByTopic: Record<string, Question[]> = {
  home: [
    rp("home-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You recently moved into a new apartment and need to learn the recycling rules. Call the management office and ask three or four questions about when, where, and how to recycle different kinds of waste.", "새 아파트로 이사한 뒤 재활용 규칙을 알아보는 상황입니다. 관리사무소에 전화해 언제, 어디서, 어떤 방식으로 재활용하는지 3~4가지 질문하세요."),
    rp("home-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. A new resident in your apartment building is putting regular garbage into the recycling area, and other residents are upset. Talk to the resident, explain the recycling rules, and suggest two or three ways to fix the problem.", "새 입주민이 일반 쓰레기를 재활용 구역에 버려 다른 주민들이 불편해하고 있습니다. 그 입주민에게 규칙을 설명하고 문제를 해결할 방법 2~3가지를 제안하세요.", "verified", ["home-rp11"]),
    rp("home-rp13", "roleplay_experience", "That's the end of the situation. Tell me about a time when you had trouble with recycling, such as not knowing the rules after moving or putting something in the wrong container. What happened, what did you do, and how was the problem resolved?", "이사 후 규칙을 몰랐거나 잘못된 수거함에 버리는 등 재활용 때문에 곤란했던 경험을 말하세요. 무슨 일이 있었고 어떻게 해결했는지 설명하세요.", "verified", ["home-rp12"]),
  ],

  music: [
    rp("music-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to buy an MP3 player, and your friend knows a lot about them. Call your friend and ask three or four questions that will help you decide what to buy.", "MP3 플레이어를 사려고 하는데 친구가 관련 제품을 잘 압니다. 친구에게 전화해 구매 결정에 도움이 되는 질문을 3~4가지 하세요."),
    rp("music-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You borrowed your friend's MP3 player and accidentally broke it. Call your friend, explain what happened and the condition of the player, and offer two or three alternatives to solve the problem.", "친구에게 빌린 MP3 플레이어를 실수로 고장 냈습니다. 친구에게 전화해 상황과 현재 상태를 설명하고 해결책 2~3가지를 제안하세요.", "verified", ["music-rp11"]),
    rp("music-rp13", "roleplay_experience", "That's the end of the situation. Tell me about a time when a music device or another piece of equipment you were using broke or stopped working. What exactly happened, and how did you deal with the problem?", "음악 기기나 사용하던 장비가 고장 나거나 작동을 멈춘 경험을 말하세요. 정확히 무슨 일이 있었고 어떻게 대처했는지 설명하세요.", "verified", ["music-rp12"]),
  ],

  beach: [
    rp("beach-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You and your friends are planning a trip to the beach this weekend. Call a friend and ask three or four questions about the trip you are planning.", "친구들과 이번 주말 해변 여행을 계획하고 있습니다. 친구에게 전화해 여행 계획에 대해 3~4가지 질문하세요."),
    rp("beach-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You just found out that the weather at the beach will be bad this weekend. Call your friend, explain the situation, and offer two or three alternatives.", "이번 주말 해변의 날씨가 좋지 않을 거라는 사실을 알게 됐습니다. 친구에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "verified", ["beach-rp11"]),
    rp("beach-rp13", "roleplay_experience", "That's the end of the situation. Have you ever gone on a beach trip that was affected by bad weather or another unexpected problem? Tell me what did not go as expected, what you did, and how the trip ended.", "악천후나 예상치 못한 문제 때문에 해변 여행이 계획대로 되지 않았던 경험을 말하세요. 무엇이 문제였고 어떻게 대처했으며 여행이 어떻게 끝났는지 설명하세요.", "verified", ["beach-rp12"]),
  ],

  park: [
    rp("park-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. Your friend wants to go to the park this weekend. Call your friend and ask three or four questions about the plan.", "친구가 이번 주말 공원에 가자고 했습니다. 친구에게 전화해 계획에 대해 3~4가지 질문하세요."),
    rp("park-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You just heard that the park you planned to visit will be closed this weekend. Call your friend, explain the situation, and offer two or three alternatives.", "가려고 했던 공원이 이번 주말 문을 닫는다는 소식을 들었습니다. 친구에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "verified", ["park-rp11"]),
    rp("park-rp13", "roleplay_experience", "That's the end of the situation. Tell me about a memorable incident that happened at a park. What exactly happened, how did you deal with the situation, and why do you still remember it?", "공원에서 있었던 기억에 남는 사건을 말하세요. 정확히 무슨 일이 있었고 어떻게 대처했으며 왜 기억에 남는지 설명하세요.", "verified", ["park-rp12"]),
  ],

  concert: [
    rp("concert-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to buy two tickets for a concert or performance for you and a friend. Call the ticket office and ask three or four questions to get the tickets.", "친구와 함께 볼 콘서트나 공연 티켓 두 장을 사고 싶습니다. 예매처에 전화해 티켓 구매에 필요한 정보를 3~4가지 질문하세요."),
    rp("concert-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. On the day of the concert or performance, you become very sick and cannot go. Call your friend, explain the situation, and offer two or three alternatives.", "공연 당일 몸이 너무 아파서 갈 수 없게 됐습니다. 친구에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "verified", ["concert-rp11"]),
    rp("concert-rp13", "roleplay_experience", "That's the end of the situation. Have you ever bought tickets or made plans for an event but had to cancel or change them because something unexpected happened? Tell me when it happened, what went wrong, what you did, and how it ended.", "공연이나 행사 표를 샀거나 계획을 세웠다가 예상치 못한 일로 취소하거나 변경했던 경험을 말하세요. 배경, 문제, 행동, 결과를 자세히 설명하세요.", "verified", ["concert-rp12"]),
  ],

  shopping: [
    rp("shopping-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You see a sign saying that one of your favorite stores is having a big sale. Call or go to the store and ask three or four questions to find out as much as you can about the sale.", "좋아하는 매장에서 큰 세일을 한다는 안내를 봤습니다. 매장에 전화하거나 직접 가서 세일에 대해 3~4가지 질문하세요."),
    rp("shopping-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. After you get home with an item you bought, you realize that it is damaged. Call the store, explain the situation, and offer two or three ways to resolve the problem.", "구매한 물건을 집에 가져온 뒤 손상된 것을 발견했습니다. 매장에 전화해 상황을 설명하고 해결 방법 2~3가지를 제안하세요.", "verified", ["shopping-rp11"]),
    rp("shopping-rp13", "roleplay_experience", "That's the end of the situation. Have you ever bought something that did not work, was damaged, or caused another shopping problem? Tell me what you bought, what was wrong, what you did, and how the problem was resolved.", "작동하지 않거나 손상된 물건을 샀거나 쇼핑 중 다른 문제를 겪었던 경험을 말하세요. 무엇을 샀고 무엇이 문제였으며 어떻게 해결했는지 설명하세요.", "verified", ["shopping-rp12"]),
  ],

  jogging: [
    rp("jogging-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. Your friend has asked you to go jogging together. Call your friend and ask three or four questions about the time, place, route, or other details of the plan.", "친구가 같이 조깅하자고 했습니다. 친구에게 전화해 시간, 장소, 코스 등 계획에 대해 3~4가지 질문하세요."),
    rp("jogging-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You and your friend were supposed to go jogging together, but you cannot make it. Call your friend, explain the situation, and offer two or three alternatives.", "친구와 함께 조깅하기로 했지만 갈 수 없게 됐습니다. 친구에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "verified", ["jogging-rp11"]),
    rp("jogging-rp13", "roleplay_experience", "That's the end of the situation. Tell me about a time when a jogging or exercise plan with someone had to be canceled or changed because of an unexpected problem. What happened, what did you do, and how did it turn out?", "누군가와 함께 하려던 조깅이나 운동 계획이 예상치 못한 문제로 취소되거나 변경된 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했으며 결과는 어땠는지 설명하세요.", "verified", ["jogging-rp12"]),
  ],

  walking: [
    rp("walking-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to go for a walk with your friend. Call your friend and ask three or four questions about walking together.", "친구와 함께 산책하거나 걷고 싶습니다. 친구에게 전화해 함께 걷는 계획에 대해 3~4가지 질문하세요."),
    rp("walking-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You planned to go for a walk with your friend, but bad weather or another unexpected problem makes the original plan difficult. Call your friend, explain the situation, and offer two or three alternatives.", "친구와 걷기로 했지만 날씨나 예상치 못한 문제 때문에 원래 계획대로 하기 어렵습니다. 친구에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "adapted", ["walking-rp11"]),
    rp("walking-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a walking or outdoor plan changed because of bad weather or another unexpected problem? Tell me what happened, what you did instead, and how things turned out.", "날씨나 예상치 못한 문제 때문에 산책이나 야외 계획이 바뀐 경험을 말하세요. 무슨 일이 있었고 대신 무엇을 했으며 결과는 어땠는지 설명하세요.", "adapted", ["walking-rp12"]),
  ],

  gym: [
    rp("gym-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to join a new gym. Call the gym and ask three or four questions to find out what facilities, programs, hours, and membership options they offer.", "새 헬스장에 등록하고 싶습니다. 헬스장에 전화해 시설, 프로그램, 운영 시간, 회원권 등에 대해 3~4가지 질문하세요."),
    rp("gym-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You signed up for the gym over the phone, but when you visit for the first time, it is not what you expected. Explain your concerns to the employee and ask for ways to resolve the problem, including a possible full refund.", "전화로 등록한 헬스장을 처음 방문했는데 기대와 달랐습니다. 직원에게 문제점을 설명하고 전액 환불을 포함한 해결 방법을 요청하세요.", "verified", ["gym-rp11"]),
    rp("gym-rp13", "roleplay_experience", "That's the end of the situation. Maintaining your health can be challenging. Tell me about a time when you faced a problem or challenge while trying to exercise or improve your health. What happened and what did you do?", "운동하거나 건강을 개선하려다 문제나 어려움을 겪었던 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했는지 설명하세요.", "verified", ["gym-rp12"]),
  ],

  staycation: [
    rp("staycation-q11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to get two tickets to see a performance during your vacation. Call the box office and ask three or four questions to get tickets.", "상황을 듣고 역할을 수행해 주세요. 휴가 동안 볼 공연 티켓 두 장을 구하려고 합니다. 매표소에 전화해 티켓 구매를 위한 질문을 서너 가지 하세요."),
    rp("staycation-q12", "roleplay_problem", "I'm sorry, but there is a problem that I need you to resolve. On the day of the performance, you are very sick. Call your friend, explain the situation, and offer two different options to resolve the situation.", "해결해야 할 문제가 있습니다. 공연 당일 몸이 많이 아픕니다. 친구에게 전화해 상황을 설명하고 해결할 수 있는 서로 다른 대안 두 가지를 제안하세요.", "verified", ["staycation-q11"]),
    rp("staycation-q13", "roleplay_experience", "That's the end of the situation. Have you ever bought concert tickets or made plans for a trip, or made plans for other things, but had to cancel at the last minute because you could not make it? When was it? What exactly happened? Tell me everything that you did to resolve the situation", "상황극이 끝났습니다. 콘서트 티켓을 사거나 여행 또는 다른 계획을 세웠지만 참석할 수 없어 직전에 취소했던 적이 있나요? 언제였고 정확히 무슨 일이 있었나요? 상황을 해결하기 위해 했던 모든 일을 말해 주세요.", "verified", ["staycation-q12"]),
  ],

  overseas: [
    rp("overseas-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are planning a trip abroad. Call a travel agency and ask three or four questions about the trip you want to take, such as the schedule, price, flight, hotel, or cancellation policy.", "해외여행을 계획하고 있습니다. 여행사에 전화해 일정, 가격, 항공편, 호텔, 취소 정책 등 필요한 정보를 3~4가지 질문하세요."),
    rp("overseas-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You booked a non-refundable plane ticket, but something happened and you cannot travel next week. Call the travel agent, explain the situation, and offer two or three alternatives to resolve the problem.", "환불 불가 항공권을 예약했지만 일이 생겨 다음 주에 여행할 수 없습니다. 여행사에 전화해 상황을 설명하고 해결책 2~3가지를 제안하세요.", "verified", ["overseas-rp11"]),
    rp("overseas-rp13", "roleplay_experience", "That's the end of the situation. Tell me about a time when something unexpected happened while you were traveling or making travel plans. Start with when and where it happened, explain the problem or unusual event, tell me what you did, and describe how it ended.", "여행 중이거나 여행을 계획하면서 예상치 못한 일이 생긴 경험을 말하세요. 언제 어디서였는지 배경부터 시작해 문제나 특이점, 행동, 결과 순서로 설명하세요.", "verified", ["overseas-rp12"]),
  ],
};

export const surveyRoleplayQuestionCount = Object.values(surveyRoleplayQuestionsByTopic)
  .reduce((sum, questions) => sum + questions.length, 0);
