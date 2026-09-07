import type { Question, QuestionType, Topic } from "@/lib/types";

/**
 * User-provided Pagoda OPIc textbook task bank.
 *
 * The task coverage follows the textbook's unit/set structure, but the English
 * question wording is intentionally paraphrased rather than copied verbatim.
 * These are therefore marked as `adapted`, not `verified`.
 */

type Spec = [suffix: string, type: QuestionType, focus: string, ko: string];

const q = (prefix: string, [suffix, type, focus, ko]: Spec): Question => {
  const lead: Record<QuestionType, string> = {
    intro: `Tell me about ${focus}.`,
    description: `Tell me about ${focus}. Give me plenty of specific details.`,
    routine: `Tell me about ${focus}. Walk me through what usually happens.`,
    experience: `Tell me about ${focus}. Explain when it happened, what you did, and how it turned out.`,
    memorable: `Tell me about ${focus}. Give me the story from beginning to end and explain why it stands out.`,
    roleplay_ask: `I'd like to give you a situation and ask you to act it out. ${focus} Ask three or four questions to get the information you need.`,
    roleplay_problem: `I'm sorry, but there is a problem you need to resolve. ${focus} Explain the problem clearly and offer two or three ways to solve it.`,
    issue: `Let's talk about ${focus}. Explain the major changes or issues and support your answer with details.`,
    comparison: `Tell me about ${focus}. Compare the key points or explain what people are saying about it today.`,
  };
  return { id: `tb-${prefix}-${suffix}`, type, source: "adapted", en: lead[type], ko };
};

const topic = (
  id: string,
  category: Topic["category"],
  ko: string,
  en: string,
  emoji: string,
  specs: Spec[],
): Topic => ({
  id: `tb-${id}`,
  category,
  ko: `교재 기반 · ${ko}`,
  en: `Textbook-based: ${en}`,
  emoji,
  questions: specs.map((s) => q(id, s)),
});

