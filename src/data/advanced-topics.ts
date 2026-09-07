import type { Topic } from "@/lib/types";

/**
 * 고난도 주제 — 14번(이슈/변화) + 15번(비교/전망) 세트.
 * IH~AL 구간을 가르는 문항이라 추상적 어휘와 논리 전개가 핵심이다.
 */
export const advancedTopics: Topic[] = [
  {
    id: "adv-music",
    category: "advanced",
    ko: "고난도 · 음악 산업의 변화",
    en: "Advanced: changes in the music industry",
    emoji: "🎧",
    questions: [
      {
        id: "advmus-i1",
        type: "issue",
        en: "The way people listen to music has changed a lot over the past few decades. How did people listen to music in the past, and how do they listen to it now? What caused these changes?",
        ko: "음악 소비 방식의 과거와 현재를 비교하고 변화의 원인을 설명하세요.",
        hints: ["people used to buy CDs", "now everything is streamed", "thanks to smartphones", "the industry had to adapt"],
      },
      {
        id: "advmus-c1",
        type: "comparison",
        en: "Some people say streaming services have hurt musicians while others say they have helped them. What is your opinion, and what do you think the music industry will look like in the future?",
        ko: "스트리밍의 명암에 대한 의견과 음악 산업의 미래를 전망하세요.",
        hints: ["on the one hand ... on the other hand", "artists earn very little per stream", "but it lowered the barrier to entry", "I'd say the trend will continue"],
      },
    ],
  },
  {
    id: "adv-travel",
    category: "advanced",
    ko: "고난도 · 여행 산업의 변화",
    en: "Advanced: changes in travel",
    emoji: "✈️",
    questions: [
      {
        id: "advovs-i1",
        type: "issue",
        en: "Traveling abroad has become much more common than it used to be. How has international travel changed over the years, and what do you think made it change?",
        ko: "해외여행의 변화 양상과 그 원인을 설명하세요.",
        hints: ["low-cost carriers", "it used to be a luxury", "booking everything online", "social media made people want to travel"],
      },
      {
        id: "advovs-c1",
        type: "comparison",
        en: "What are some problems that come with the growth of tourism, such as overcrowding or rising prices for local residents? What do you think should be done about them?",
        ko: "관광 산업 성장의 부작용과 해결 방안을 논하세요.",
        hints: ["overtourism", "locals are being priced out", "some cities have introduced a tourist tax", "there has to be a balance"],
      },
    ],
  },
  {
    id: "adv-health",
    category: "advanced",
    ko: "고난도 · 건강과 운동 문화",
    en: "Advanced: health and fitness culture",
    emoji: "💪",
    questions: [
      {
        id: "advhlt-i1",
        type: "issue",
        en: "People today seem much more interested in health and exercise than in the past. What has changed about how people take care of their health, and why do you think that happened?",
        ko: "건강 관리 방식의 변화와 그 배경을 설명하세요.",
        hints: ["fitness apps and wearables", "people are more informed now", "an aging society", "prevention rather than treatment"],
      },
      {
        id: "advhlt-c1",
        type: "comparison",
        en: "What are the main health concerns people face these days, and how are they different from the concerns people had in the past? What could be done to address them?",
        ko: "현재와 과거의 건강 문제를 비교하고 해결 방안을 제시하세요.",
        hints: ["sedentary lifestyle", "stress and burnout", "back then it was mostly about", "companies should encourage"],
      },
    ],
  },
  {
    id: "adv-shopping",
    category: "advanced",
    ko: "고난도 · 소비와 쇼핑의 변화",
    en: "Advanced: changes in shopping",
    emoji: "🛍️",
    questions: [
      {
        id: "advshp-i1",
        type: "issue",
        en: "The way people shop has changed dramatically. Compare how people shopped in the past with how they shop now, and explain what caused the shift.",
        ko: "쇼핑 방식의 과거와 현재를 비교하고 변화 원인을 설명하세요.",
        hints: ["people used to go to markets", "now it's all done on an app", "same-day delivery", "the pandemic accelerated it"],
      },
      {
        id: "advshp-c1",
        type: "comparison",
        en: "Online shopping has brought both benefits and problems. What are the biggest issues, and what do you think stores and consumers should do about them?",
        ko: "온라인 쇼핑의 장단점과 대응 방안을 논하세요.",
        hints: ["excessive packaging waste", "small local shops are struggling", "impulse buying", "consumers need to be more mindful"],
      },
    ],
  },
  {
    id: "adv-housing",
    category: "advanced",
    ko: "고난도 · 주거 문제",
    en: "Advanced: housing issues",
    emoji: "🏠",
    questions: [
      {
        id: "advapt-i1",
        type: "issue",
        en: "The way people live has changed a lot, with more and more people living alone. Why do you think this is happening, and how has it changed housing in your country?",
        ko: "1인 가구 증가 현상의 원인과 주거 변화를 설명하세요.",
        hints: ["more single-person households", "people marry later", "small studio apartments", "services designed for one person"],
      },
      {
        id: "advapt-c1",
        type: "comparison",
        en: "Housing prices and rent have become a serious issue in many cities. What problems does this create, and what do you think the government or society should do about it?",
        ko: "집값·임대료 문제의 영향과 사회적 해결 방안을 논하세요.",
        hints: ["young people can't afford to buy", "they're forced to move further out", "public housing", "there's no easy solution"],
      },
    ],
  },
  {
    id: "adv-environment",
    category: "advanced",
    ko: "고난도 · 환경 문제",
    en: "Advanced: environmental issues",
    emoji: "♻️",
    questions: [
      {
        id: "advrec-i1",
        type: "issue",
        en: "Environmental awareness has grown significantly in recent years. How have people's attitudes and habits changed, and what do you think caused the change?",
        ko: "환경 인식과 습관의 변화, 그 원인을 설명하세요.",
        hints: ["people bring their own tote bags", "reusable cups", "extreme weather made it real", "companies are under pressure"],
      },
      {
        id: "advrec-c1",
        type: "comparison",
        en: "Some people believe individual efforts like recycling make a real difference, while others think only governments and corporations can solve environmental problems. What do you think?",
        ko: "개인의 노력 vs 정부·기업의 역할에 대한 의견을 논하세요.",
        hints: ["I can see both sides", "individual actions add up", "but the scale is completely different", "it has to happen on both levels"],
      },
    ],
  },
  {
    id: "adv-technology",
    category: "advanced",
    ko: "고난도 · 기술의 변화",
    en: "Advanced: changes in technology",
    emoji: "💻",
    questions: [
      {
        id: "advint-i1",
        type: "issue",
        en: "Technology has changed everyday life enormously. Pick one area of daily life and explain how technology has changed it, comparing the past with the present.",
        ko: "기술이 바꾼 일상의 한 영역을 과거와 현재로 비교해 설명하세요.",
        hints: ["take communication for example", "we used to call or text", "now everything's instant", "it saves time but"],
      },
      {
        id: "advint-c1",
        type: "comparison",
        en: "Many people worry that we depend too much on smartphones and the Internet. Do you agree? What problems does it cause, and what could be done about it?",
        ko: "스마트폰·인터넷 의존 문제에 대한 의견과 대책을 논하세요.",
        hints: ["I'd have to agree to some extent", "shorter attention spans", "digital detox", "it's about setting boundaries"],
      },
    ],
  },
  {
    id: "adv-transport",
    category: "advanced",
    ko: "고난도 · 교통 문제",
    en: "Advanced: transportation issues",
    emoji: "🚇",
    questions: [
      {
        id: "advtrn-i1",
        type: "issue",
        en: "Transportation in cities has changed over the years. How has it changed in your country, and what are the biggest transportation problems people face today?",
        ko: "교통 환경의 변화와 현재의 문제점을 설명하세요.",
        hints: ["new subway lines have opened", "traffic congestion is worse", "rush hour is brutal", "commuting times keep getting longer"],
      },
      {
        id: "advtrn-c1",
        type: "comparison",
        en: "Some cities are trying to reduce the number of cars by improving public transportation. Do you think that is a good approach? What else could be done?",
        ko: "자동차 감축 정책에 대한 의견과 추가 대안을 논하세요.",
        hints: ["it's a step in the right direction", "unless it's convenient, people won't switch", "bike lanes", "remote work reduced traffic"],
      },
    ],
  },
  {
    id: "adv-leisure",
    category: "advanced",
    ko: "고난도 · 여가 문화의 변화",
    en: "Advanced: changes in leisure culture",
    emoji: "🎮",
    questions: [
      {
        id: "advfre-i1",
        type: "issue",
        en: "How people spend their free time has changed a lot over the years. Compare how people used to spend their leisure time with how they spend it now, and explain why.",
        ko: "여가 활용 방식의 과거와 현재를 비교하고 이유를 설명하세요.",
        hints: ["people used to go out more", "now a lot of it happens at home", "streaming and games", "shorter working hours changed things"],
      },
      {
        id: "advfre-c1",
        type: "comparison",
        en: "Work-life balance has become an important topic. How has people's attitude toward work and personal time changed, and what do you think it will be like in the future?",
        ko: "일과 삶의 균형에 대한 인식 변화와 전망을 논하세요.",
        hints: ["the older generation lived to work", "younger people value their own time", "remote work blurred the line", "I expect it'll keep shifting"],
      },
    ],
  },
  {
    id: "adv-dining",
    category: "advanced",
    ko: "고난도 · 외식 문화의 변화",
    en: "Advanced: changes in dining culture",
    emoji: "🍽️",
    questions: [
      {
        id: "advrst-i1",
        type: "issue",
        en: "Eating habits and restaurant culture have changed in your country. What is different now compared with the past, and what brought about these changes?",
        ko: "식습관과 외식 문화의 변화와 그 원인을 설명하세요.",
        hints: ["delivery apps changed everything", "more single diners", "healthier options", "people eat out far more often"],
      },
      {
        id: "advrst-c1",
        type: "comparison",
        en: "Food delivery has become extremely popular. What are the good and bad sides of this trend, and how do you think it will develop in the future?",
        ko: "배달 문화의 장단점과 향후 전망을 논하세요.",
        hints: ["incredibly convenient", "the amount of plastic waste", "restaurants pay high commissions", "I doubt it's going away"],
      },
    ],
  },
];
