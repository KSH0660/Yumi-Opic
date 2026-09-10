import type { Question, QuestionSource, QuestionType, Topic } from "../lib/types";
import { surveyRoleplayQuestionsByTopic } from "./survey-roleplay-bank";

export const SURVEY_BANK_VERSION = "survey-staycation-2026-09-10";

function q(
  id: string,
  type: QuestionType,
  en: string,
  ko: string,
  source: QuestionSource = "verified",
): Question {
  return { id, type, en, ko, source };
}

function topic(id: string, ko: string, en: string, emoji: string, questions: Question[]): Topic {
  return { id, category: "survey", ko, en, emoji, questions: [...questions, ...(surveyRoleplayQuestionsByTopic[id] ?? [])] };
}

export const surveyTopics: Topic[] = [
  topic("home", "혼자 아파트 거주", "Home / Apartment", "🏠", [
    q("home-d1", "description", "Tell me about the apartment you live in. What does it look like, and what kinds of rooms does it have?", "현재 살고 있는 아파트를 설명해 주세요. 어떻게 생겼고 어떤 방들이 있나요?"),
    q("home-d2", "description", "Which room in your home do you like the most? Describe the room and explain what you usually do there.", "집에서 가장 좋아하는 방은 어디인가요? 그 방을 묘사하고 주로 무엇을 하는지 말해 주세요."),
    q("home-r1", "routine", "What do you usually do at home on a normal weekday or weekend? Walk me through your usual routine.", "평일이나 주말에 집에서 보통 무엇을 하나요? 평소 루틴을 순서대로 말해 주세요."),
    q("home-e1", "experience", "Tell me about a change you made to your home recently. What did you change, why did you change it, and how did it turn out?", "최근 집에 변화를 준 경험을 말해 주세요. 무엇을 왜 바꿨고 결과는 어땠나요?"),
    q("home-e2", "experience", "Think back to a time when you moved into a new home. What happened on moving day, and who helped you?", "새 집으로 이사했던 때를 떠올려 보세요. 이사 당일 무슨 일이 있었고 누가 도와줬나요?"),
    q("home-m1", "memorable", "Tell me about a memorable or unexpected problem you experienced at home. What happened, what did you do, and how was it resolved?", "집에서 겪은 기억에 남거나 예상 밖의 문제를 말해 주세요. 무슨 일이 있었고 어떻게 해결했나요?"),
    q("home-c1", "comparison", "Compare the home you lived in when you were younger with the home you live in now. What are the main similarities and differences?", "어릴 때 살던 집과 지금 사는 집을 비교해 주세요. 주요 공통점과 차이점은 무엇인가요?"),
    q("home-i1", "issue", "What housing or rental problems do people commonly talk about where you live? Why do these problems happen, and what could improve the situation?", "당신이 사는 지역에서 사람들이 자주 이야기하는 주거·임대 문제는 무엇인가요? 왜 생기며 어떻게 개선할 수 있을까요?", "adapted"),
  ]),
  topic("music", "음악 듣기", "Listening to Music", "🎧", [
    q("music-d1", "description", "What kinds of music do you enjoy listening to? Who are some singers or musicians you especially like, and what makes their music appealing to you?", "어떤 음악을 즐겨 듣나요? 특히 좋아하는 가수나 뮤지션은 누구이며 그 음악의 어떤 점이 좋나요?"),
    q("music-d2", "description", "Choose one musician you really like. Describe that person's music, style, and what makes the musician stand out to you.", "정말 좋아하는 뮤지션 한 명을 골라 음악과 스타일, 특별한 점을 설명해 주세요."),
    q("music-r1", "routine", "When and where do you usually listen to music? What device or service do you use, and what role does music play in your day?", "보통 언제 어디서 음악을 듣나요? 어떤 기기나 서비스를 쓰며 음악이 일상에서 어떤 역할을 하나요?"),
    q("music-e1", "experience", "How did you first become interested in music? What did you listen to at first, and who or what influenced you?", "처음 음악에 관심을 갖게 된 계기는 무엇인가요? 처음 어떤 음악을 들었고 누가 또는 무엇이 영향을 줬나요?"),
    q("music-e2", "experience", "Tell me about a recent time when you listened to live music. Where were you, who were you with, and what was the atmosphere like?", "최근 라이브 음악을 들었던 경험을 말해 주세요. 어디였고 누구와 있었으며 분위기는 어땠나요?"),
    q("music-m1", "memorable", "Tell me about a special or unforgettable experience you have had with music. What was the occasion, what music was playing, and why does that day still stay with you?", "음악과 관련해 특별하거나 잊을 수 없는 경험을 말해 주세요. 어떤 상황이었고 어떤 음악이 흘러나왔으며 그날이 왜 아직도 기억에 남나요?"),
    q("music-m2", "memorable", "Tell me about the most memorable live music or performance you have ever experienced. Where was it, who was performing, and what made that day stay with you?", "지금까지 경험한 라이브 음악이나 공연 중 가장 기억에 남는 것을 말해 주세요. 어디였고 누가 공연했으며 그날이 왜 기억에 남나요?"),
    q("music-c1", "comparison", "How has your taste in music changed from when you were younger to now? Give specific examples of what you listened to then and what you listen to today.", "어릴 때와 지금의 음악 취향은 어떻게 달라졌나요? 과거와 현재에 듣는 음악을 구체적으로 비교해 주세요."),
    q("music-c2", "comparison", "Compare two different kinds of music you listen to. How are they different in sound, mood, and the situations you listen to them in, and which one do you prefer?", "듣는 음악 중 서로 다른 두 종류를 비교해 주세요. 소리, 분위기, 듣는 상황은 어떻게 다르며 어느 쪽을 더 좋아하나요?"),
    q("music-i1", "issue", "What new electronic gadgets or equipment are people who like music interested in these days? What new products excite them, and why?", "요즘 음악을 좋아하는 사람들은 어떤 새로운 전자기기나 장비에 관심이 있나요? 어떤 신제품에 열광하며 그 이유는 무엇인가요?"),
  ]),
  topic("beach", "해변", "Beaches", "🏖️", [
    q("beach-d1", "description", "Tell me about a beach you like to visit. Where is it, what does it look like, and what makes it special to you?", "좋아하는 해변을 말해 주세요. 어디에 있고 어떻게 생겼으며 무엇이 특별한가요?"),
    q("beach-d2", "description", "Describe the scenery and atmosphere at a beach you know well. What can people see and do there, and does it get crowded?", "잘 아는 해변의 풍경과 분위기를 설명해 주세요. 사람들이 무엇을 보고 할 수 있으며 붐비는 편인가요?"),
    q("beach-r1", "routine", "When you go to the beach, what do you usually do from the time you arrive until you leave? Who do you normally go with?", "해변에 가면 도착해서 떠날 때까지 보통 무엇을 하나요? 주로 누구와 가나요?"),
    q("beach-e1", "experience", "Tell me about the last time you went to a beach. When was it, who were you with, and what did you do that day?", "마지막으로 해변에 갔던 경험을 말해 주세요. 언제였고 누구와 무엇을 했나요?"),
    q("beach-e2", "experience", "Tell me about an early beach trip that you still remember. Where did you go, who were you with, and what did you do?", "아직 기억나는 예전의 해변 여행을 말해 주세요. 어디에 누구와 갔고 무엇을 했나요?"),
    q("beach-m1", "memorable", "Tell me about a particularly memorable beach trip. Did anything funny, difficult, or unexpected happen? Explain the story from beginning to end.", "특히 기억에 남는 해변 여행을 말해 주세요. 재미있거나 힘들거나 예상 밖의 일이 있었나요? 처음부터 끝까지 설명해 주세요."),
    q("beach-c1", "comparison", "Compare two beaches you know. How are the scenery, facilities, crowds, or activities different, and which one do you prefer?", "알고 있는 두 해변을 비교해 주세요. 풍경, 시설, 사람 수, 활동은 어떻게 다르며 어느 곳을 더 좋아하나요?"),
    q("beach-i1", "issue", "What problems do popular beaches face, such as litter, crowding, or safety concerns? What do you think should be done about them?", "인기 해변이 겪는 쓰레기, 혼잡, 안전 같은 문제는 무엇인가요? 어떻게 해결해야 한다고 생각하나요?", "adapted"),
  ]),
  topic("park", "공원", "Parks", "🌳", [
    q("park-d1", "description", "Tell me about a park you often visit. Where is it, what does it look like, and why do you like going there?", "자주 가는 공원을 말해 주세요. 어디에 있고 어떻게 생겼으며 왜 좋아하나요?"),
    q("park-d2", "description", "Describe the main features of a park you know well. What facilities are there, and what do people usually do there?", "잘 아는 공원의 주요 특징을 설명해 주세요. 어떤 시설이 있고 사람들은 주로 무엇을 하나요?"),
    q("park-r1", "routine", "What do you normally do when you go to a park? Tell me about your typical visit from beginning to end.", "공원에 가면 보통 무엇을 하나요? 평소 방문을 처음부터 끝까지 말해 주세요."),
    q("park-e1", "experience", "Tell me about the last time you went to a park. Which park did you visit, who were you with, and what did you do?", "마지막으로 공원에 갔던 경험을 말해 주세요. 어느 공원이었고 누구와 무엇을 했나요?"),
    q("park-e2", "experience", "How did you first get interested in going to parks? Tell me about when that interest began and how it has developed.", "처음 공원 가기에 관심을 갖게 된 계기는 무엇인가요? 언제 시작됐고 관심이 어떻게 발전했나요?"),
    q("park-m1", "memorable", "Tell me about a memorable incident that happened at a park. What exactly happened, how did you react, and why do you still remember it?", "공원에서 있었던 기억에 남는 사건을 말해 주세요. 무슨 일이 있었고 어떻게 대처했으며 왜 아직 기억하나요?"),
    q("park-c1", "comparison", "Pick two parks you know and compare them. What are their similarities and differences, and which one do you prefer?", "알고 있는 두 공원을 골라 비교해 주세요. 공통점과 차이점은 무엇이며 어느 곳을 더 좋아하나요?"),
    q("park-i1", "issue", "What issues do parks in your area face these days? Think about maintenance, litter, facilities, or how crowded they are, and suggest possible improvements.", "요즘 지역 공원이 겪는 문제는 무엇인가요? 관리, 쓰레기, 시설, 혼잡 등을 생각해 보고 개선 방법을 말해 주세요.", "adapted"),
  ]),
  topic("concert", "콘서트", "Concerts", "🎤", [
    q("concert-d1", "description", "What kinds of concerts or live performances do you enjoy? Explain what you like about those performances.", "어떤 종류의 콘서트나 라이브 공연을 좋아하나요? 그런 공연의 어떤 점이 좋은지 설명해 주세요."),
    q("concert-d2", "description", "Tell me about a concert venue you often visit or know well. Where is it, what does it look like, and what do you like about it?", "자주 가거나 잘 아는 콘서트장을 말해 주세요. 어디에 있고 어떻게 생겼으며 어떤 점이 좋나요?"),
    q("concert-r1", "routine", "How often do you go to concerts, who do you usually go with, and what do you normally do before and after a show?", "콘서트에 얼마나 자주 가고 누구와 가나요? 공연 전후에는 보통 무엇을 하나요?"),
    q("concert-e1", "experience", "Tell me about a concert you attended recently. Where was it held, who did you go with, and how was the experience?", "최근에 간 콘서트를 말해 주세요. 어디에서 열렸고 누구와 갔으며 경험은 어땠나요?"),
    q("concert-e2", "experience", "Tell me about the first concert or live performance you remember attending. What was it like, and how did you feel?", "기억나는 첫 콘서트나 라이브 공연 경험을 말해 주세요. 어땠고 어떤 기분이었나요?", "adapted"),
    q("concert-m1", "memorable", "What is the most memorable concert you have attended? Who performed, what made it special, and why do you remember it so clearly?", "가장 기억에 남는 콘서트는 무엇인가요? 누가 공연했고 무엇이 특별했으며 왜 선명하게 기억하나요?"),
    q("concert-c1", "comparison", "How have concerts or live performances changed over the years in your country? Compare the past with the present and explain what you think of the changes.", "당신의 나라에서 콘서트나 라이브 공연은 수년간 어떻게 변했나요? 과거와 현재를 비교하고 변화에 대한 생각을 말해 주세요."),
    q("concert-i1", "issue", "What problems or concerns do concertgoers talk about these days, such as ticket prices, ticketing, crowding, or venue rules? What could be improved?", "요즘 콘서트 관객들이 티켓 가격, 예매, 혼잡, 공연장 규칙 등과 관련해 이야기하는 문제는 무엇인가요? 무엇을 개선할 수 있을까요?", "adapted"),
  ]),
  topic("shopping", "쇼핑", "Shopping", "🛍️", [
    q("shopping-d1", "description", "Tell me about a store or shopping center you often go to. What does it look like, and what kinds of things can you buy there?", "자주 가는 상점이나 쇼핑센터를 말해 주세요. 어떻게 생겼고 어떤 물건을 살 수 있나요?"),
    q("shopping-d2", "description", "Describe your favorite place to shop. Where is it, what sections or stores does it have, and why do you like it?", "가장 좋아하는 쇼핑 장소를 설명해 주세요. 어디에 있고 어떤 매장이나 구역이 있으며 왜 좋아하나요?"),
    q("shopping-r1", "routine", "When do you usually go shopping, who do you go with, and what do you typically do from the moment you arrive until you leave?", "보통 언제 누구와 쇼핑하나요? 도착해서 떠날 때까지 주로 무엇을 하나요?"),
    q("shopping-e1", "experience", "Tell me about the last time you went shopping. Where did you go, what were you looking for, and what did you end up buying?", "마지막 쇼핑 경험을 말해 주세요. 어디에 갔고 무엇을 찾았으며 결국 무엇을 샀나요?"),
    q("shopping-e2", "experience", "Tell me about a purchase you remember especially well. What did you buy, why did you hesitate or decide to buy it, and how did you feel afterward?", "특히 기억나는 구매 경험을 말해 주세요. 무엇을 샀고 왜 망설이거나 구매를 결정했으며 이후 기분은 어땠나요?", "adapted"),
    q("shopping-m1", "memorable", "Tell me about a problem you had with something you bought. What was wrong, what did you do about it, and how was the problem resolved?", "구매한 물건에 문제가 있었던 경험을 말해 주세요. 무엇이 문제였고 어떻게 대처했으며 어떻게 해결됐나요?"),
    q("shopping-c1", "comparison", "How has the way you shop changed compared with the past? Compare how you used to shop with how you shop now.", "예전과 비교해 쇼핑 방식이 어떻게 달라졌나요? 과거와 현재의 쇼핑 방식을 비교해 주세요."),
    q("shopping-i1", "issue", "What products or shopping services are especially popular these days? Why do people want them, and what trends do you notice?", "요즘 특히 인기 있는 제품이나 쇼핑 서비스는 무엇인가요? 사람들이 왜 원하며 어떤 트렌드가 보이나요?", "adapted"),
  ]),
  topic("jogging", "조깅", "Jogging", "🏃", [
    q("jogging-d1", "description", "Describe a place where you like to jog. What is the route like, and why is it a good place for jogging?", "조깅하기 좋아하는 장소를 설명해 주세요. 코스는 어떻고 왜 조깅하기 좋은가요?"),
    q("jogging-d2", "description", "Tell me what jogging is like for you. What do you need, how long do you usually jog, and how do you feel afterward?", "당신에게 조깅이 어떤 운동인지 말해 주세요. 무엇이 필요하고 보통 얼마나 뛰며 끝나고 어떤 기분인가요?"),
    q("jogging-r1", "routine", "How often do you go jogging, when do you usually go, and what do you do before, during, and after your jog?", "얼마나 자주 언제 조깅하나요? 뛰기 전, 중간, 후에 무엇을 하나요?"),
    q("jogging-e1", "experience", "Tell me about the last time you went jogging. Where did you go, who were you with, and what happened that day?", "마지막 조깅 경험을 말해 주세요. 어디에 갔고 누구와 있었으며 그날 무슨 일이 있었나요?"),
    q("jogging-e2", "experience", "When and why did you first start jogging? Did someone or something motivate you to begin?", "언제 왜 처음 조깅을 시작했나요? 누군가나 어떤 계기가 동기를 줬나요?"),
    q("jogging-m1", "memorable", "Tell me about a memorable jogging experience. Maybe something difficult, funny, or unexpected happened. What made the experience stand out?", "기억에 남는 조깅 경험을 말해 주세요. 힘들거나 재미있거나 예상 밖의 일이 있었나요? 무엇이 특별했나요?"),
    q("jogging-c1", "comparison", "Compare jogging with another type of exercise you know well. How are they different in difficulty, convenience, and benefits?", "조깅과 잘 아는 다른 운동을 비교해 주세요. 난이도, 편의성, 장점은 어떻게 다른가요?", "adapted"),
    q("jogging-i1", "issue", "What problems can people face when jogging outdoors, such as weather, traffic, injuries, or poor paths? What can make jogging safer and easier?", "야외 조깅을 할 때 날씨, 교통, 부상, 좋지 않은 길 같은 어떤 문제가 생길 수 있나요? 어떻게 더 안전하고 편하게 만들 수 있을까요?", "adapted"),
  ]),
  topic("walking", "걷기", "Walking", "🚶", [
    q("walking-d1", "description", "Describe a place where you enjoy walking. What does the area look like, and what do you like about walking there?", "걷기 좋아하는 장소를 설명해 주세요. 주변은 어떻게 생겼고 그곳에서 걷는 어떤 점이 좋은가요?"),
    q("walking-d2", "description", "Tell me about your usual walking route. What do you see along the way, and what makes the route comfortable or interesting?", "평소 걷는 코스를 말해 주세요. 길에서 무엇을 보고 무엇이 편안하거나 흥미롭게 만드나요?"),
    q("walking-r1", "routine", "How often do you go walking, when and where do you usually walk, and what do you typically do while walking?", "얼마나 자주 언제 어디서 걷나요? 걸으면서 보통 무엇을 하나요?"),
    q("walking-e1", "experience", "When did you first start walking regularly, and why did you decide to make it a habit?", "언제 처음 규칙적으로 걷기 시작했고 왜 습관으로 만들기로 했나요?"),
    q("walking-e2", "experience", "Tell me about the last time you went for a walk. Where did you go, who were you with, and what did you do?", "마지막으로 산책하거나 걸었던 경험을 말해 주세요. 어디에 갔고 누구와 무엇을 했나요?"),
    q("walking-m1", "memorable", "Tell me about a walking experience that was especially memorable. What happened, and why was it unforgettable?", "특히 기억에 남는 걷기 경험을 말해 주세요. 무슨 일이 있었고 왜 잊을 수 없나요?"),
    q("walking-c1", "comparison", "Compare walking with jogging or another exercise. Which is easier to fit into daily life, and what different benefits do they have?", "걷기와 조깅 또는 다른 운동을 비교해 주세요. 일상에 넣기 더 쉬운 것은 무엇이며 장점은 어떻게 다른가요?", "adapted"),
    q("walking-i1", "issue", "What makes a neighborhood good or bad for walking? Talk about sidewalks, crossings, traffic, lighting, or other safety issues and suggest improvements.", "어떤 동네가 걷기 좋거나 나쁜가요? 보도, 횡단보도, 교통, 조명 등 안전 문제를 말하고 개선 방법을 제안해 주세요.", "adapted"),
  ]),
  topic("gym", "헬스", "Working Out at a Gym", "🏋️", [
    q("gym-d1", "description", "Describe the gym or health club you go to. What does it look like, and what facilities or equipment does it have?", "다니는 헬스장이나 피트니스센터를 설명해 주세요. 어떻게 생겼고 어떤 시설이나 기구가 있나요?"),
    q("gym-d2", "description", "What part of your gym do you like the most? Describe the equipment or area and explain why you use it often.", "헬스장에서 가장 좋아하는 공간은 어디인가요? 기구나 구역을 묘사하고 왜 자주 쓰는지 말해 주세요."),
    q("gym-r1", "routine", "Walk me through your usual workout at the gym. How often do you go, what exercises do you do, and in what order?", "평소 헬스장 운동 루틴을 순서대로 말해 주세요. 얼마나 자주 가고 어떤 운동을 어떤 순서로 하나요?"),
    q("gym-e1", "experience", "Why did you first start going to a gym? What was difficult at first, and how did your routine develop?", "왜 처음 헬스장에 다니기 시작했나요? 처음에는 무엇이 어려웠고 루틴은 어떻게 발전했나요?"),
    q("gym-e2", "experience", "Tell me about a recent workout that went particularly well or badly. What exercises did you do, and how did you feel afterward?", "최근 운동이 특히 잘됐거나 잘 안됐던 경험을 말해 주세요. 어떤 운동을 했고 끝난 뒤 기분은 어땠나요?", "adapted"),
    q("gym-m1", "memorable", "Tell me about a memorable problem or obstacle you faced at the gym, such as an injury, crowded equipment, or a difficult exercise. How did you handle it?", "헬스장에서 부상, 기구 혼잡, 어려운 운동 같은 기억에 남는 문제나 장애를 겪은 경험을 말해 주세요. 어떻게 대처했나요?", "adapted"),
    q("gym-c1", "comparison", "Compare two gyms you have been to or know about. How are their facilities, equipment, prices, and atmosphere different, and which one do you prefer?", "다녀 봤거나 알고 있는 헬스장 두 곳을 비교해 주세요. 시설, 기구, 가격, 분위기는 어떻게 다르며 어느 곳을 더 좋아하나요?", "adapted"),
    q("gym-i1", "issue", "What problems or concerns do people often have at gyms these days, such as crowded equipment, hygiene, noise, or membership contracts? Why do these problems happen, and what do you think should be done about them?", "요즘 사람들이 헬스장에서 겪는 문제나 걱정거리는 무엇인가요? 기구 혼잡, 위생, 소음, 회원권 계약 등을 생각해 보고 왜 생기는지, 어떻게 해결해야 하는지 말해 주세요.", "adapted"),
  ]),
  topic("staycation", "집에서 보내는 휴가", "Vacation at Home", "🛋️", [
    q("staycation-q2", "description", "You indicated that you take vacations at home. Who are the people you would like to see and spend time with on your vacation?", "집에서 휴가를 보낸다고 하셨습니다. 휴가 동안 누구를 만나 함께 시간을 보내고 싶나요?"),
    q("staycation-q3", "routine", "Describe some of the things that you would like to do with people you visit or see during your vacation.", "휴가 동안 방문하거나 만나는 사람들과 함께 하고 싶은 일들을 설명해 주세요."),
    q("staycation-q4", "experience", "Describe exactly what you did during the last vacation that you spent at home. Give me a description of what you did from the first to the last day. Talk about all the people you saw and everything that you did.", "지난번 집에서 보낸 휴가 동안 정확히 무엇을 했는지 설명해 주세요. 첫날부터 마지막 날까지 만난 모든 사람과 했던 모든 일을 말해 주세요."),
    q("staycation-q5", "description", "You indicated that you take vacations at home. Who are the people you would like to see and spend time with on your vacation?", "집에서 휴가를 보낸다고 하셨습니다. 휴가 동안 누구를 만나 함께 시간을 보내고 싶나요?"),
    q("staycation-q6", "experience", "Describe exactly what you did during the last vacation that you spent at home. Give me a description of what you did from the first to the last day. Talk about all the people you saw and everything that you did.", "지난번 집에서 보낸 휴가 동안 정확히 무엇을 했는지 설명해 주세요. 첫날부터 마지막 날까지 만난 모든 사람과 했던 모든 일을 말해 주세요."),
    q("staycation-q7", "memorable", "Could you tell me about an unusual or unexpected experience you had during a vacation you had at home? What happened? Who was involved? And why was this experience so memorable?", "집에서 휴가를 보내며 겪은 특이하거나 예상하지 못한 경험을 말해 주세요. 무슨 일이 있었고 누가 관련되어 있었나요? 왜 그렇게 기억에 남나요?"),
    q("staycation-q14", "comparison", "You indicated in the survey that you stay at home for vacations. How do most people spend their vacation in your country? How does that compare to the way people spent their vacation when they were growing up? Are they doing things differently? How have things changed and why have things changed? Please, take a minute to discuss this topic.", "설문에서 집에서 휴가를 보낸다고 하셨습니다. 당신의 나라에서 대부분의 사람들은 휴가를 어떻게 보내나요? 그 사람들이 자라던 시절의 휴가 방식과 비교하면 어떤가요? 무엇이 어떻게, 왜 달라졌는지 이야기해 주세요."),
    q("staycation-q15", "issue", "Experts state that vacations are important for every individual. Take a minute and report for me the important benefits of vacation time to a person's health, relationships, and personal growth.", "전문가들은 휴가가 모든 사람에게 중요하다고 합니다. 휴가가 개인의 건강, 인간관계, 개인적 성장에 주는 중요한 이점을 이야기해 주세요."),
  ]),
  topic("overseas", "해외여행", "Overseas Travel", "✈️", [
    q("overseas-d1", "description", "Tell me about a country or city abroad that you remember well. What was the place like, and what made it interesting to you?", "기억에 남는 해외 국가나 도시를 말해 주세요. 어떤 곳이었고 무엇이 흥미로웠나요?"),
    q("overseas-d2", "description", "Describe an overseas destination in detail. Talk about the scenery, food, culture, atmosphere, or anything else that stood out to you.", "해외 여행지 한 곳을 자세히 묘사해 주세요. 풍경, 음식, 문화, 분위기 등 인상적인 점을 말해 주세요."),
    q("overseas-r1", "routine", "When you travel abroad, how do you usually prepare for the trip, and what kinds of things do you usually do once you arrive?", "해외여행을 갈 때 보통 어떻게 준비하고 도착한 뒤 어떤 활동을 하나요?"),
    q("overseas-e1", "experience", "Tell me about your first trip abroad. When and where did you go, who did you go with, and what did you do there?", "첫 해외여행에 대해 말해 주세요. 언제 어디에 누구와 갔고 무엇을 했나요?"),
    q("overseas-e2", "experience", "Tell me about a recent overseas trip. Where did you go, what did you do, and what did you enjoy the most?", "최근 해외여행을 말해 주세요. 어디에 갔고 무엇을 했으며 무엇이 가장 좋았나요?"),
    q("overseas-m1", "memorable", "Tell me about an unforgettable or unexpected incident that happened while you were traveling abroad. What was the problem, what did you do, and how did it end?", "해외여행 중 있었던 잊을 수 없거나 예상 밖의 사건을 말해 주세요. 어떤 문제였고 어떻게 행동했으며 어떻게 끝났나요?"),
    q("overseas-c1", "comparison", "How has overseas travel changed compared with the past? Think about planning, booking, technology, cost, or how people choose destinations.", "해외여행은 과거와 비교해 어떻게 변했나요? 계획, 예약, 기술, 비용, 여행지 선택 등을 생각해 보세요.", "adapted"),
    q("overseas-i1", "issue", "What do travelers care about most when they go abroad these days? Talk about priorities or concerns such as local experiences, cost, safety, convenience, or social media.", "요즘 사람들이 해외여행을 갈 때 가장 중요하게 생각하는 것은 무엇인가요? 현지 경험, 비용, 안전, 편의성, 소셜미디어 같은 우선순위나 걱정을 말해 주세요.", "adapted"),
  ]),
];

export const DEFAULT_SURVEY_IDS = surveyTopics.map((topic) => topic.id);
export const surveyTopicById = new Map(surveyTopics.map((topic) => [topic.id, topic]));
export const surveyQuestionCount = surveyTopics.reduce((sum, topic) => sum + topic.questions.length, 0);

export const introQuestion: Question = q(
  "intro",
  "intro",
  "Let's start the interview. Please tell me a little bit about yourself.",
  "인터뷰를 시작하겠습니다. 자기소개를 해 주세요.",
  "adapted",
);