export const textbookSurveyTopics: Topic[] = [
  topic("housing", "survey", "집", "Housing", "🏠", [
    ["d1", "description", "your current home, including its rooms and overall layout", "현재 살고 있는 집의 구조와 방을 자세히 묘사"],
    ["d2", "description", "your favorite room at home and what it looks like", "집에서 가장 좋아하는 방 묘사"],
    ["r1", "routine", "your normal weekday and weekend routine at home", "집에서의 주중/주말 일과 묘사"],
    ["r2", "routine", "the housework you do to keep your home clean and comfortable", "집에서 하는 집안일 묘사"],
    ["e1", "experience", "the home you lived in as a child and how it differs from where you live now", "어렸을 때 살던 집과 지금 집 비교"],
    ["e2", "experience", "a change or renovation you made to your home and why you made it", "집에 준 변화나 리모델링 경험"],
    ["m1", "memorable", "a special memory you had with family members at home", "집에서 가족과 있었던 특별한 추억"],
    ["m2", "memorable", "a problem that happened at home and exactly how you fixed it", "집에서 생긴 문제와 해결 과정"],
    ["i1", "issue", "how homes in your area have changed over the past five to ten years", "지난 5~10년간 주택의 변화"],
    ["c1", "comparison", "major housing problems people face when renting or buying a home and how they deal with them", "집을 구할 때 사람들이 겪는 문제"],
    ["i2", "issue", "how new appliances and electronic devices have changed household responsibilities", "새 가전제품이 가사노동에 가져온 변화"],
    ["c2", "comparison", "a modern home appliance people consider especially useful and why", "생활에 유용한 최신 가전제품 설명"],
  ]),
  topic("music", "survey", "음악", "Music", "🎧", [
    ["d1", "description", "the kinds of music you enjoy and your favorite singers, musicians, or composers", "좋아하는 음악 장르와 가수/뮤지션 묘사"],
    ["r1", "routine", "when, where, and in what ways you usually listen to music", "음악을 듣는 장소와 시간, 방법 묘사"],
    ["e1", "experience", "when you first became interested in music and how your taste developed", "음악을 처음 좋아하게 된 계기와 취향 변화"],
    ["m1", "memorable", "a particularly memorable time when you heard live music", "기억에 남는 라이브 음악 경험"],
    ["i1", "issue", "two different kinds of music and how they are similar and different", "서로 다른 두 음악 장르 비교"],
    ["c1", "comparison", "new music gadgets or equipment that people are interested in these days", "요즘 관심을 끄는 음악 기기/설비"],
  ]),
  topic("movie", "survey", "영화", "Movies", "🎬", [
    ["d1", "description", "your favorite movie genre and what you like about it", "가장 좋아하는 영화 장르 묘사"],
    ["r1", "routine", "who you usually watch movies with and what you do before and after a movie", "영화를 누구와 보고 전후로 무엇을 하는지 묘사"],
    ["e1", "experience", "your most recent movie-theater visit and what you did before and after the movie", "최근 영화관에 갔던 경험"],
    ["m1", "memorable", "a movie you remember especially well and why it was so memorable", "기억에 남는 영화와 그 이유"],
    ["c1", "comparison", "a recent news story about an actor or actress you like", "좋아하는 영화배우 관련 최근 뉴스"],
    ["i1", "issue", "how movies have changed compared with the past", "영화 작품의 과거와 현재 변화"],
    ["c2", "comparison", "the movie-related topics people commonly talk about with friends", "사람들이 친구들과 이야기하는 영화 관련 토픽"],
  ]),
  topic("tv", "survey", "텔레비전", "Television and streaming", "📺", [
    ["d1", "description", "TV shows or movies you like to watch", "좋아하는 TV 방송이나 영화 묘사"],
    ["r1", "routine", "your usual TV or movie watching habits", "TV 방송이나 영화 시청 습관 묘사"],
    ["d2", "description", "a TV or movie character you especially like", "좋아하는 TV/영화 캐릭터 설명"],
    ["e1", "experience", "how you first became interested in TV or movies and how your taste changed", "TV/영화에 처음 관심을 갖게 된 계기와 취향 변화"],
    ["m1", "memorable", "a TV show or movie that was particularly memorable to you", "특별히 기억에 남는 TV 방송이나 영화"],
    ["i1", "issue", "how the way people watch TV has changed over roughly the last ten years", "지난 10년간 TV 시청 방식 변화"],
    ["c1", "comparison", "new technologies being used in video content these days", "영상 콘텐츠에 적용되는 최신 기술"],
  ]),
  topic("staycation", "survey", "집에서 보내는 휴가", "Vacation at home", "🛋️", [
    ["d1", "description", "the people you most want to spend a staycation with", "집에서 보내는 휴가 중 만나고 싶은 사람 묘사"],
    ["r1", "routine", "the things you like to do with people during a vacation at home", "휴가 때 만나는 사람들과 하고 싶은 일 묘사"],
    ["e1", "experience", "what you did during your last vacation at home", "지난번 집에서 보낸 휴가 경험"],
    ["m1", "memorable", "a memorable experience from a vacation you spent at home", "집에서 보낸 휴가 중 기억에 남는 경험"],
    ["i1", "issue", "how the way people spend vacations has changed from the past to the present", "사람들의 휴가 방식 과거와 현재 비교"],
    ["c1", "comparison", "why vacations are important to people", "휴가가 중요하다고 생각하는 이유"],
  ]),
  topic("shopping", "survey", "쇼핑", "Shopping", "🛍️", [
    ["d1", "description", "typical stores or shopping malls in your country", "우리나라 상점/쇼핑몰 묘사"],
    ["d2", "description", "a shopping place you enjoy and the things you usually buy there", "즐겨 가는 쇼핑 장소와 사는 물건 묘사"],
    ["r1", "routine", "your usual shopping habits and what you do on a shopping day", "쇼핑 습관과 쇼핑하는 날의 루틴"],
    ["e1", "experience", "your childhood memories of shopping and how you came to enjoy it", "어렸을 때 쇼핑 추억과 좋아하게 된 계기"],
    ["e2", "experience", "your most recent shopping experience", "최근 쇼핑 경험"],
    ["m1", "memorable", "an unexpected problem or unusual event that happened while shopping", "쇼핑 중 겪은 예상치 못한 경험"],
    ["i1", "issue", "the biggest changes in people's shopping habits over the years", "사람들의 쇼핑 습관 변화"],
    ["c1", "comparison", "products or services that people talk about and buy a lot these days", "요즘 많이 언급되는 인기 상품/서비스"],
  ]),
  topic("domestic-travel", "survey", "국내여행", "Domestic trips", "🧳", [
    ["d1", "description", "domestic travel destinations you especially like", "좋아하는 국내여행 장소 묘사"],
    ["r1", "routine", "how you normally prepare before taking a trip", "여행 전에 하는 준비 과정"],
    ["e1", "experience", "trips you took when you were younger", "어렸을 때 갔던 여행 설명"],
    ["m1", "memorable", "an unforgettable experience that happened during a trip", "여행 중 있었던 잊을 수 없는 경험"],
    ["i1", "issue", "why traveling has become more difficult in some ways over the last five years", "지난 5년간 여행이 더 어려워진 이유"],
    ["c1", "comparison", "concerns or worries people have about traveling these days", "여행과 관련해 사람들이 갖는 걱정"],
  ]),
  topic("overseas-travel", "survey", "해외여행", "Overseas trips", "✈️", [
    ["d1", "description", "a country or city abroad that you have visited and what the local people were like", "가 본 해외 국가/도시와 현지인 묘사"],
    ["r1", "routine", "the things you usually do when you travel abroad", "해외 여행지에서 주로 하는 일 묘사"],
    ["e1", "experience", "the first foreign country or city you ever visited", "처음 가 본 해외 국가/도시 경험"],
    ["e2", "experience", "an overseas trip you took when you were younger", "어렸을 때 가 본 해외 국가 경험"],
    ["d2", "description", "foreign destinations that travelers from your country commonly visit", "우리나라 관광객들이 주로 가는 해외 여행지"],
    ["m1", "memorable", "an unforgettable experience that happened on an overseas trip", "해외여행 중 겪은 잊을 수 없는 경험"],
    ["c1", "comparison", "the things travelers care about most when they go abroad", "해외 여행객들이 관심 갖는 것들"],
    ["i1", "issue", "how overseas travel has changed from the past to the present", "해외여행의 과거와 현재 비교"],
  ]),
];

