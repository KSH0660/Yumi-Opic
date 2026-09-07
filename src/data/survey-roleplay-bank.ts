import type { Question, QuestionSource, QuestionType } from "../lib/types";

function rp(
  id: string,
  type: QuestionType,
  en: string,
  ko: string,
  source: QuestionSource = "adapted",
  dependsOn?: string[],
): Question {
  return { id, type, en, ko, source, dependsOn };
}

/**
 * One coherent Q11 -> Q12 -> Q13 roleplay set for every active survey topic.
 * Q11 asks for information, Q12 resolves a problem, and Q13 tells a related
 * past problem or unusual experience. The wording follows the roleplay patterns
 * used in the previous textbook-backed bank, while keeping the current survey-only
 * app intentionally small.
 */
export const surveyRoleplayQuestionsByTopic: Record<string, Question[]> = {
  home: [
    rp("home-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are interested in renting an apartment near your workplace. Call a real estate agent and ask three or four questions about the apartment before you decide to visit it.", "직장 근처 아파트를 알아보는 상황입니다. 부동산에 전화해 방문 전에 필요한 정보를 3~4가지 질문하세요."),
    rp("home-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You moved into the apartment, but the heating suddenly stopped working. Call the building management office, explain the problem, and suggest or ask for two or three ways to resolve it quickly.", "입주 후 난방이 갑자기 고장 났습니다. 관리사무소에 전화해 문제를 설명하고 빠르게 해결할 방법 2~3가지를 제안하거나 요청하세요.", "adapted", ["home-rp11"]),
    rp("home-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had something break or stop working at home? Tell me what happened, what you did to solve the problem, and how things turned out in the end.", "집에서 무언가 고장 나거나 작동하지 않았던 경험을 말하세요. 어떤 일이 있었고 어떻게 해결했으며 결과는 어땠는지 자세히 설명하세요.", "adapted", ["home-rp12"]),
  ],
  music: [
    rp("music-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are thinking about signing up for a premium music streaming service. Call customer service and ask three or four questions about the plan, such as the price, available features, and how you can use it.", "프리미엄 음악 스트리밍 서비스 가입을 고민하고 있습니다. 고객센터에 전화해 가격, 기능, 이용 방법 등에 대해 3~4가지 질문하세요."),
    rp("music-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You paid for the premium plan, but the premium features are not working on your phone. Call customer service, explain the situation, and suggest two or three ways to solve the problem.", "프리미엄 요금을 결제했지만 휴대폰에서 프리미엄 기능이 작동하지 않습니다. 고객센터에 전화해 상황을 설명하고 해결책 2~3가지를 제안하세요.", "adapted", ["music-rp11"]),
    rp("music-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a problem with a music app, a subscription, or another digital service you paid for? Tell me what went wrong, what you did about it, and how it was resolved.", "음악 앱, 구독 서비스 또는 결제한 디지털 서비스에 문제가 있었던 경험을 말하세요. 무엇이 잘못됐고 어떻게 대처했으며 어떻게 해결됐는지 설명하세요.", "adapted", ["music-rp12"]),
  ],
  beach: [
    rp("beach-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are planning a weekend trip to the beach and want to stay at a guesthouse nearby. Call the guesthouse and ask three or four questions before you make a reservation.", "주말 해변 여행을 계획하며 근처 숙소를 예약하려고 합니다. 숙소에 전화해 예약 전에 필요한 정보를 3~4가지 질문하세요."),
    rp("beach-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. When you arrive at the guesthouse, the room is not the one you reserved. Explain the problem to the staff and suggest two or three ways to resolve the situation.", "숙소에 도착했는데 예약한 객실과 다른 방을 받았습니다. 직원에게 문제를 설명하고 해결책 2~3가지를 제안하세요.", "adapted", ["beach-rp11"]),
    rp("beach-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a beach trip or another vacation go differently from what you expected? Tell me what happened, how you dealt with the problem, and how the trip ended.", "해변 여행이나 다른 휴가가 예상과 다르게 흘러간 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했으며 여행이 어떻게 끝났는지 설명하세요.", "adapted", ["beach-rp12"]),
  ],
  park: [
    rp("park-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to have a small picnic with your friends at a park. Call the park office and ask three or four questions about using the park for your gathering.", "친구들과 공원에서 작은 피크닉을 하려고 합니다. 공원 관리사무소에 전화해 이용 관련 정보를 3~4가지 질문하세요."),
    rp("park-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. On the day of the picnic, you find out that the park is closed because of bad weather. Call your friends, explain the situation, and offer two or three alternative plans.", "피크닉 당일 악천후 때문에 공원이 폐쇄됐다는 것을 알게 됐습니다. 친구들에게 전화해 상황을 설명하고 대안 2~3가지를 제안하세요.", "adapted", ["park-rp11"]),
    rp("park-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had an outdoor plan ruined or changed because of the weather or an unexpected closure? Tell me what happened and what you did instead.", "날씨나 갑작스러운 폐쇄 때문에 야외 계획이 망가지거나 바뀐 경험을 말하세요. 무슨 일이 있었고 대신 무엇을 했는지 설명하세요.", "adapted", ["park-rp12"]),
  ],
  concert: [
    rp("concert-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to buy concert tickets for your family. Call the ticket office and ask three or four questions about the seats, prices, discounts, and available dates.", "가족과 갈 콘서트 티켓을 사고 싶습니다. 예매처에 전화해 좌석, 가격, 할인, 가능한 날짜 등에 대해 3~4가지 질문하세요."),
    rp("concert-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You already bought the tickets, but something suddenly came up at work and you cannot attend on that date. Call the ticket office, explain the situation, and suggest two or three alternatives, such as changing the date or getting a refund.", "이미 티켓을 샀지만 갑자기 회사 일이 생겨 그날 갈 수 없습니다. 예매처에 전화해 상황을 설명하고 날짜 변경이나 환불 등 대안 2~3가지를 제안하세요.", "adapted", ["concert-rp11"]),
    rp("concert-rp13", "roleplay_experience", "That's the end of the situation. Have you ever bought tickets or made plans for an event but had to change or cancel them because something unexpected happened? Tell me the whole story from beginning to end.", "공연이나 행사 표를 샀거나 계획을 세웠다가 예상치 못한 일 때문에 변경하거나 취소했던 경험을 처음부터 끝까지 말하세요.", "adapted", ["concert-rp12"]),
  ],
  shopping: [
    rp("shopping-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to buy an item from your favorite store. Call the store and ask three or four questions about the item, such as whether it is in stock, the price, any discounts, and the return policy.", "좋아하는 매장에서 물건을 사려고 합니다. 매장에 전화해 재고, 가격, 할인, 반품 정책 등에 대해 3~4가지 질문하세요."),
    rp("shopping-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You bought the item and later discovered that it was damaged or defective. Call the store, explain the problem, and suggest two or three ways to resolve it.", "구매한 물건이 손상됐거나 불량이라는 것을 알게 됐습니다. 매장에 전화해 문제를 설명하고 해결책 2~3가지를 제안하세요.", "adapted", ["shopping-rp11"]),
    rp("shopping-rp13", "roleplay_experience", "That's the end of the situation. Have you ever bought something that was damaged, defective, fake, or simply different from what you expected? Tell me what happened, what you did, and how the problem was finally resolved.", "손상, 불량, 가품 또는 기대와 다른 물건을 샀던 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했으며 결국 어떻게 해결됐는지 설명하세요.", "adapted", ["shopping-rp12"]),
  ],
  jogging: [
    rp("jogging-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are interested in joining a local running club. Call the organizer and ask three or four questions about the meeting time, route, pace, fee, or what you need to bring.", "지역 러닝 클럽에 가입하고 싶습니다. 운영자에게 전화해 모임 시간, 코스, 페이스, 비용, 준비물 등에 대해 3~4가지 질문하세요."),
    rp("jogging-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You signed up for a running event, but you hurt your ankle and cannot participate on the scheduled day. Call the organizer, explain the situation, and ask for two or three alternatives, such as changing the date, transferring your entry, or getting a refund.", "러닝 행사에 신청했지만 발목을 다쳐 예정된 날 참가할 수 없습니다. 운영자에게 전화해 상황을 설명하고 날짜 변경, 참가권 양도, 환불 등 대안 2~3가지를 요청하세요.", "adapted", ["jogging-rp11"]),
    rp("jogging-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had to stop jogging or another exercise because of an injury, bad weather, or another unexpected problem? Tell me what happened and how you handled it.", "부상, 날씨 또는 다른 예상치 못한 문제 때문에 조깅이나 운동을 중단해야 했던 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했는지 설명하세요.", "adapted", ["jogging-rp12"]),
  ],
  walking: [
    rp("walking-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to join a guided walking tour in your city. Call the tour organizer and ask three or four questions about the route, starting time, duration, cost, or difficulty level.", "도시의 가이드 워킹 투어에 참여하고 싶습니다. 운영자에게 전화해 코스, 시작 시간, 소요 시간, 비용, 난이도 등에 대해 3~4가지 질문하세요."),
    rp("walking-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. Heavy rain is expected on the day of the walking tour you booked. Call the organizer, explain your concern, and ask for two or three alternatives, such as rescheduling, joining another tour, or getting a refund.", "예약한 워킹 투어 당일 폭우가 예상됩니다. 운영자에게 전화해 걱정되는 상황을 설명하고 일정 변경, 다른 투어 참여, 환불 등 대안 2~3가지를 요청하세요.", "adapted", ["walking-rp11"]),
    rp("walking-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a walk, tour, or other outdoor activity changed because of bad weather or another unexpected situation? Tell me what happened and what you did instead.", "악천후나 예상치 못한 상황 때문에 산책, 투어 또는 야외 활동 계획이 바뀐 경험을 말하세요. 무슨 일이 있었고 대신 무엇을 했는지 설명하세요.", "adapted", ["walking-rp12"]),
  ],
  gym: [
    rp("gym-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You want to join a gym near your home. Call the gym and ask three or four questions about the facilities, exercise programs, membership fee, operating hours, or locker rooms.", "집 근처 헬스장에 등록하고 싶습니다. 헬스장에 전화해 시설, 운동 프로그램, 회원권 가격, 운영 시간, 탈의실 등에 대해 3~4가지 질문하세요."),
    rp("gym-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You joined the gym, but after your first visit you realized that an important facility or service you expected is unavailable. Call the manager, explain the problem, and ask for two or three solutions, such as changing your plan, freezing the membership, or getting a refund.", "헬스장에 등록했지만 첫 방문 후 기대했던 중요한 시설이나 서비스를 이용할 수 없다는 것을 알게 됐습니다. 매니저에게 전화해 문제를 설명하고 회원권 변경, 정지, 환불 등 해결책 2~3가지를 요청하세요.", "adapted", ["gym-rp11"]),
    rp("gym-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a problem with a gym, fitness class, membership, or exercise plan? Tell me what happened, what you did about it, and how things turned out.", "헬스장, 운동 수업, 회원권 또는 운동 계획과 관련해 문제가 있었던 경험을 말하세요. 무슨 일이 있었고 어떻게 대처했으며 결과는 어땠는지 설명하세요.", "adapted", ["gym-rp12"]),
  ],
  staycation: [
    rp("staycation-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are planning to spend your vacation at home and want to sign up for a streaming service. Call customer service and ask three or four questions about the premium plan, available shows, supported devices, and cancellation policy.", "집에서 휴가를 보내며 스트리밍 서비스에 가입하려고 합니다. 고객센터에 전화해 프리미엄 요금제, 콘텐츠, 지원 기기, 해지 정책 등에 대해 3~4가지 질문하세요."),
    rp("staycation-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You paid for the premium plan so you could enjoy movies during your vacation, but the service suddenly stopped working. Call customer service, explain the problem, and suggest two or three solutions, including a refund if it cannot be fixed.", "휴가 동안 영화를 보려고 프리미엄 요금제를 결제했지만 서비스가 갑자기 작동하지 않습니다. 고객센터에 전화해 문제를 설명하고, 고칠 수 없다면 환불을 포함해 해결책 2~3가지를 제안하세요.", "adapted", ["staycation-rp11"]),
    rp("staycation-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a problem with a streaming service, internet connection, TV, or another home entertainment service while you were trying to relax at home? Tell me the whole story.", "집에서 쉬는 동안 스트리밍 서비스, 인터넷, TV 또는 다른 홈 엔터테인먼트 서비스에 문제가 생긴 경험을 처음부터 끝까지 말하세요.", "adapted", ["staycation-rp12"]),
  ],
  overseas: [
    rp("overseas-rp11", "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You are planning a trip abroad. Call a travel agency and ask three or four questions about the flight, hotel, price, schedule, or anything else you need to know before booking.", "해외여행을 계획하고 있습니다. 여행사에 전화해 항공편, 호텔, 가격, 일정 등 예약 전에 필요한 정보를 3~4가지 질문하세요."),
    rp("overseas-rp12", "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. You already booked your trip, but something unexpected happened and you cannot travel on the original date. Call the travel agency, explain the situation, and offer two or three alternatives, such as changing the date, receiving travel credit, or getting a refund.", "여행을 예약했지만 예상치 못한 일이 생겨 원래 날짜에 갈 수 없습니다. 여행사에 전화해 상황을 설명하고 날짜 변경, 여행 크레딧, 환불 등 대안 2~3가지를 제안하세요.", "adapted", ["overseas-rp11"]),
    rp("overseas-rp13", "roleplay_experience", "That's the end of the situation. Have you ever had a travel plan go wrong or experienced something unusual while traveling abroad? Give some background, explain the problem or unusual event, tell me what you did, and describe how it ended.", "해외여행 계획이 틀어지거나 여행 중 특이한 일을 겪은 경험을 말하세요. 배경, 문제나 특이점, 행동과 해결, 결과 순서로 자세히 설명하세요.", "adapted", ["overseas-rp12"]),
  ],
};

export const surveyRoleplayQuestionCount = Object.values(surveyRoleplayQuestionsByTopic)
  .reduce((sum, questions) => sum + questions.length, 0);