export const textbookSurpriseTopics: Topic[] = [
  topic("furniture", "surprise", "가구", "Furniture", "🪑", [
    ["d1", "description", "the furniture in your home and the piece you like most", "집에 있는 가구와 가장 좋아하는 가구 묘사"],
    ["r1", "routine", "how you use your furniture on a typical day", "평소 가구를 사용하는 방법 설명"],
    ["e1", "experience", "the furniture you had in your childhood home and how it differs from what you have now", "어렸을 때 가구와 지금 가구 비교"],
    ["m1", "memorable", "a problem you had with a piece of furniture and how you fixed it", "가구에 생긴 문제와 해결 방법"],
  ]),
  topic("recycling", "surprise", "재활용", "Recycling", "♻️", [
    ["d1", "description", "how recycling is practiced in your country", "우리나라의 재활용 현황 묘사"],
    ["r1", "routine", "the different things you recycle and how you separate them", "본인이 재활용하는 물건과 방법 묘사"],
    ["e1", "experience", "what recycling was like when you were a child", "어렸을 때 했던 재활용 방법"],
    ["m1", "memorable", "a memorable problem or unusual experience related to recycling", "재활용과 관련된 기억에 남는 경험"],
    ["i1", "issue", "how recycling collection has changed from the past to the present", "재활용 수거 방법의 과거와 현재 변화"],
    ["i2", "issue", "how people's attitudes toward recycling have changed over the years", "재활용에 대한 인식의 과거와 현재 변화"],
    ["c1", "comparison", "a news story about recycling or the environment and how people reacted", "재활용/환경 관련 뉴스 내용"],
  ]),
  topic("restaurant", "surprise", "음식점", "Restaurants", "🍽️", [
    ["d1", "description", "typical restaurants in your country or a favorite restaurant near your home", "우리나라 음식점 또는 집 근처 좋아하는 음식점 묘사"],
    ["d2", "description", "a foreign restaurant you especially like", "좋아하는 외국 음식점 묘사"],
    ["r1", "routine", "what you normally do from the time you enter a restaurant until you leave", "음식점에 가면 하는 일을 순서대로 묘사"],
    ["e1", "experience", "a recent visit to a foreign restaurant", "최근 외국 음식점에 간 경험"],
    ["e2", "experience", "a restaurant you remember from childhood", "어렸을 때 갔던 음식점 묘사"],
    ["m1", "memorable", "a special experience involving takeout or delivery food", "테이크아웃/배달 음식점 관련 특별한 경험"],
    ["i1", "issue", "how restaurant menus and dining culture have shifted toward healthier options", "음식점의 건강식 메뉴와 외식 문화 변화"],
    ["c1", "comparison", "what people care about when they choose and discuss restaurants", "사람들이 음식점에 대해 중요하게 보는 요소"],
  ]),
  topic("gathering", "surprise", "모임", "Gatherings", "🎉", [
    ["d1", "description", "common gatherings or party places in your area", "사는 지역의 모임과 사람들이 가는 파티 장소 묘사"],
    ["e1", "experience", "what happened at a gathering or party you attended recently", "최근 참석한 모임/파티에서 있었던 일"],
    ["m1", "memorable", "the most memorable gathering or party you attended", "기억에 남는 모임 경험"],
    ["e2", "experience", "a time you helped prepare a party or special event", "파티 준비를 도와준 경험"],
    ["i1", "issue", "how gatherings and celebrations today differ from when you were younger", "어렸을 때 모임과 요즘 행사 비교"],
    ["c1", "comparison", "issues or concerns people discuss when preparing gatherings", "모임 준비 관련 이슈와 우려"],
  ]),
  topic("food", "surprise", "식품", "Food", "🥗", [
    ["d1", "description", "healthy foods or everyday foods you usually eat and why", "건강 식품 또는 일상 음식 소개"],
    ["r1", "routine", "how you buy and prepare healthy food", "건강 식품 구매 및 조리 방법"],
    ["e1", "experience", "how you first started eating a particular healthy food", "건강 식품을 먹게 된 계기"],
    ["e2", "experience", "a recent time you ate a healthy food or a representative local dish", "최근 먹은 건강식 또는 대표 음식 경험"],
    ["m1", "memorable", "a memorable experience related to food", "음식 관련 기억에 남는 경험"],
    ["i1", "issue", "how the way people buy food has changed over the last couple of decades", "식품 구매 방식의 변화"],
    ["c1", "comparison", "a news story involving food safety or contamination", "식품 오염 관련 뉴스"],
  ]),
  topic("health", "surprise", "건강", "Health", "💪", [
    ["d1", "description", "the foods and eating habits of people who are considered healthy", "건강한 사람들이 먹는 음식과 식습관"],
    ["d2", "description", "a healthy person you know and the habits that make that person healthy", "건강한 사람의 습관 묘사"],
    ["r1", "routine", "what you normally do to stay healthy", "건강을 위해 평상시 하는 일"],
    ["e1", "experience", "something new you tried for your health", "건강을 위해 새로운 것을 시도한 경험"],
    ["m1", "memorable", "a specific action or challenge you took on to improve your health", "건강을 위해 했던 행동이나 도전"],
    ["i1", "issue", "how attitudes toward health and exercise have changed across generations", "건강 인식과 운동법의 과거/현재 및 세대 비교"],
    ["c1", "comparison", "a recent health-related news story or event", "건강 관련 최근 뉴스나 사건"],
  ]),
  topic("geography", "surprise", "지형", "Geography", "🗺️", [
    ["d1", "description", "the geographic features of your country", "우리나라의 지형적 특징 묘사"],
    ["d2", "description", "the people and traditions of a neighboring country", "이웃 국가의 국민 성향과 전통 묘사"],
    ["r1", "routine", "outdoor or free-time activities people commonly do in your country", "우리나라 사람들의 보편적인 야외 활동"],
    ["e1", "experience", "a place in your country you loved when you were young", "어렸을 때 좋아했던 국내 장소"],
    ["m1", "memorable", "a memorable place or geographic feature you visited in your country", "지형 관련 기억에 남는 국내 장소 경험"],
    ["i1", "issue", "a major change your country has gone through over the last ten years", "우리나라가 지난 10년간 겪은 변화"],
    ["i2", "issue", "how your country's relationship with another country has changed", "우리나라와 다른 국가의 관계 변화"],
    ["c1", "comparison", "a historical event involving your country and a neighboring country and its impact", "이웃 국가와의 역사적 사건과 파장"],
  ]),
  topic("internet", "surprise", "인터넷", "Internet", "🌐", [
    ["d1", "description", "the things people commonly do on the Internet", "사람들이 주로 인터넷으로 하는 일"],
    ["r1", "routine", "what you personally do on the Internet in daily life", "본인이 일상적으로 인터넷에서 하는 일"],
    ["d2", "description", "your favorite website or the kinds of videos you watch online", "좋아하는 웹사이트나 자주 보는 동영상"],
    ["e1", "experience", "your early experiences using the Internet", "초창기 인터넷 사용 경험"],
    ["e2", "experience", "how you used the Internet for a project that required research", "리서치 프로젝트에서 인터넷을 활용한 경험"],
    ["m1", "memorable", "a memorable video you saw online", "인터넷에서 본 기억에 남는 동영상"],
    ["i1", "issue", "concerns people have about the Internet today", "인터넷 관련 사람들의 우려"],
    ["c1", "comparison", "differences in how younger and older people use the Internet", "연령별 인터넷 이용 차이"],
  ]),
  topic("phone", "surprise", "전화기", "Phones", "📱", [
    ["d1", "description", "your favorite feature on your phone", "전화기의 가장 좋아하는 기능"],
    ["r1", "routine", "the things you usually do on your phone besides making calls", "전화 통화 외에 전화기로 하는 일"],
    ["e1", "experience", "your first phone and how it compares with the phone you use now", "첫 전화기와 지금 전화기 비교"],
    ["m1", "memorable", "a problem you had while using your phone", "전화기 사용 중 겪은 문제"],
    ["d2", "description", "the topics you usually talk about with friends on the phone", "친구들과 전화 통화하는 주제"],
    ["r2", "routine", "your phone-call habits, including who you call, when, and for how long", "전화 통화 습관"],
    ["m2", "memorable", "a phone call you remember especially well", "기억에 남는 전화 통화"],
    ["i1", "issue", "how people's use of mobile phones has changed over the last five years", "휴대전화 이용 방식의 변화"],
    ["c1", "comparison", "problems caused by excessive phone use among young people", "젊은이들의 휴대전화 과다 사용 부작용"],
  ]),
  topic("technology", "surprise", "기술", "Technology", "💻", [
    ["d1", "description", "technologies that people in your country commonly use", "우리나라 사람들이 보편적으로 사용하는 기술"],
    ["r1", "routine", "the technology you use most often every day", "매일 가장 자주 사용하는 기술"],
    ["e1", "experience", "how one particular technology has changed from the past to the present", "특정 기술의 과거와 현재 비교"],
    ["m1", "memorable", "a time when a technology problem caused you serious inconvenience", "기술 문제로 겪은 불편"],
  ]),
  topic("industry", "surprise", "산업", "Industry", "🏭", [
    ["d1", "description", "a well-known industry in your country", "우리나라의 잘 알려진 산업 분야"],
    ["d2", "description", "a famous company in that industry", "산업에서 잘 알려진 기업 묘사"],
    ["e1", "experience", "how that company became successful and overcame difficulties", "기업의 성공 과정과 난관 극복"],
    ["d3", "description", "companies that young people want to work for these days", "요즘 젊은이들이 들어가고 싶어 하는 기업"],
    ["e2", "experience", "the efforts you have made for your own career", "본인 진로를 위해 한 노력"],
    ["i1", "issue", "an industry you are interested in and how it has changed over the last three years", "관심 업계의 변화"],
    ["c1", "comparison", "a disappointing product or service from an industry you follow", "관심 업종에서 기대에 못 미친 상품/서비스"],
    ["i2", "issue", "how the way people prepare for their careers has changed over the last five years", "사람들의 진로 준비 방식 변화"],
    ["c2", "comparison", "an industry that people in your country are paying attention to these days", "사람들이 관심 갖는 업계"],
  ]),
  topic("weather", "surprise", "날씨", "Weather", "🌦️", [
    ["d1", "description", "the weather and seasons in your country", "우리나라 날씨와 계절 묘사"],
    ["d2", "description", "today's weather where you are", "오늘의 날씨 상태 묘사"],
    ["e1", "experience", "the weather when you were young compared with recent weather", "어렸을 때 날씨와 최근 날씨 비교"],
    ["m1", "memorable", "an experience you had during extreme weather", "극단적 날씨 관련 경험"],
  ]),
  topic("transportation", "surprise", "교통", "Transportation", "🚇", [
    ["d1", "description", "the main forms of transportation people use in your country", "우리나라 사람들의 교통수단 묘사"],
    ["r1", "routine", "the transportation you use most often", "본인이 자주 이용하는 교통수단"],
    ["e1", "experience", "the transportation you used when you were younger", "어렸을 때의 교통수단"],
    ["m1", "memorable", "a problem you experienced while using transportation", "교통편 이용 중 겪은 문제"],
  ]),
  topic("fashion", "surprise", "패션", "Fashion", "👕", [
    ["d1", "description", "the kinds of clothes people in your country typically wear", "우리나라 사람들의 패션 묘사"],
    ["d2", "description", "your favorite clothes and personal fashion style", "좋아하는 옷과 패션 스타일"],
    ["e1", "experience", "fashion that was popular when you were younger compared with fashion today", "어렸을 때 유행한 패션과 지금 패션 비교"],
    ["r1", "routine", "what you normally do when you go shopping for clothes", "옷을 사러 갈 때 하는 일"],
    ["r2", "routine", "your usual clothing-shopping habits and places", "쇼핑 습관과 장소"],
    ["m1", "memorable", "a recent clothing purchase or a problem you had while buying clothes", "최근 옷 구매 경험 또는 문제"],
  ]),
  topic("bank", "surprise", "은행", "Banks", "🏦", [
    ["d1", "description", "typical banks in your country and what they look like", "우리나라 보편적인 은행 묘사"],
    ["r1", "routine", "the things you do when you use a bank", "은행에서 하는 업무"],
    ["e1", "experience", "banks when you were younger compared with banks today", "어렸을 때 은행과 지금 은행 비교"],
    ["m1", "memorable", "a banking problem you had and how you solved it", "은행 업무 관련 문제와 해결"],
  ]),
  topic("hotel", "surprise", "호텔", "Hotels", "🏨", [
    ["d1", "description", "typical hotels in your country", "우리나라의 보편적인 호텔 묘사"],
    ["r1", "routine", "what you typically do when you arrive at a hotel and when you usually stay at hotels", "호텔 도착 후 하는 일과 투숙 상황"],
    ["m1", "memorable", "a hotel you remember especially well and why", "기억에 남는 호텔과 그 이유"],
    ["e1", "experience", "your most recent hotel stay", "최근 호텔에 묵었던 경험"],
  ]),
  topic("appointment", "surprise", "예약", "Appointments", "📅", [
    ["d1", "description", "the kinds of appointments or reservations you make in everyday life", "평소에 하는 예약 종류"],
    ["r1", "routine", "how you normally make appointments or reservations", "평소 예약하는 방법"],
    ["e1", "experience", "an appointment or reservation experience from when you were younger", "어렸을 때 예약 경험"],
    ["m1", "memorable", "a memorable experience involving an appointment or reservation", "예약 관련 기억에 남는 경험"],
  ]),
  topic("free-time", "surprise", "자유시간", "Free time", "⏰", [
    ["d1", "description", "places people in your country like to visit in their free time", "사람들이 자유시간에 가는 장소"],
    ["r1", "routine", "the things people in your country do during their free time", "사람들이 자유시간에 하는 일"],
    ["e1", "experience", "how your own free time in the past compares with your free time now", "본인의 자유시간 과거와 현재 비교"],
    ["m1", "memorable", "what you did during a recent period of free time", "최근 자유시간에 한 일"],
  ]),
  topic("family-friend", "surprise", "가족/친구", "Family and friends", "👨‍👩‍👧", [
    ["d1", "description", "a friend or family member you see often", "자주 보는 가족/친구 묘사"],
    ["r1", "routine", "the things you normally do when you meet that person", "가족/친구를 만나면 하는 일"],
    ["e1", "experience", "something you did recently with a friend or family member", "가족/친구와 최근에 한 일"],
    ["m1", "memorable", "a special event or holiday you spent with family or friends", "가족/친구와 보낸 특별한 이벤트나 휴일"],
    ["e2", "experience", "a childhood visit to a friend or relative's home", "어렸을 때 가족/친구 집 방문 경험"],
    ["i1", "issue", "two family members or friends and how they are similar and different", "가족/친구 두 명 비교"],
    ["c1", "comparison", "the topics you usually talk about with family or friends", "가족/친구들과의 대화 주제"],
  ]),
  topic("holiday", "surprise", "휴일", "Holidays", "🎊", [
    ["d1", "description", "popular holidays in your country and where people celebrate them", "우리나라 사람들이 휴일을 보내는 장소/활동"],
    ["r1", "routine", "what people typically do during one of those holidays", "휴일에 사람들이 하는 일"],
    ["e1", "experience", "a special holiday memory from when you were younger", "어렸을 때 특별했던 휴일 추억"],
    ["m1", "memorable", "what you did during the most recent holiday", "가장 최근 휴일에 했던 일"],
    ["i1", "issue", "the different kinds of holidays in your country and how people spend them", "우리나라 휴일 종류와 휴일 활동"],
    ["c1", "comparison", "concerns or problems people talk about around holidays", "휴일 관련 사람들의 우려/걱정"],
  ]),
];

/** Q14/Q15 practice pool derived from the textbook general topics. */
export const textbookAdvancedTopics: Topic[] = [
  ...textbookSurveyTopics,
  ...textbookSurpriseTopics,
]
  .map((t) => {
    const advanced = t.questions.filter((x) => x.type === "issue" || x.type === "comparison");
    return {
      ...t,
      id: `tb-advanced-${t.id.replace(/^tb-/, "")}`,
      category: "advanced" as const,
      ko: t.ko.replace("교재 기반 · ", "교재 고난도 · "),
      en: t.en.replace("Textbook-based: ", "Textbook advanced: "),
      questions: advanced.map((x) => ({ ...x, id: `adv-${x.id}` })),
    };
  })
  .filter((t) => t.questions.some((x) => x.type === "issue") && t.questions.some((x) => x.type === "comparison"));

const rpSet = (
  prefix: string,
  askFocus: string,
  askKo: string,
  problemFocus: string,
  problemKo: string,
  experienceFocus: string,
  experienceKo: string,
): Question[] => [
  q(prefix, ["11", "roleplay_ask", askFocus, askKo]),
  q(prefix, ["12", "roleplay_problem", problemFocus, problemKo]),
  q(prefix, ["13", "memorable", experienceFocus, experienceKo]),
];

const rpTopic = (
  id: string,
  ko: string,
  en: string,
  emoji: string,
  questions: Question[],
): Topic => ({
  id: `tb-rp-${id}`,
  category: "roleplay",
  ko: `교재 롤플레이 · ${ko}`,
  en: `Textbook roleplay: ${en}`,
  emoji,
  questions,
});

export const textbookRoleplayTopics: Topic[] = [
  rpTopic("store", "상점", "Store", "🛍️", rpSet("rp-store", "You are at a clothing store and want to buy some clothes.", "옷가게에서 사고 싶은 옷에 대해 3~4가지 질문", "The clothes you ordered arrived, but one shirt is damaged or is the wrong item.", "배달된 셔츠에 문제가 있어 교환/환불 등 해결책 제시", "a time you were unhappy with something you bought or a service you received", "구매 물건이나 서비스에 불만이 있었던 경험")),
  rpTopic("travel", "여행", "Travel", "✈️", rpSet("rp-travel", "You are planning a trip and call a travel agency about a package or itinerary.", "여행사에 여행 상품/일정 관련 질문", "Your travel plan has to change unexpectedly, so contact the travel agency or your companion.", "여행 계획 변경 상황을 설명하고 대안 제시", "an unusual travel experience or a difficulty you had while planning a trip", "여행 중 특이한 경험 또는 여행 계획 과정의 어려움")),
  rpTopic("hotel", "호텔", "Hotel", "🏨", rpSet("rp-hotel", "You arrived in a new city and need a hotel room for tonight.", "당일 숙박 가능한 호텔 객실과 조건 문의", "Your hotel room is too small, dirty, unavailable, or otherwise unacceptable.", "호텔 객실 문제를 설명하고 방 변경/환불 등 대안 제시", "a memorable hotel experience or a trip that did not go as planned", "호텔에서 기억에 남는 경험 또는 여행 계획 차질 경험")),
  rpTopic("furniture", "가구", "Furniture", "🪑", rpSet("rp-furniture", "You are at a furniture store and want information about a piece of furniture before buying it.", "가구점에서 사고 싶은 가구에 대해 질문", "The furniture was delivered, but it has a serious problem or you dislike its appearance.", "배송된 가구 문제를 설명하고 해결책 제시", "a time furniture or something you bought for your home had a problem", "구매한 가구나 집에 들인 물건에 문제가 있었던 경험")),
  rpTopic("real-estate", "부동산", "Real estate", "🏠", rpSet("rp-real-estate", "You are looking for a home and call a real-estate office to ask about available places.", "부동산에 원하는 집 조건을 문의", "After moving in, you discover a broken window or another serious defect that needs repair.", "입주 후 발견한 하자를 설명하고 수리 요청", "a time you found something broken and had to get it fixed", "깨진 물건이나 하자를 발견하고 해결한 경험")),
  rpTopic("relative-house", "친척집", "Relative's house", "🏡", rpSet("rp-relative-house", "You agreed to look after a relative's home while they are away and need instructions.", "휴가 간 친척의 집을 봐주기 위해 필요한 사항 질문", "You arrive at the house but cannot get in because the door is locked or the key is missing.", "친척집에 들어갈 수 없는 문제를 설명하고 대안 제시", "a time you promised to help a friend or family member but could not keep the promise", "친구/가족을 도와주기로 했다가 지키지 못한 경험")),
  rpTopic("recycling", "재활용", "Recycling", "♻️", rpSet("rp-recycling", "You just moved into a building and call the office to ask how recycling works there.", "새로 입주한 건물의 재활용 방법 문의", "Someone put regular trash in the recycling area, or you have a large amount of party trash to handle.", "재활용/쓰레기 처리 문제를 설명하고 해결책 제시", "a recycling problem or a memorable recycling experience", "재활용 중 겪었던 문제나 기억에 남는 경험")),
  rpTopic("mp3", "MP3 플레이어", "MP3 player", "🎵", rpSet("rp-mp3", "A friend has an MP3 player you are interested in, so call and ask about it.", "친구가 쓰는 MP3 플레이어에 대해 질문", "You borrowed your friend's MP3 player and accidentally broke it.", "빌린 MP3 플레이어를 고장 내고 대안 제시", "a time one of your devices broke and how you handled it", "기계나 기기 고장 경험")),
  rpTopic("flight", "항공편", "Flight", "🛫", rpSet("rp-flight", "Your flight is delayed, so ask the airline counter for details and options.", "항공편 지연 상황에서 카운터에 정보 문의", "The delay means you will miss an important customer meeting or connection.", "항공편 지연으로 중요한 일정을 놓치게 된 상황 설명 및 대안 제시", "a difficult travel experience involving a flight or airport", "여행 중 겪은 항공편/공항 관련 어려움")),
  rpTopic("rental-car", "렌터카", "Rental car", "🚗", rpSet("rp-rental-car", "You want to rent a car and call the rental company for information.", "렌터카 업체에 차종/가격/조건 문의", "The rental car has a problem, or the car type you reserved is unavailable.", "렌터카 문제 또는 원하는 차종이 없는 상황 해결", "a memorable experience using a rental car", "렌터카 이용 경험")),
  rpTopic("car-problem", "자동차 고장", "Car problem", "🔧", rpSet("rp-car-problem", "Your car has a problem and you go to a service center to ask about repairs.", "서비스센터에 차량 수리 문의", "Because your car broke down, you cannot make it to an important meeting on time.", "차 고장으로 약속/미팅에 못 가는 상황 설명 및 대안 제시", "a time your car had a problem and what you did about it", "차량에 문제가 생겼던 경험과 대처")),
  rpTopic("performance", "공연", "Performance", "🎤", rpSet("rp-performance", "You want to buy tickets for a performance and call the venue for information.", "공연장에 티켓 구매 관련 질문", "You become sick and cannot attend the performance with your friend.", "공연에 못 가는 사정을 설명하고 일정 변경/대안 제시", "a time a ticket or reservation plan did not work out", "티켓/예약 계획에 차질이 생긴 경험")),
  rpTopic("movie", "영화", "Movie theater", "🎬", rpSet("rp-movie", "You want to buy movie tickets for yourself and a friend and call the theater for information.", "영화관에 영화표 구매 관련 질문", "At the theater you discover that the clerk sold you the wrong tickets or seats.", "잘못 판매된 영화표 문제 설명 및 해결", "a time you canceled a plan at the last minute or watched a very disappointing movie", "막판에 계획을 취소했거나 지루한 영화를 본 경험")),
  rpTopic("tv", "텔레비전", "Television", "📺", rpSet("rp-tv", "You are inviting friends over and call to ask what movie or program they want to watch.", "친구들에게 보고 싶은 영화/프로그램 질문", "Your TV or streaming service will not play the movie when your friends arrive.", "TV/스트리밍 재생 문제를 설명하고 대안 제시", "a time your plan to watch a movie or TV show went wrong", "영화/TV를 보려다 차질을 빚은 경험")),
  rpTopic("bank", "은행", "Bank", "🏦", rpSet("rp-bank", "You want to open a bank account and call the bank for information.", "은행에 계좌 개설 관련 질문", "You received a card, but there is a problem with it or an ATM transaction.", "카드/ATM 문제를 설명하고 해결 요청", "a time you had a problem using a card, ATM, or banking service", "카드나 ATM 사용 중 문제 경험")),
  rpTopic("hospital", "병원", "Hospital", "🏥", rpSet("rp-hospital", "You need a medical appointment and call a hospital to ask about available times and details.", "병원 진료 예약 문의", "Something came up and you need to change or cancel the appointment.", "병원 예약을 변경해야 하는 상황 설명 및 대안 제시", "a time you had to cancel, change, or arrive late for an important appointment", "중요한 예약/미팅을 취소하거나 늦은 경험")),
  rpTopic("interview", "회사 면접", "Company interview", "💼", rpSet("rp-interview", "You have an interview with a company and call to ask for information before you go.", "면접 보러 갈 회사에 필요한 정보 질문", "An emergency prevents you from attending the interview as scheduled.", "면접에 못 가는 긴급 상황 설명 및 대안 제시", "a time you could not attend a class, meeting, or interview", "수업/미팅/면접에 못 간 경험")),
  rpTopic("party", "파티", "Party", "🎉", rpSet("rp-party", "A friend invited you to a holiday party, so call and ask about the plan and what you should bring.", "친구의 휴일 파티에 대해 질문", "A car accident, time conflict, or another problem will make you late or unable to help with the party.", "파티에 늦거나 준비를 돕지 못하는 상황 설명 및 대안 제시", "a time you canceled a party, trip, or event at the last minute", "막판에 파티/여행/행사를 취소한 경험")),
  rpTopic("friend-meeting", "친구 약속", "Meeting a friend", "🤝", rpSet("rp-friend-meeting", "Call a friend to suggest meeting this weekend and ask what to do and when to meet.", "친구에게 주말 약속을 제안하고 시간/활동 질문", "You can no longer keep the appointment, so call your friend and explain why.", "친구와의 약속을 못 지키는 상황 설명 및 대안 제시", "a time you had to cancel plans with someone", "누군가와의 약속을 취소한 경험")),
  rpTopic("tech-report", "기술산업 보고서", "Technology industry report", "💻", rpSet("rp-tech-report", "You are writing a report on the technology industry and call a friend to gather information.", "기술산업 보고서를 위해 친구에게 정보 질문", "You cannot meet your friend as planned to work on the report.", "친구를 만날 수 없는 상황 설명 및 대안 제시", "the first time you encountered a new product or technology", "신제품이나 신기술을 처음 접한 경험")),
  rpTopic("gym", "피트니스 센터/헬스장", "Fitness center / gym", "🏋️", rpSet("rp-gym", "You want to join a fitness class or a new gym and call to ask about the program and facilities.", "피트니스 센터/헬스장 강습과 시설 문의", "You cannot attend a training session or you dislike the gym after your first visit and want another option.", "트레이닝 불참 또는 첫 방문 후 환불/변경 요청", "a challenge or change you made to improve your health", "건강 증진을 위해 했던 도전이나 변화 경험")),
  rpTopic("nutritionist", "영양사", "Nutritionist", "🥗", rpSet("rp-nutritionist", "You want to improve your diet and call a nutritionist to ask about a program.", "영양사에게 식습관 개선 프로그램 질문", "You have to work late and need to reschedule your appointment with the nutritionist.", "야근으로 영양사 예약을 변경하고 대안 제시", "a time you made a major change to your diet or exercise habits", "식습관이나 운동에 큰 변화를 준 경험")),
  rpTopic("health-food", "건강 식품", "Health food", "🥜", rpSet("rp-health-food", "You want to buy a health food product and call the store to ask about it.", "건강 식품 상점에 제품 관련 질문", "The health food you bought has a problem, so call the store to resolve it.", "구매한 건강 식품 문제 설명 및 해결 요청", "a memorable meal or eating experience", "기억에 남는 식사 자리 경험")),
  rpTopic("restaurant", "음식점", "Restaurant", "🍽️", rpSet("rp-restaurant", "A friend's family opened a restaurant, or you found a new restaurant, and you want more information.", "친구나 음식점에 새로 개업한 식당 관련 질문", "Your lunch order was delivered incorrectly, or you realized you have no cash or card at the restaurant.", "잘못 배달된 음식 또는 결제 문제를 설명하고 해결", "a special or unexpected experience you had at a restaurant", "음식점에서 있었던 특별하거나 예기치 않은 경험")),
  rpTopic("internet", "인터넷", "Internet", "🌐", rpSet("rp-internet", "A friend found a useful website, so call and ask about it.", "친구가 찾은 웹사이트에 대해 질문", "The site or your browser will not work, so ask your friend or an Internet service center for help.", "웹사이트/브라우저 접속 문제를 설명하고 도움 요청", "an Internet problem you had or a recent project you completed using the Internet", "인터넷 사용 문제 또는 인터넷 활용 프로젝트 경험")),
  rpTopic("phone", "전화기", "Phone", "📱", rpSet("rp-phone", "You want to buy a new phone or ask your carrier about international roaming.", "휴대전화 구매 또는 해외 로밍 관련 질문", "The new phone does not have the features you need, or international calling is restricted.", "휴대전화 기능/국제통화 문제를 설명하고 해결책 제시", "a time a new product or phone did not meet your expectations", "새 제품/기술 또는 전화기 사용 중 문제 경험")),
];
