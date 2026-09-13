import type { Topic } from "../lib/types";
import { surveyPracticeSets } from "./survey-practice-sets";

/** 제공된 돌발 자료의 영어 지문·제목·번호·순서를 그대로 보존합니다. */
export const surpriseTopics: Topic[] = [
  {
    "id": "recycling",
    "category": "surprise",
    "ko": "재활용",
    "en": "Recycling",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.recycling,
    "questions": [
      {
        "id": "recycling-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "I would like to know about how recycling is practiced in your country. What do people specifically do? Tell me how things are recycled.",
        "ko": "당신의 나라에서는 재활용을 어떻게 하나요? 사람들이 구체적으로 무엇을 하는지, 물건이 어떻게 재활용되는지 알려 주세요."
      },
      {
        "id": "recycling-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "Recycling is a common practice. Tell me about all the different kinds of things that you recycle.",
        "ko": "재활용은 흔히 하는 일입니다. 당신이 재활용하는 여러 종류의 물건을 모두 말해 주세요."
      },
      {
        "id": "recycling-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Tell me what recycling was like when you were a child. Was there a particular place to which you took out the recyclables? Were there any special containers? Describe what it was like and what you did in detail.",
        "ko": "어릴 때 재활용을 어떻게 했는지 말해 주세요. 재활용품을 가져가는 정해진 장소나 특별한 수거함이 있었나요? 당시 모습과 당신이 했던 일을 자세히 설명해 주세요."
      },
      {
        "id": "recycling-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "I would like to know about how recycling is practiced in your country. What do people specifically do? Tell me how things are recycled.",
        "ko": "당신의 나라에서는 재활용을 어떻게 하나요? 사람들이 구체적으로 무엇을 하는지, 물건이 어떻게 재활용되는지 알려 주세요."
      },
      {
        "id": "recycling-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me what recycling was like when you were a child. Was there a particular place to which you took out the recyclables? Were there any special containers? Describe what it was like and what you did in detail.",
        "ko": "어릴 때 재활용을 어떻게 했는지 말해 주세요. 재활용품을 가져가는 정해진 장소나 특별한 수거함이 있었나요? 당시 모습과 당신이 했던 일을 자세히 설명해 주세요."
      },
      {
        "id": "recycling-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Problems sometimes occur while recycling. Perhaps the pick-up service did not come as planned. Or, the items were too big for the containers. Or, the container was knocked over and some items spilled out. Tell me about something memorable related to recycling.",
        "ko": "재활용을 하다가 문제가 생기기도 합니다. 수거 서비스가 예정대로 오지 않거나, 물건이 수거함에 비해 너무 크거나, 수거함이 넘어져 내용물이 쏟아질 수 있습니다. 재활용과 관련해 기억에 남는 일을 말해 주세요."
      },
      {
        "id": "recycling-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "I would like to know about how recycling is practiced in your country. What do people specifically do? Tell me how things are recycled.",
        "ko": "당신의 나라에서는 재활용을 어떻게 하나요? 사람들이 구체적으로 무엇을 하는지, 물건이 어떻게 재활용되는지 알려 주세요."
      },
      {
        "id": "recycling-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me what recycling was like when you were a child. Was there a particular place to which you took out the recyclables? Were there any special containers? Describe what it was like and what you did in detail.",
        "ko": "어릴 때 재활용을 어떻게 했는지 말해 주세요. 재활용품을 가져가는 정해진 장소나 특별한 수거함이 있었나요? 당시 모습과 당신이 했던 일을 자세히 설명해 주세요."
      },
      {
        "id": "recycling-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Problems sometimes occur while recycling. Perhaps the pick-up service did not come as planned. Or, the items were too big for the containers. Or, the container was knocked over and some items spilled out. Tell me about something memorable related to recycling.",
        "ko": "재활용을 하다가 문제가 생기기도 합니다. 수거 서비스가 예정대로 오지 않거나, 물건이 수거함에 비해 너무 크거나, 수거함이 넘어져 내용물이 쏟아질 수 있습니다. 재활용과 관련해 기억에 남는 일을 말해 주세요."
      },
      {
        "id": "recycling-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "Suppose that you've just moved into a big apartment building. Call the person of the front desk and ask 3-4 questions about the building's recycling policy.",
        "ko": "큰 아파트 건물로 막 이사했다고 가정해 보세요. 안내 데스크 직원에게 전화하여 건물의 재활용 정책에 대해 서너 가지 질문을 하세요."
      },
      {
        "id": "recycling-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "A new resident from abroad has just rented an apartment in your building. However, he is throwing away garbage in the recycling bin. Other residents are very upset about that. Go to the new resident and explain the situation and tell him about the recycling policy.",
        "ko": "외국에서 온 새 주민이 아파트를 임대했지만 재활용함에 쓰레기를 버려 다른 주민들이 화가 났습니다. 새 주민에게 상황과 재활용 정책을 설명하세요."
      },
      {
        "id": "recycling-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "Tell me what recycling was like when you were a child. Was there a particular place you took out the recyclables to? How was recycling back then different from what you are doing now?",
        "ko": "어릴 때 재활용을 어떻게 했는지 말해 주세요. 재활용품을 가져가는 정해진 장소나 특별한 수거함이 있었나요? 당시 모습과 당신이 했던 일을 자세히 설명해 주세요."
      },
      {
        "id": "recycling-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "Suppose that you've just moved into a big apartment building. Call the person of the front desk and ask 3-4 questions about the building's recycling policy.",
        "ko": "큰 아파트 건물로 막 이사했다고 가정해 보세요. 안내 데스크 직원에게 전화하여 건물의 재활용 정책에 대해 서너 가지 질문을 하세요."
      },
      {
        "id": "recycling-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "You often host a large party and take out most of the recycling and garbage the next day. However, other residents in your building are not happy about it. One of them has come to complain to you. Explain your situation and offer several suggestions to resolve the problem.",
        "ko": "큰 파티를 자주 열고 다음 날 재활용품과 쓰레기를 내놓아 주민이 항의했습니다. 상황을 설명하고 해결책을 몇 가지 제안하세요."
      },
      {
        "id": "recycling-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "Describe a specific time in which you had trouble with recycling. It may have been a situation where you moved to a new place and did not know the rules. Or you put the materials in the wrong containers. Describe what happened from beginning to end.",
        "ko": "재활용 때문에 어려움을 겪었던 구체적인 때를 처음부터 끝까지 설명해 주세요."
      },
      {
        "id": "recycling-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "The handling of recycling materials has changed over the years. Tell me how recycling materials were collected in the past and how this has evolved over the years.",
        "ko": "재활용품을 처리하는 방식은 세월이 흐르면서 바뀌었습니다. 과거에는 어떻게 수거했고, 그 방식이 시간이 지나면서 어떻게 달라졌는지 말해 주세요."
      },
      {
        "id": "recycling-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Stories about recycling are often in the media. Tell me about one news story that you heard of related to the recycling or perhaps the environment. Describe what the story was about and what the reaction to the story was.",
        "ko": "재활용 관련 이야기는 언론에 자주 나옵니다. 재활용이나 환경에 관해 들은 뉴스 한 가지를 말해 주세요. 어떤 내용이었고 사람들이 어떻게 반응했는지 설명해 주세요."
      },
      {
        "id": "recycling-advanced2-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Describe what the attitude was toward recycling when you were a child. Did people recycle then? Did they throw everything out in the garbage? What were people’s views on recycling at that time and how have they changed over the years?",
        "ko": "어릴 때 사람들이 재활용을 어떻게 생각했는지 설명해 주세요. 당시에도 재활용했나요, 아니면 모든 것을 쓰레기로 버렸나요? 당시의 인식과 그 인식이 시간이 지나면서 어떻게 바뀌었는지 말해 주세요."
      },
      {
        "id": "recycling-advanced2-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Stories about recycling are often in the media. Tell me about one news story that you heard of related to the recycling or perhaps the environment. Describe what the story was about and what the reaction to the story was.",
        "ko": "재활용 관련 이야기는 언론에 자주 나옵니다. 재활용이나 환경에 관해 들은 뉴스 한 가지를 말해 주세요. 어떤 내용이었고 사람들이 어떻게 반응했는지 설명해 주세요."
      }
    ]
  },
  {
    "id": "industry",
    "category": "surprise",
    "ko": "산업 & 취업",
    "en": "Industry & Employment",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.industry,
    "questions": [
      {
        "id": "industry-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What are some of the companies that young people want to work for these days? Why do young people want to work for these companies?",
        "ko": "요즘 젊은 사람들이 일하고 싶어 하는 회사에는 어떤 곳들이 있나요? 왜 그 회사에서 일하고 싶어 하나요?"
      },
      {
        "id": "industry-combo1-q3",
        "number": "3",
        "type": "description",
        "source": "provided",
        "en": "Describe a company or industry in your country that is attractive to workers. When did this company or industry start? How has it become successful? What has made this company or industry so attractive to workers?",
        "ko": "당신의 나라에서 근로자에게 매력적인 회사나 산업을 설명해 주세요. 언제 시작됐고 어떻게 성공했나요? 어떤 점 때문에 근로자들에게 매력적이 되었나요?"
      },
      {
        "id": "industry-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "What kinds of efforts have you made for your career in the past? Tell me about some individual efforts that you have made for your career.",
        "ko": "과거에 진로를 위해 어떤 노력을 했나요? 진로를 위해 개인적으로 기울인 노력들을 말해 주세요."
      },
      {
        "id": "industry-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What are some of the companies that young people want to work for these days? Why do young people want to work for these companies?",
        "ko": "요즘 젊은 사람들이 일하고 싶어 하는 회사에는 어떤 곳들이 있나요? 왜 그 회사에서 일하고 싶어 하나요?"
      },
      {
        "id": "industry-combo2-q6",
        "number": "6",
        "type": "description",
        "source": "provided",
        "en": "Describe a company or industry in your country that is attractive to workers. When did this company or industry start? How has it become successful? What has made this company or industry so attractive to workers?",
        "ko": "당신의 나라에서 근로자에게 매력적인 회사나 산업을 설명해 주세요. 언제 시작됐고 어떻게 성공했나요? 어떤 점 때문에 근로자들에게 매력적이 되었나요?"
      },
      {
        "id": "industry-combo2-q7",
        "number": "7",
        "type": "routine",
        "source": "provided",
        "en": "What do people usually do to prepare for their future careers? How do they learn about the different types of industries and how do they get ready to apply for those jobs?",
        "ko": "사람들은 보통 미래의 진로를 위해 무엇을 준비하나요? 다양한 산업에 대해 어떻게 알아보고, 그 일자리에 지원할 준비를 어떻게 하나요?"
      },
      {
        "id": "industry-combo3-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Tell me about one industry in your country that is well-known. You can talk about any industry such as the entertainment, technology, automotive industry or other industries. Pick one industry and tell me all about it.",
        "ko": "당신의 나라에서 잘 알려진 산업 하나를 말해 주세요. 엔터테인먼트, 기술, 자동차 등 어떤 산업이든 좋습니다. 하나를 골라 자세히 설명해 주세요."
      },
      {
        "id": "industry-combo3-q6",
        "number": "6",
        "type": "description",
        "source": "provided",
        "en": "Can you tell me about one promising or famous company in this particular industry? Tell me how the company started, and all the things that have happened that made it become so well-known?",
        "ko": "그 산업에서 유망하거나 유명한 회사 하나를 말해 주세요. 회사가 어떻게 시작됐고, 어떤 일들을 거쳐 유명해졌는지 설명해 주세요."
      },
      {
        "id": "industry-combo3-q7",
        "number": "7",
        "type": "experience",
        "source": "provided",
        "en": "When this company introduced its most important products, were they successful right away? Describe to me the challenges this company faced and how the company was able to succeed. Tell me in as much detail as you can.",
        "ko": "그 회사가 가장 중요한 제품을 출시했을 때 바로 성공했나요? 어떤 어려움을 겪었고 어떻게 성공할 수 있었는지 최대한 자세히 설명해 주세요."
      },
      {
        "id": "industry-combo4-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What are some of the companies that young people want to work for these days? Why do young people want to work for these companies?",
        "ko": "요즘 젊은 사람들이 일하고 싶어 하는 회사에는 어떤 곳들이 있나요? 왜 그 회사에서 일하고 싶어 하나요?"
      },
      {
        "id": "industry-combo4-q9",
        "number": "9",
        "type": "description",
        "source": "provided",
        "en": "Describe a company or industry in your country that is attractive to workers. When did this company or industry start? How has it become successful? What has made this company or industry so attractive to workers?",
        "ko": "당신의 나라에서 근로자에게 매력적인 회사나 산업을 설명해 주세요. 언제 시작됐고 어떻게 성공했나요? 어떤 점 때문에 근로자들에게 매력적이 되었나요?"
      },
      {
        "id": "industry-combo4-q10",
        "number": "10",
        "type": "routine",
        "source": "provided",
        "en": "What do people usually do to prepare for their future careers? How do they learn about the different types of industries and how do they get ready to apply for those jobs?",
        "ko": "사람들은 보통 미래의 진로를 위해 무엇을 준비하나요? 다양한 산업에 대해 어떻게 알아보고, 그 일자리에 지원할 준비를 어떻게 하나요?"
      },
      {
        "id": "industry-combo5-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Tell me about one industry in your country that is well-known. You can talk about any industry such as the entertainment, technology, automotive industry or other industries. Pick one industry and tell me all about it.",
        "ko": "당신의 나라에서 잘 알려진 산업 하나를 말해 주세요. 엔터테인먼트, 기술, 자동차 등 어떤 산업이든 좋습니다. 하나를 골라 자세히 설명해 주세요."
      },
      {
        "id": "industry-combo5-q9",
        "number": "9",
        "type": "description",
        "source": "provided",
        "en": "Can you tell me about one promising or famous company in this particular industry? Tell me how the company started, and all the things that have happened that made it become so well-known?",
        "ko": "그 산업에서 유망하거나 유명한 회사 하나를 말해 주세요. 회사가 어떻게 시작됐고, 어떤 일들을 거쳐 유명해졌는지 설명해 주세요."
      },
      {
        "id": "industry-combo5-q10",
        "number": "10",
        "type": "experience",
        "source": "provided",
        "en": "When this company introduced its most important products, were they successful right away? Describe to me the challenges this company faced and how the company was able to succeed. Tell me in as much detail as you can.",
        "ko": "그 회사가 가장 중요한 제품을 출시했을 때 바로 성공했나요? 어떤 어려움을 겪었고 어떻게 성공할 수 있었는지 최대한 자세히 설명해 주세요."
      },
      {
        "id": "industry-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You applied to a company to look for a new job. Ask a few questions to learn more about the position.",
        "ko": "새 일자리를 찾기 위해 회사에 지원했습니다. 그 직책에 대해 더 알아보기 위한 몇 가지 질문을 하세요."
      },
      {
        "id": "industry-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. You started at a new job, and some problems have come up that you can’t solve. Explain to your supervisor or colleagues what happened and ask for help to resolve the issues.",
        "ko": "새 직장에서 혼자 해결할 수 없는 문제가 생겼습니다. 상사나 동료에게 상황을 설명하고 도움을 요청하세요."
      },
      {
        "id": "industry-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Talk about an experience with a problem that occurred at your new job. Perhaps you were asked to work on an impossible project, or you didn’t agree with your boss. Explain how you resolved the issue.",
        "ko": "새 직장에서 문제가 발생했던 경험과 그것을 어떻게 해결했는지 설명해 주세요."
      },
      {
        "id": "industry-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I’d like to give you a situation and ask you to act it out. Imagine that you have an interview for a job at a very important company. To prepare for the interview, you want to learn more about the company. Call the company and ask three or four questions to learn more about it.",
        "ko": "중요한 회사의 취업 면접을 준비하기 위해 회사에 전화하여 서너 가지 질문을 하세요."
      },
      {
        "id": "industry-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I’m sorry, but there is a problem which I need you to resolve. Due to an emergency, you will not be able to attend your job interview. Call the company and leave a message explaining the situation. And then, offer two or three alternate plans so that you do not lose this opportunity.",
        "ko": "긴급 상황으로 면접에 참석할 수 없습니다. 회사에 상황을 설명하고 두세 가지 대안을 제시하세요."
      },
      {
        "id": "industry-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Have you ever had to miss a class, a meeting or an interview at school or for work? Tell me the story of that experience. When did it happen and how did you resolve the situation? Give me lots of details.",
        "ko": "학교나 직장에서 수업, 회의 또는 면접에 참석하지 못했던 경험과 해결 방법을 자세히 말해 주세요."
      },
      {
        "id": "industry-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Tell me about an industry you follow. Is it related to food, energy, or mobile computing? How is it different from three years ago?",
        "ko": "관심 있게 지켜보는 산업을 말해 주세요. 식품, 에너지, 모바일 컴퓨팅과 관련된 산업인가요? 3년 전과 어떻게 다른가요?"
      },
      {
        "id": "industry-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Tell me about an incident that occurred in the industry you follow. Perhaps a game company released a new game, but the public was disappointed about it. Or perhaps a company released a new device, but it didn't meet people's expectations. How did your community react to the incident?",
        "ko": "관심 있게 지켜보는 산업에서 일어난 사건을 말해 주세요. 게임 회사의 신작이나 회사가 출시한 새 기기가 대중의 기대에 못 미쳤을 수도 있습니다. 당신의 커뮤니티는 그 사건에 어떻게 반응했나요?"
      },
      {
        "id": "industry-advanced2-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "How do people prepare for future work in your country's industries? Do they get general education first or receive specific training once they join a company? Do they receive specific job training from a young age? How has the process changed over the past 5 years? Give me all the details.",
        "ko": "당신의 나라에서 사람들은 산업 분야의 미래 업무를 어떻게 준비하나요? 먼저 일반 교육을 받나요, 입사한 뒤 전문 훈련을 받나요? 어린 나이부터 특정 직업 훈련을 받기도 하나요? 지난 5년간 그 과정이 어떻게 달라졌는지 자세히 말해 주세요."
      },
      {
        "id": "industry-advanced2-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "What is an industry or a company that people in your country are talking about nowadays? Tell me why people are interested in this industry and what they are saying about it.",
        "ko": "요즘 당신의 나라에서 사람들이 이야기하는 산업이나 회사는 무엇인가요? 왜 관심을 갖고 있으며 어떤 이야기를 하는지 말해 주세요."
      }
    ]
  },
  {
    "id": "job-hunting",
    "category": "surprise",
    "ko": "구직·진로",
    "en": "Job Hunting & Career",
    "emoji": "",
    "questions": [
      {
        "id": "job-hunting-q1",
        "number": "1",
        "title": "Companies Young People Want to Work For",
        "type": "description",
        "source": "provided",
        "en": "What are some of the companies that young people want to work for these days? Why do young people want to work for these companies?",
        "ko": "요즘 젊은 사람들이 일하고 싶어 하는 회사에는 어떤 곳들이 있나요? 왜 그 회사에서 일하고 싶어 하나요?"
      },
      {
        "id": "job-hunting-q2",
        "number": "2",
        "title": "An Attractive Company or Industry",
        "type": "description",
        "source": "provided",
        "en": "Describe a company or industry in your country that is attractive to workers. When did this company or industry start? How has it become successful? What has made this company or industry so attractive to workers?",
        "ko": "당신의 나라에서 근로자에게 매력적인 회사나 산업을 설명해 주세요. 언제 시작됐고 어떻게 성공했나요? 어떤 점 때문에 근로자들에게 매력적이 되었나요?"
      },
      {
        "id": "job-hunting-q3",
        "number": "3",
        "title": "Preparing for a Future Career",
        "type": "routine",
        "source": "provided",
        "en": "What do people usually do to prepare for their future careers? How do they learn about the different types of industries, and how do they get ready to apply for those jobs?",
        "ko": "사람들은 보통 미래의 진로를 위해 무엇을 준비하나요? 다양한 산업에 대해 어떻게 알아보고, 그 일자리에 지원할 준비를 어떻게 하나요?"
      },
      {
        "id": "job-hunting-q4",
        "number": "4",
        "title": "Career Education & Training",
        "type": "comparison",
        "source": "provided",
        "en": "How do people prepare for future work in your country's industries? Do they get general education first or receive specific training once they join a company? Do they receive specific job training from a young age? How has the process changed over the past five years? Give me all the details.",
        "ko": "당신의 나라에서 사람들은 산업 분야의 미래 업무를 어떻게 준비하나요? 먼저 일반 교육을 받나요, 입사한 뒤 전문 훈련을 받나요? 어린 나이부터 특정 직업 훈련을 받기도 하나요? 지난 5년간 그 과정이 어떻게 달라졌는지 자세히 말해 주세요."
      },
      {
        "id": "job-hunting-q5",
        "number": "5",
        "title": "A Company or Industry People Are Talking About",
        "type": "issue",
        "source": "provided",
        "en": "What is an industry or a company that people in your country are talking about nowadays? Tell me why people are interested in this industry and what they are saying about it.",
        "ko": "요즘 당신의 나라에서 사람들이 이야기하는 산업이나 회사는 무엇인가요? 왜 관심을 갖고 있으며 어떤 이야기를 하는지 말해 주세요."
      }
    ]
  },
  {
    "id": "workplaces",
    "category": "surprise",
    "ko": "직업 & 직장",
    "en": "Jobs & Workplaces",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.workplaces,
    "questions": [
      {
        "id": "workplaces-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kinds of places do people in your country usually work at? Tell me about the common types of jobs and workplaces in your country.",
        "ko": "당신의 나라에서 사람들은 보통 어떤 곳에서 일하나요? 흔한 직업과 직장 유형에 대해 말해 주세요."
      },
      {
        "id": "workplaces-combo1-q3",
        "number": "3",
        "type": "description",
        "source": "provided",
        "en": "What kinds of jobs do people in your area usually have? What kinds of workplaces are popular among people these days? Tell me about where people work and what these workplaces are like.",
        "ko": "당신의 지역 사람들은 주로 어떤 직업을 갖고 있나요? 요즘 어떤 직장이 인기 있나요? 사람들이 일하는 곳과 그곳의 모습을 말해 주세요."
      },
      {
        "id": "workplaces-combo1-q4",
        "number": "4",
        "type": "comparison",
        "source": "provided",
        "en": "How have jobs in your area changed compared to the past? What kinds of jobs did people use to have, and what kinds of jobs do they have now?",
        "ko": "당신의 지역의 직업은 과거와 비교해 어떻게 바뀌었나요? 예전에는 어떤 직업을 가졌고 지금은 어떤 직업을 갖고 있나요?"
      },
      {
        "id": "workplaces-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What kinds of places do people in your country usually work at? Tell me about the common types of jobs and workplaces in your country.",
        "ko": "당신의 나라에서 사람들은 보통 어떤 곳에서 일하나요? 흔한 직업과 직장 유형에 대해 말해 주세요."
      },
      {
        "id": "workplaces-combo2-q6",
        "number": "6",
        "type": "comparison",
        "source": "provided",
        "en": "How have jobs in your area changed compared to the past? What kinds of jobs did people use to have, and what kinds of jobs do they have now?",
        "ko": "당신의 지역의 직업은 과거와 비교해 어떻게 바뀌었나요? 예전에는 어떤 직업을 가졌고 지금은 어떤 직업을 갖고 있나요?"
      },
      {
        "id": "workplaces-combo2-q7",
        "number": "7",
        "type": "experience",
        "source": "provided",
        "en": "Can you tell me about an early job you had after graduating? Did you have a particularly memorable experience at that early job? Please explain in detail.",
        "ko": "졸업 후 초기에 가졌던 직업에 대해 말해 주세요. 그 직장에서 특히 기억에 남는 경험이 있었나요? 자세히 설명해 주세요."
      },
      {
        "id": "workplaces-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What kinds of places do people in your country usually work at? Tell me about the common types of jobs and workplaces in your country.",
        "ko": "당신의 나라에서 사람들은 보통 어떤 곳에서 일하나요? 흔한 직업과 직장 유형에 대해 말해 주세요."
      },
      {
        "id": "workplaces-combo3-q9",
        "number": "9",
        "type": "comparison",
        "source": "provided",
        "en": "How have jobs in your area changed compared to the past? What kinds of jobs did people use to have, and what kinds of jobs do they have now?",
        "ko": "당신의 지역의 직업은 과거와 비교해 어떻게 바뀌었나요? 예전에는 어떤 직업을 가졌고 지금은 어떤 직업을 갖고 있나요?"
      },
      {
        "id": "workplaces-combo3-q10",
        "number": "10",
        "type": "experience",
        "source": "provided",
        "en": "Can you tell me about an early job you had after graduating? Did you have a particularly memorable experience at that early job? Please explain in detail.",
        "ko": "졸업 후 초기에 가졌던 직업에 대해 말해 주세요. 그 직장에서 특히 기억에 남는 경험이 있었나요? 자세히 설명해 주세요."
      },
      {
        "id": "workplaces-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I’d like to give you a situation and ask you to act it out. Someone moves in next to you, and you first meet your new neighbor. Ask 3-4 questions about his or her profession to get to know him or her.",
        "ko": "중요한 회사의 취업 면접을 준비하기 위해 회사에 전화하여 서너 가지 질문을 하세요."
      },
      {
        "id": "workplaces-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I’m sorry, but there is a problem which I need you to resolve. While you are talking with your neighbor, something urgent comes up and you need to leave. Suggest two or three possible times to meet again later.",
        "ko": "긴급 상황으로 면접에 참석할 수 없습니다. 회사에 상황을 설명하고 두세 가지 대안을 제시하세요."
      },
      {
        "id": "workplaces-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Can you talk about someone in your life who inspires and motivates you in your profession? Please describe in as much detail as possible who he or she is and how he or she inspires you.",
        "ko": "당신의 직업에서 영감과 동기를 주는 사람을 최대한 자세히 설명하고 그 사람이 어떻게 영감을 주는지 말해 주세요."
      },
      {
        "id": "workplaces-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You’ve just joined a new company and need to get a company ID card. Ask the person in charge a few questions about how to get it issued.",
        "ko": "새 일자리를 찾기 위해 회사에 지원했습니다. 그 직책에 대해 더 알아보기 위한 몇 가지 질문을 하세요."
      },
      {
        "id": "workplaces-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. You have received your ID card, but you realized that there is a problem with it. To resolve the issue, explain the problem to the person in charge and ask to have a new ID card issued.",
        "ko": "새 직장에서 혼자 해결할 수 없는 문제가 생겼습니다. 상사나 동료에게 상황을 설명하고 도움을 요청하세요."
      },
      {
        "id": "workplaces-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you gotten an ID card recently? Please explain the whole process in detail, from beginning to end.",
        "ko": "최근 신분증을 발급받은 경험이 있나요? 처음부터 끝까지 전체 과정을 자세히 설명해 주세요."
      },
      {
        "id": "workplaces-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Have there been any changes in workplace in your country from the past to now? What changes have happened? Please, tell me all about them.",
        "ko": "당신의 나라의 직장은 과거부터 지금까지 달라진 점이 있나요? 어떤 변화가 있었는지 모두 말해 주세요."
      },
      {
        "id": "workplaces-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "There have been changes in professions due to the development of technology. What are some recent profession trends in your country? Please, describe them in detail.",
        "ko": "기술의 발달로 직업에도 변화가 생겼습니다. 당신의 나라에서 나타나는 최근 직업 동향에는 무엇이 있나요? 자세히 설명해 주세요."
      }
    ]
  },
  {
    "id": "doctors",
    "category": "surprise",
    "ko": "의사 & 치과의사",
    "en": "Doctor & Dentist",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.doctors,
    "questions": [
      {
        "id": "doctors-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "I'd like to know about the doctor's or dentist's office that you usually go to. Where is it located and what does it look like? Tell me about it in as much detail as you can.",
        "ko": "평소 다니는 병원이나 치과에 대해 알고 싶습니다. 어디에 있고 어떤 모습인가요? 최대한 자세히 말해 주세요."
      },
      {
        "id": "doctors-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What kinds of things do you do when you make appointments with a doctor or dentist? Tell me exactly what you do from beginning to end.",
        "ko": "병원이나 치과 진료를 예약할 때 무엇을 하나요? 처음부터 끝까지 정확하게 설명해 주세요."
      },
      {
        "id": "doctors-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a time when you went to see a doctor or dentist as a child. Why did you go there? What did you do and what happened when you got there? Tell me about the experience in detail.",
        "ko": "어릴 때 병원이나 치과에 갔던 경험을 말해 주세요. 왜 갔으며 도착해서 무엇을 했고 어떤 일이 있었나요? 자세히 설명해 주세요."
      },
      {
        "id": "doctors-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "I'd like to know about the doctor's or dentist's office that you usually go to. Where is it located and what does it look like? Tell me about it in as much detail as you can.",
        "ko": "평소 다니는 병원이나 치과에 대해 알고 싶습니다. 어디에 있고 어떤 모습인가요? 최대한 자세히 말해 주세요."
      },
      {
        "id": "doctors-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a time when you went to see a doctor or dentist as a child. Why did you go there? What did you do and what happened when you got there? Tell me about the experience in detail.",
        "ko": "어릴 때 병원이나 치과에 갔던 경험을 말해 주세요. 왜 갔으며 도착해서 무엇을 했고 어떤 일이 있었나요? 자세히 설명해 주세요."
      },
      {
        "id": "doctors-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Many kinds of unexpected things can happen when you are at a doctor's or dentist's office. Tell me about one experience you had that was unforgettable. Start by telling me when this happened, where you were, and who you were with. And then, tell me about all the things that happened, which made this experience so unforgettable.",
        "ko": "병원이나 치과에서는 여러 예상 밖의 일이 일어날 수 있습니다. 잊을 수 없는 경험 한 가지를 말해 주세요. 언제, 어디서, 누구와 있었는지 먼저 말하고, 그 경험을 잊을 수 없게 만든 일들을 모두 설명해 주세요."
      },
      {
        "id": "doctors-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "I'd like to know about the doctor's or dentist's office that you usually go to. Where is it located and what does it look like? Tell me about it in as much detail as you can.",
        "ko": "평소 다니는 병원이나 치과에 대해 알고 싶습니다. 어디에 있고 어떤 모습인가요? 최대한 자세히 말해 주세요."
      },
      {
        "id": "doctors-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a time when you went to see a doctor or dentist as a child. Why did you go there? What did you do and what happened when you got there? Tell me about the experience in detail.",
        "ko": "어릴 때 병원이나 치과에 갔던 경험을 말해 주세요. 왜 갔으며 도착해서 무엇을 했고 어떤 일이 있었나요? 자세히 설명해 주세요."
      },
      {
        "id": "doctors-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Many kinds of unexpected things can happen when you are at a doctor's or dentist's office. Tell me about one experience you had that was unforgettable. Start by telling me when this happened, where you were, and who you were with. And then, tell me about all the things that happened, which made this experience so unforgettable.",
        "ko": "병원이나 치과에서는 여러 예상 밖의 일이 일어날 수 있습니다. 잊을 수 없는 경험 한 가지를 말해 주세요. 언제, 어디서, 누구와 있었는지 먼저 말하고, 그 경험을 잊을 수 없게 만든 일들을 모두 설명해 주세요."
      },
      {
        "id": "doctors-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You would like to make an appointment to see the doctor. Call the doctor's office and ask three or four questions about things you need to know and then set a time to go see the doctor.",
        "ko": "새 일자리를 찾기 위해 회사에 지원했습니다. 그 직책에 대해 더 알아보기 위한 몇 가지 질문을 하세요."
      },
      {
        "id": "doctors-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. Something has come up. That prevents you from going to see the doctor. Call the doctor's office, explain the situation and give two to three alternatives to make a new appointment with the doctor.",
        "ko": "새 직장에서 혼자 해결할 수 없는 문제가 생겼습니다. 상사나 동료에게 상황을 설명하고 도움을 요청하세요."
      },
      {
        "id": "doctors-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Tell me about a time when you made an appointment but couldn’t make it. What was the appointment for? Why couldn’t you go? What did you do about it? Tell me everything that happened from beginning to end.",
        "ko": "예약을 했지만 갈 수 없었던 때를 말해 주세요. 어떤 예약이었고 왜 갈 수 없었으며 어떻게 대처했는지 처음부터 끝까지 이야기해 주세요."
      }
    ]
  },
  {
    "id": "appointments",
    "category": "surprise",
    "ko": "예약",
    "en": "Appointment",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.appointments,
    "questions": [
      {
        "id": "appointments-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "People often have appointments for different things. Tell me about the kinds of places you go for different appointments.",
        "ko": "사람들은 여러 이유로 약속을 잡습니다. 다양한 약속을 위해 어떤 종류의 장소에 가는지 말해 주세요."
      },
      {
        "id": "appointments-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What kinds of things do you do when you make appointments? Tell me what you exactly do when you make these appointments.",
        "ko": "병원이나 치과 진료를 예약할 때 무엇을 하나요? 처음부터 끝까지 정확하게 설명해 주세요."
      },
      {
        "id": "appointments-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Talk about an appointment you made as a child. What was the appointment for? Was it for a doctor, a dentist or a new school? What did you do and what happened when you got to your appointment?",
        "ko": "어릴 때 잡았던 약속이나 예약을 말해 주세요. 어떤 목적이었나요? 병원, 치과, 새 학교 때문이었나요? 무엇을 했고 약속 장소에 도착했을 때 어떤 일이 있었나요?"
      },
      {
        "id": "appointments-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "People often have appointments for different things. Tell me about the kinds of places you go for different appointments.",
        "ko": "사람들은 여러 이유로 약속을 잡습니다. 다양한 약속을 위해 어떤 종류의 장소에 가는지 말해 주세요."
      },
      {
        "id": "appointments-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Talk about an appointment you made as a child. What was the appointment for? Was it for a doctor, a dentist or a new school? What did you do and what happened when you got to your appointment?",
        "ko": "어릴 때 잡았던 약속이나 예약을 말해 주세요. 어떤 목적이었나요? 병원, 치과, 새 학교 때문이었나요? 무엇을 했고 약속 장소에 도착했을 때 어떤 일이 있었나요?"
      },
      {
        "id": "appointments-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Unexpected things can happen when you make an appointment. Talk about a memorable incident regarding an appointment. What exactly happened and how did you deal with the situation?",
        "ko": "약속이나 예약을 잡다 보면 예상 밖의 일이 생길 수 있습니다. 약속과 관련해 기억에 남는 사건을 말해 주세요. 정확히 무슨 일이 있었고 어떻게 대처했나요?"
      },
      {
        "id": "appointments-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "People often have appointments for different things. Tell me about the kinds of places you go for different appointments.",
        "ko": "사람들은 여러 이유로 약속을 잡습니다. 다양한 약속을 위해 어떤 종류의 장소에 가는지 말해 주세요."
      },
      {
        "id": "appointments-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Talk about an appointment you made as a child. What was the appointment for? Was it for a doctor, a dentist or a new school? What did you do and what happened when you got to your appointment?",
        "ko": "어릴 때 잡았던 약속이나 예약을 말해 주세요. 어떤 목적이었나요? 병원, 치과, 새 학교 때문이었나요? 무엇을 했고 약속 장소에 도착했을 때 어떤 일이 있었나요?"
      },
      {
        "id": "appointments-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Unexpected things can happen when you make an appointment. Talk about a memorable incident regarding an appointment. What exactly happened and how did you deal with the situation?",
        "ko": "약속이나 예약을 잡다 보면 예상 밖의 일이 생길 수 있습니다. 약속과 관련해 기억에 남는 사건을 말해 주세요. 정확히 무슨 일이 있었고 어떻게 대처했나요?"
      }
    ]
  },
  {
    "id": "hair-salons",
    "category": "surprise",
    "ko": "헤어샵",
    "en": "Hair Salon",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["hair-salons"],
    "questions": [
      {
        "id": "hair-salons-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Where do you typically have your hair cut or styled? Tell me all about the place where you usually get your haircut.",
        "ko": "보통 어디에서 머리를 자르거나 손질하나요? 평소 머리를 자르는 곳을 자세히 말해 주세요."
      },
      {
        "id": "hair-salons-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "Tell me what typically goes on when you visit a hair salon. What do you usually do there? What do you do from the moment you walk in until you walk out?",
        "ko": "미용실에 가면 보통 어떤 일이 있나요? 그곳에서 주로 무엇을 하나요? 들어가는 순간부터 나올 때까지의 과정을 말해 주세요."
      },
      {
        "id": "hair-salons-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about a memorable hair-style you have ever had. Why was it so memorable? Give me all the details about what happened.",
        "ko": "지금까지 했던 헤어스타일 중 기억에 남는 것을 말해 주세요. 왜 기억에 남았는지 무슨 일이 있었는지 자세히 설명해 주세요."
      },
      {
        "id": "hair-salons-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Where do you typically have your hair cut or styled? Tell me all about the place where you usually get your haircut.",
        "ko": "보통 어디에서 머리를 자르거나 손질하나요? 평소 머리를 자르는 곳을 자세히 말해 주세요."
      },
      {
        "id": "hair-salons-combo2-q6",
        "number": "6",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about a memorable hair-style you have ever had. Why was it so memorable? Give me all the details about what happened.",
        "ko": "지금까지 했던 헤어스타일 중 기억에 남는 것을 말해 주세요. 왜 기억에 남았는지 무슨 일이 있었는지 자세히 설명해 주세요."
      },
      {
        "id": "hair-salons-combo2-q7",
        "number": "7",
        "type": "description",
        "source": "provided",
        "en": "Tell me about your hairstylist. How did you first meet your hairstylist? Did someone recommend him or her to you? What is he or she like? Describe him or her in as much detail as you can.",
        "ko": "담당 미용사에 대해 말해 주세요. 처음 어떻게 만났나요? 누군가 추천해 줬나요? 어떤 사람인지 최대한 자세히 설명해 주세요."
      },
      {
        "id": "hair-salons-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Where do you typically have your hair cut or styled? Tell me all about the place where you usually get your haircut.",
        "ko": "보통 어디에서 머리를 자르거나 손질하나요? 평소 머리를 자르는 곳을 자세히 말해 주세요."
      },
      {
        "id": "hair-salons-combo3-q9",
        "number": "9",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about a memorable hair-style you have ever had. Why was it so memorable? Give me all the details about what happened.",
        "ko": "지금까지 했던 헤어스타일 중 기억에 남는 것을 말해 주세요. 왜 기억에 남았는지 무슨 일이 있었는지 자세히 설명해 주세요."
      },
      {
        "id": "hair-salons-combo3-q10",
        "number": "10",
        "type": "description",
        "source": "provided",
        "en": "Tell me about your hairstylist. How did you first meet your hairstylist? Did someone recommend him or her to you? What is he or she like? Describe him or her in as much detail as you can.",
        "ko": "담당 미용사에 대해 말해 주세요. 처음 어떻게 만났나요? 누군가 추천해 줬나요? 어떤 사람인지 최대한 자세히 설명해 주세요."
      },
      {
        "id": "hair-salons-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You would like to make an appointment to get a hair cut. Call the hair shop and ask three or four questions about things you need to know and then set a time for the arrangement.",
        "ko": "새 일자리를 찾기 위해 회사에 지원했습니다. 그 직책에 대해 더 알아보기 위한 몇 가지 질문을 하세요."
      },
      {
        "id": "hair-salons-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. You got a hair cut at the hair shop. But it's not what you asked for and you are not satisfied with the hair cut. Talk to the hair stylist and explain the situation.",
        "ko": "새 직장에서 혼자 해결할 수 없는 문제가 생겼습니다. 상사나 동료에게 상황을 설명하고 도움을 요청하세요."
      },
      {
        "id": "hair-salons-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Tell me about a time when you had a problem at a hair shop. What exactly happened, and how did you solve the problem? Give me all the details from beginning to end.",
        "ko": "헤어샵에서 문제가 있었던 때를 말해 주세요. 무슨 일이 있었고 어떻게 해결했는지 처음부터 끝까지 자세히 이야기해 주세요."
      }
    ]
  },
  {
    "id": "holiday",
    "category": "surprise",
    "ko": "공휴일 & 모임 & 축하",
    "en": "Holiday & Gatherings & Celebrations",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["holiday"],
    "questions": [
      {
        "id": "holiday-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about some popular holidays in your country. Where do people typically celebrate these holidays? What kinds of things do they do to celebrate?",
        "ko": "당신의 나라에서 인기 있는 공휴일과 사람들이 축하하는 장소 및 방식을 말해 주세요."
      },
      {
        "id": "holiday-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "Choose one of the holidays you just told me about. Tell me all of the things people typically do to celebrate this holiday. What activities are involved?",
        "ko": "앞서 말한 공휴일 하나를 골라 사람들이 축하하기 위해 하는 활동을 모두 설명해 주세요."
      },
      {
        "id": "holiday-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a holiday memory from your childhood. Tell me where you were and what that place looked like. Tell me everything that you remember from that holiday scene.",
        "ko": "어린 시절의 공휴일 기억을 당시 장소의 모습과 기억나는 모든 일과 함께 말해 주세요."
      },
      {
        "id": "holiday-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Tell me about some popular holidays in your country. Where do people typically celebrate these holidays? What kinds of things do they do to celebrate?",
        "ko": "당신의 나라에서 인기 있는 공휴일과 사람들이 축하하는 장소 및 방식을 말해 주세요."
      },
      {
        "id": "holiday-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a holiday memory from your childhood. Tell me where you were and what that place looked like. Tell me everything that you remember from that holiday scene.",
        "ko": "어린 시절의 공휴일 기억을 당시 장소의 모습과 기억나는 모든 일과 함께 말해 주세요."
      },
      {
        "id": "holiday-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about the most recent holiday you celebrated. Why was that holiday memorable? Was there anything special about that day? Talk about why that holiday was particularly unforgettable.",
        "ko": "가장 최근에 기념한 공휴일과 그날이 특별하고 잊을 수 있었던 이유를 말해 주세요."
      },
      {
        "id": "holiday-combo3-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Tell me about some of the gatherings or celebrations that happen at where you live.",
        "ko": "사는 곳에서 열리는 모임이나 축하 행사들을 말해 주세요."
      },
      {
        "id": "holiday-combo3-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a gathering or a celebration that was held in which you live. Describe where the gathering was held, who was there, what the purpose of the gathering was, and what happened from beginning to end.",
        "ko": "사는 곳에서 열린 모임이나 축하 행사의 장소, 참석자, 목적과 전 과정을 설명해 주세요."
      },
      {
        "id": "holiday-combo3-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Sometimes when people get together for celebrations or gatherings, unexpected things can happen. Tell me all about something unexpected that happened at a celebration or a gathering in the area where you live. Tell me what happened from beginning to end.",
        "ko": "사는 지역의 축하 행사나 모임에서 일어난 예상 밖의 일을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "holiday-combo4-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Where do people usually have celebrations or parties in your area? Is it at someone's home, a park, or some place else? Tell me everything about that place in as much detail as you can.",
        "ko": "당신의 지역에서 사람들이 축하 행사나 파티를 여는 장소를 최대한 자세히 설명해 주세요."
      },
      {
        "id": "holiday-combo4-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last party, gathering or celebration that you attended. What happened and who was there with you? Tell me about what you did from beginning to end.",
        "ko": "최근 참석한 파티, 모임 또는 축하 행사에서 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "holiday-combo4-q7",
        "number": "7",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a time when you helped prepare a party or celebration. Perhaps, you helped invite people, or you helped decorate, or get the food or drinks. Tell me about this experience from the beginning to the end in detail.",
        "ko": "파티나 축하 행사를 준비하도록 도왔던 경험을 처음부터 끝까지 자세히 말해 주세요."
      },
      {
        "id": "holiday-combo5-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Tell me about some popular holidays in your country. Where do people typically celebrate these holidays? What kinds of things do they do to celebrate?",
        "ko": "당신의 나라에서 인기 있는 공휴일과 사람들이 축하하는 장소 및 방식을 말해 주세요."
      },
      {
        "id": "holiday-combo5-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a holiday memory from your childhood. Tell me where you were and what that place looked like. Tell me everything that you remember from that holiday scene.",
        "ko": "어린 시절의 공휴일 기억을 당시 장소의 모습과 기억나는 모든 일과 함께 말해 주세요."
      },
      {
        "id": "holiday-combo5-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about the most recent holiday you celebrated. Why was that holiday memorable? Was there anything special about that day? Talk about why that holiday was particularly unforgettable.",
        "ko": "가장 최근에 기념한 공휴일과 그날이 특별하고 잊을 수 있었던 이유를 말해 주세요."
      },
      {
        "id": "holiday-combo6-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Tell me about some of the gatherings or celebrations that happen at where you live.",
        "ko": "사는 곳에서 열리는 모임이나 축하 행사들을 말해 주세요."
      },
      {
        "id": "holiday-combo6-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a gathering or a celebration that was held in which you live. Describe where the gathering was held, who was there, what the purpose of the gathering was, and what happened from beginning to end.",
        "ko": "사는 곳에서 열린 모임이나 축하 행사의 장소, 참석자, 목적과 전 과정을 설명해 주세요."
      },
      {
        "id": "holiday-combo6-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Sometimes when people get together for celebrations or gatherings, unexpected things can happen. Tell me all about something unexpected that happened at a celebration or a gathering in the area where you live. Tell me what happened from beginning to end.",
        "ko": "사는 지역의 축하 행사나 모임에서 일어난 예상 밖의 일을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "holiday-combo7-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Where do people usually have celebrations or parties in your area? Is it at someone's home, a park, or some place else? Tell me everything about that place in as much detail as you can.",
        "ko": "당신의 지역에서 사람들이 축하 행사나 파티를 여는 장소를 최대한 자세히 설명해 주세요."
      },
      {
        "id": "holiday-combo7-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last party, gathering or celebration that you attended. What happened and who was there with you? Tell me about what you did from beginning to end.",
        "ko": "최근 참석한 파티, 모임 또는 축하 행사에서 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "holiday-combo7-q10",
        "number": "10",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a time when you helped prepare a party or celebration. Perhaps, you helped invite people, or you helped decorate, or get the food or drinks. Tell me about this experience from the beginning to the end in detail.",
        "ko": "파티나 축하 행사를 준비하도록 도왔던 경험을 처음부터 끝까지 자세히 말해 주세요."
      },
      {
        "id": "holiday-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You have been invited to a holiday party. Call your friend and ask when the party starts and what you should bring there. Ask two or three more questions about the party.",
        "ko": "공휴일 파티에 초대되었습니다. 친구에게 전화해 시작 시간, 가져갈 것과 그 밖의 질문 두세 가지를 하세요."
      },
      {
        "id": "holiday-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem which I need you to resolve. You just had a car accident, and you are going to be late for the holiday party. Call your friend, explain the situation, and give two to three alternatives regarding the situation.",
        "ko": "교통사고로 공휴일 파티에 늦게 되었습니다. 친구에게 전화해 상황을 설명하고 두세 가지 대안을 제시하세요."
      },
      {
        "id": "holiday-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever made plans for a trip or a party, but had to cancel at the last minute because of something that happened unexpectedly? Tell me everything about what prevented you from going.",
        "ko": "여행이나 파티 계획을 세웠지만 예상치 못한 일로 막판에 취소한 경험과 가지 못한 이유를 모두 말해 주세요."
      },
      {
        "id": "holiday-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. Your friend is thinking about having a holiday party and has asked for your help to plan the event. Call your friend and ask three or four questions to find out more about the party.",
        "ko": "친구가 공휴일 파티를 계획하며 도움을 요청했습니다. 파티에 대해 알아보기 위한 질문 서너 가지를 하세요."
      },
      {
        "id": "holiday-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem which I need you to resolve. After you agreed to help plan the party with your friend, you realize that you will be very busy the week before the party. Since you have less time to help your friend, call him, explain the situation. Offer two or three suggestions as to how to plan the party in less time.",
        "ko": "파티 전 주에 매우 바빠져 도울 시간이 부족합니다. 친구에게 상황을 설명하고 짧은 시간에 준비할 방법을 두세 가지 제안하세요."
      },
      {
        "id": "holiday-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Tell me about a time when you really wanted to go to a party or a celebration, but for some reason you could not go. What happened? Tell me the whole story from beginning to end.",
        "ko": "정말 가고 싶었던 파티나 축하 행사에 가지 못했던 때를 처음부터 끝까지 이야기해 주세요."
      },
      {
        "id": "holiday-roleplay3-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. Your friend has invited you to a holiday meal. Call your friend and ask three or four questions about the meal.",
        "ko": "친구가 공휴일 식사에 초대했습니다. 친구에게 전화해 식사에 관해 서너 가지 질문을 하세요."
      },
      {
        "id": "holiday-roleplay3-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem which I need you to resolve. Your car broke down on your way to your friend's house. You think you will be very late to the meal. Call your friend, explain the situation. And then, talk about when and how you plan to get there, even though you will be late.",
        "ko": "친구 집으로 가는 중 차가 고장 나 식사에 늦게 되었습니다. 친구에게 상황과 도착 시간 및 방법을 설명하세요."
      },
      {
        "id": "holiday-roleplay3-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever had problems with plans you had on a holiday? Perhaps, something unexpected did not enable you to do what you had planned to do. It could have been the weather or the traffic situation. Tell me everything about that experience and how you dealt with it.",
        "ko": "공휴일 계획에 문제가 생긴 경험과 그 문제에 어떻게 대처했는지 모두 말해 주세요."
      },
      {
        "id": "holiday-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Gatherings or celebrations in small towns are often different from those in big cities. Tell me about some of the similarities and differences between the celebrations people have in small towns and in big cities in your country.",
        "ko": "당신의 나라에서 작은 마을과 대도시의 모임이나 축하 행사가 어떻게 비슷하고 다른지 말해 주세요."
      },
      {
        "id": "holiday-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "What kinds of concerns do you hear people express regarding gatherings or celebrations in your area? Do people complain about traffic, parking, noise, garbage or other problems?",
        "ko": "지역의 모임이나 축하 행사와 관련해 교통, 주차, 소음, 쓰레기 등 사람들이 제기하는 우려를 말해 주세요."
      },
      {
        "id": "holiday-advanced2-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "How have celebrations and gatherings in your country changed since you were a child? Are there more of these events now than before? What sorts of events are more popular today than in the past?",
        "ko": "어린 시절 이후 당신의 나라의 축하 행사와 모임이 어떻게 변했고 어떤 행사가 더 인기 있는지 말해 주세요."
      },
      {
        "id": "holiday-advanced2-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Celebrations and gatherings are important to people living in a city or town. However, a lot of work, organization and money go into putting one of these events together. Was there a discussion among people related to organizing an event recently? What was the issue or different people were discussing?",
        "ko": "최근 행사 조직과 관련해 사람들이 논의한 내용과 쟁점이 무엇이었는지 말해 주세요."
      }
    ]
  },
  {
    "id": "community-event",
    "category": "surprise",
    "ko": "지역 행사",
    "en": "Community Event",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["community-event"],
    "questions": [
      {
        "id": "community-event-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know about a community event that takes place in your neighborhood. Do you ever attend a festival, concert, or celebration? Describe the event in detail.",
        "ko": "동네에서 열리는 지역 행사 하나를 최대한 자세히 설명해 주세요."
      },
      {
        "id": "community-event-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What kind of community events do people in your area usually participate in? What types of activities take place at these events? Describe it in as much detail as you can.",
        "ko": "지역 사람들이 참여하는 행사와 그곳에서 이루어지는 활동을 자세히 설명해 주세요."
      },
      {
        "id": "community-event-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Talk about your personal experience of participating in community event. What did you do and how did you feel? Tell me all about your experience in detail.",
        "ko": "지역 행사에 참여한 개인적인 경험과 했던 일, 느낀 점을 자세히 말해 주세요."
      },
      {
        "id": "community-event-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know about a community event that takes place in your neighborhood. Do you ever attend a festival, concert, or celebration? Describe the event in detail.",
        "ko": "동네에서 열리는 지역 행사 하나를 최대한 자세히 설명해 주세요."
      },
      {
        "id": "community-event-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Talk about your personal experience of participating in community event. What did you do and how did you feel? Tell me all about your experience in detail.",
        "ko": "지역 행사에 참여한 개인적인 경험과 했던 일, 느낀 점을 자세히 말해 주세요."
      },
      {
        "id": "community-event-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the most memorable community event you have ever attended. What made it so special, and what was your experience like?",
        "ko": "참석했던 가장 기억에 남는 지역 행사와 특별했던 이유 및 경험을 말해 주세요."
      },
      {
        "id": "community-event-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know about a community event that takes place in your neighborhood. Do you ever attend a festival, concert, or celebration? Describe the event in detail.",
        "ko": "동네에서 열리는 지역 행사 하나를 최대한 자세히 설명해 주세요."
      },
      {
        "id": "community-event-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Talk about your personal experience of participating in community event. What did you do and how did you feel? Tell me all about your experience in detail.",
        "ko": "지역 행사에 참여한 개인적인 경험과 했던 일, 느낀 점을 자세히 말해 주세요."
      },
      {
        "id": "community-event-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the most memorable community event you have ever attended. What made it so special, and what was your experience like?",
        "ko": "참석했던 가장 기억에 남는 지역 행사와 특별했던 이유 및 경험을 말해 주세요."
      },
      {
        "id": "community-event-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "What are some differences between the community events that are often held in your area now and those in the past? What were the main characteristics of past community events, and how are they different from today's events? I'd like to know how community events in your area have changed over time.",
        "ko": "현재와 과거에 열린 지역 행사의 특징과 차이 및 시간에 따른 변화를 말해 주세요."
      },
      {
        "id": "community-event-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "These days many community events are promoted and shared through social media. Please explain how people can find out about community events through different types of social media. Also, what kind of impact does social media have on community events? Please explain in detail.",
        "ko": "여러 소셜 미디어를 통해 지역 행사를 찾는 방법과 소셜 미디어가 행사에 미치는 영향을 자세히 설명해 주세요."
      }
    ]
  },
  {
    "id": "bank",
    "category": "surprise",
    "ko": "은행",
    "en": "Bank",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.bank,
    "questions": [
      {
        "id": "bank-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the banks in your country. What do they typically look like? Where are they usually located?",
        "ko": "당신의 나라에 있는 은행의 모습과 일반적인 위치를 설명해 주세요."
      },
      {
        "id": "bank-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "Tell me about what goes on when you visit the bank. What do you do from the moment you walk in until you walk out?",
        "ko": "은행에 들어가서 나올 때까지 무엇을 하는지 말해 주세요."
      },
      {
        "id": "bank-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Banks have definitely changed over time. Tell me about a bank you remember from your childhood. What did the bank look like? How was it different from banks today?",
        "ko": "어린 시절 기억하는 은행의 모습과 오늘날 은행과의 차이를 말해 주세요."
      },
      {
        "id": "bank-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the banks in your country. What do they typically look like? Where are they usually located?",
        "ko": "당신의 나라에 있는 은행의 모습과 일반적인 위치를 설명해 주세요."
      },
      {
        "id": "bank-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Banks have definitely changed over time. Tell me about a bank you remember from your childhood. What did the bank look like? How was it different from banks today?",
        "ko": "어린 시절 기억하는 은행의 모습과 오늘날 은행과의 차이를 말해 주세요."
      },
      {
        "id": "bank-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Sometimes, problems can occur when you are at the bank. Tell me about a problem you had that involved your bank. Maybe the bank was closed or perhaps the bank might have made some kind of mistake. Tell me how you dealt with that problem.",
        "ko": "은행에서 겪었던 문제와 그 문제에 어떻게 대처했는지 말해 주세요."
      },
      {
        "id": "bank-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the banks in your country. What do they typically look like? Where are they usually located?",
        "ko": "당신의 나라에 있는 은행의 모습과 일반적인 위치를 설명해 주세요."
      },
      {
        "id": "bank-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Banks have definitely changed over time. Tell me about a bank you remember from your childhood. What did the bank look like? How was it different from banks today?",
        "ko": "어린 시절 기억하는 은행의 모습과 오늘날 은행과의 차이를 말해 주세요."
      },
      {
        "id": "bank-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Sometimes, problems can occur when you are at the bank. Tell me about a problem you had that involved your bank. Maybe the bank was closed or perhaps the bank might have made some kind of mistake. Tell me how you dealt with that problem.",
        "ko": "은행에서 겪었던 문제와 그 문제에 어떻게 대처했는지 말해 주세요."
      },
      {
        "id": "bank-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You need to open a new bank account. Call the bank and ask the bank-teller 3 or 4 questions about opening a new account.",
        "ko": "새 은행 계좌를 개설하기 위해 은행 직원에게 서너 가지 질문을 하세요."
      },
      {
        "id": "bank-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. You have left your new bank card at the restaurant where you had dinner. Call the restaurant and explain what happened. Describe your card and offer suggestions to ask how to get the card back to you.",
        "ko": "식당에 두고 온 새 은행 카드를 되찾기 위해 상황과 카드 특징을 설명하고 방법을 제안하세요."
      },
      {
        "id": "bank-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Can you remember a problem you had with a bank account, a credit card or an ATM card that required some help or some assistance? Perhaps you lost your card or the card would not work. Tell me about that experience you had in as much detail as you can.",
        "ko": "은행 계좌나 신용 카드, ATM 카드 문제로 도움을 받았던 경험을 자세히 말해 주세요."
      },
      {
        "id": "bank-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You need to open a new bank account. Call the bank and ask the bank-teller 3 or 4 questions about opening a new account.",
        "ko": "새 은행 계좌를 개설하기 위해 은행 직원에게 서너 가지 질문을 하세요."
      },
      {
        "id": "bank-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem I need you to resolve. You just got your credit card, but found out that there is something wrong with it. Call the bank, explain the situation and solve the problem.",
        "ko": "새 신용 카드의 문제를 은행에 설명하고 해결하세요."
      },
      {
        "id": "bank-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Can you remember a problem you had with a bank account, a credit card or an ATM card that required some help or some assistance? Perhaps you lost your card or the card would not work. Tell me about that experience you had in as much detail as you can.",
        "ko": "은행 계좌나 신용 카드, ATM 카드 문제로 도움을 받았던 경험을 자세히 말해 주세요."
      }
    ]
  },
  {
    "id": "fashion",
    "category": "surprise",
    "ko": "패션",
    "en": "Fashion",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.fashion,
    "questions": [
      {
        "id": "fashion-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kinds of clothes do people in your country typically wear? Are there different clothes for work and for play? Tell me about the clothes in your country.",
        "ko": "당신의 나라 사람들이 평소 입는 옷과 일할 때 및 여가 때 입는 옷을 설명해 주세요."
      },
      {
        "id": "fashion-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What kind of clothes do you like to wear personally? What kind of fashion style do you prefer? What are you wearing today? Give me all the details about your fashion style.",
        "ko": "좋아하는 옷과 패션 스타일, 오늘 입은 옷을 자세히 말해 주세요."
      },
      {
        "id": "fashion-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Fashion styles are always changing. Tell me about the kinds of clothes that were popular when you were younger. What did fashion styles look like back then? How were they different from what is popular now?",
        "ko": "어릴 때 유행했던 옷과 당시 패션이 오늘날과 어떻게 다른지 말해 주세요."
      },
      {
        "id": "fashion-combo2-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kinds of clothes do people in your country typically wear? Are there different clothes for work and for play? Tell me about the clothes in your country.",
        "ko": "당신의 나라 사람들이 평소 입는 옷과 일할 때 및 여가 때 입는 옷을 설명해 주세요."
      },
      {
        "id": "fashion-combo2-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What do you do when you go to buy new clothes? Where do you go? Who do you go with? Tell me everything about what you do when you buy new clothes?",
        "ko": "새 옷을 살 때 어디에서 누구와 무엇을 하는지 모두 말해 주세요."
      },
      {
        "id": "fashion-combo2-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Fashion styles are always changing. Tell me about the kinds of clothes that were popular when you were younger. What did fashion styles look like back then? How were they different from what is popular now?",
        "ko": "어릴 때 유행했던 옷과 당시 패션이 오늘날과 어떻게 다른지 말해 주세요."
      },
      {
        "id": "fashion-combo3-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kinds of clothes do people in your country typically wear? Are there different clothes for work and for play? Tell me about the clothes in your country.",
        "ko": "당신의 나라 사람들이 평소 입는 옷과 일할 때 및 여가 때 입는 옷을 설명해 주세요."
      },
      {
        "id": "fashion-combo3-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What do you do when you go shopping? Where do you go and what do you look for? Tell me about your typical shopping habits in detail.",
        "ko": "쇼핑할 때 어디에 가고 무엇을 찾는지 평소 쇼핑 습관을 자세히 말해 주세요."
      },
      {
        "id": "fashion-combo3-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Fashion styles are always changing. Tell me about the kinds of clothes that were popular when you were younger. What did fashion styles look like back then? How were they different from what is popular now?",
        "ko": "어릴 때 유행했던 옷과 당시 패션이 오늘날과 어떻게 다른지 말해 주세요."
      },
      {
        "id": "fashion-combo4-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What kinds of clothes do people in your country typically wear? Are there different clothes for work and for play? Tell me about the clothes in your country.",
        "ko": "당신의 나라 사람들이 평소 입는 옷과 일할 때 및 여가 때 입는 옷을 설명해 주세요."
      },
      {
        "id": "fashion-combo4-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Fashion styles are always changing. Tell me about the kinds of clothes that were popular when you were younger. What did fashion styles look like back then? How were they different from what is popular now?",
        "ko": "어릴 때 유행했던 옷과 당시 패션이 오늘날과 어떻게 다른지 말해 주세요."
      },
      {
        "id": "fashion-combo4-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you bought a new piece of clothing. What did you need to buy and where did you find it? Were there any challenges or problems? Give me all the details.",
        "ko": "가장 최근에 새 옷을 샀던 경험과 어려움이나 문제를 자세히 말해 주세요."
      },
      {
        "id": "fashion-combo5-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What kinds of clothes do people in your country typically wear? Are there different clothes for work and for play? Tell me about the clothes in your country.",
        "ko": "당신의 나라 사람들이 평소 입는 옷과 일할 때 및 여가 때 입는 옷을 설명해 주세요."
      },
      {
        "id": "fashion-combo5-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Fashion styles are always changing. Tell me about the kinds of clothes that were popular when you were younger. What did fashion styles look like back then? How were they different from what is popular now?",
        "ko": "어릴 때 유행했던 옷과 당시 패션이 오늘날과 어떻게 다른지 말해 주세요."
      },
      {
        "id": "fashion-combo5-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you bought a new piece of clothing. What did you need to buy and where did you find it? Were there any challenges or problems? Give me all the details.",
        "ko": "가장 최근에 새 옷을 샀던 경험과 어려움이나 문제를 자세히 말해 주세요."
      },
      {
        "id": "fashion-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You are at a clothing store and need to get some clothes. Ask three or four questions about the clothes you would like to buy.",
        "ko": "옷 가게에서 사고 싶은 옷에 관해 서너 가지 질문을 하세요."
      },
      {
        "id": "fashion-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. The clothes you have ordered have arrived. But one of the shirts has a problem. Call the clothing store and explain the problem. Give 2 to 3 alternatives to solve the problem.",
        "ko": "배송된 셔츠의 문제를 옷 가게에 설명하고 두세 가지 해결책을 제시하세요."
      },
      {
        "id": "fashion-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever been unhappy with something that you bought or some service you received? What was the problem? How did you deal with the situation? Tell me everything in detail.",
        "ko": "구매한 물건이나 받은 서비스에 불만이 있었던 경험과 대처 방법을 자세히 말해 주세요."
      }
    ]
  },
  {
    "id": "geography",
    "category": "surprise",
    "ko": "지형",
    "en": "Geography",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.geography,
    "questions": [
      {
        "id": "geography-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Describe your country's geography for me. Are there mountains, lakes, or rivers? What is your country like?",
        "ko": "당신 나라의 산, 호수, 강 등 지형을 설명해 주세요."
      },
      {
        "id": "geography-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "Tell me about the outdoor activities that are popular in your country. Do people go hiking, bike or swim? What do people typically do outdoors?",
        "ko": "당신의 나라에서 인기 있는 야외 활동을 말해 주세요."
      },
      {
        "id": "geography-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about an early memory of your country’s geography. Perhaps, you visited a special place or went to an important natural landmark. Describe what you saw when you visited that special place.",
        "ko": "특별한 장소나 자연 명소에서 본 것을 포함해 나라의 지형에 관한 어린 시절 기억을 말해 주세요."
      },
      {
        "id": "geography-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Describe your country's geography for me. Are there mountains, lakes, or rivers? What is your country like?",
        "ko": "당신 나라의 산, 호수, 강 등 지형을 설명해 주세요."
      },
      {
        "id": "geography-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "I'd like you to pick a favorite place in your country from your childhood and describe that place for me. What are your memories of that place? What was it like when you were a child?",
        "ko": "어린 시절 좋아했던 나라 안의 장소와 그곳에 관한 기억을 설명해 주세요."
      },
      {
        "id": "geography-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "People often have memorable or moving experiences when they explore their country's geography. You might have climbed a famous mountain or might have been to a beautiful beach. Tell me a memorable story of when you visited a natural place in your country.",
        "ko": "나라 안의 자연 명소를 방문했을 때 기억에 남았던 이야기를 말해 주세요."
      },
      {
        "id": "geography-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Describe your country's geography for me. Are there mountains, lakes, or rivers? What is your country like?",
        "ko": "당신 나라의 산, 호수, 강 등 지형을 설명해 주세요."
      },
      {
        "id": "geography-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "I'd like you to pick a favorite place in your country from your childhood and describe that place for me. What are your memories of that place? What was it like when you were a child?",
        "ko": "어린 시절 좋아했던 나라 안의 장소와 그곳에 관한 기억을 설명해 주세요."
      },
      {
        "id": "geography-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "People often have memorable or moving experiences when they explore their country's geography. You might have climbed a famous mountain or might have been to a beautiful beach. Tell me a memorable story of when you visited a natural place in your country.",
        "ko": "나라 안의 자연 명소를 방문했을 때 기억에 남았던 이야기를 말해 주세요."
      },
      {
        "id": "geography-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You are planning on going on a trip to a country where your friend lives. Call your friend and ask about the geography there. And then, ask two or three more questions regarding your travel",
        "ko": "친구가 사는 나라로 여행을 계획하며 그곳의 지형과 여행에 관해 질문하세요."
      },
      {
        "id": "geography-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem I need you to resolve. You realize that you can't go on the trip because of some reason. Call your friend, explain the situation to him or her, and make plans for a trip next time.",
        "ko": "여행을 갈 수 없게 된 상황을 친구에게 설명하고 다음 여행 계획을 세우세요."
      },
      {
        "id": "geography-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever visited another country where the geography was different from your own country? If so, how was it different?",
        "ko": "자국과 지형이 다른 나라를 방문한 경험과 차이를 말해 주세요."
      },
      {
        "id": "geography-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Talk about a country that is geographically similar to your country. What are the changes that the country has gone through in recent years?",
        "ko": "당신의 나라와 지리적으로 비슷한 나라와 그 나라가 최근 겪은 변화를 말해 주세요."
      },
      {
        "id": "geography-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Tell me about an article you read about the country you have mentioned. What was the article about? Was it related to the politics or the economy of the country?",
        "ko": "앞서 말한 나라에 관해 읽은 기사와 정치 또는 경제 관련 내용을 설명해 주세요."
      }
    ]
  },
  {
    "id": "transportation",
    "category": "surprise",
    "ko": "교통",
    "en": "Transportation",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.transportation,
    "questions": [
      {
        "id": "transportation-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know how people get to work or school in your area. Do they drive cars or take buses? Tell me how people typically get around your area.",
        "ko": "지역 사람들이 직장이나 학교에 가는 방법과 평소 이동 수단을 말해 주세요."
      },
      {
        "id": "transportation-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "What means of transportation do you use to get around? Do you drive your own car or take public transportation?",
        "ko": "평소 이용하는 교통수단을 말해 주세요."
      },
      {
        "id": "transportation-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "How did you travel when you were a child? Were the types of transportation different back then? Describe for me how people used to get around in your city or town.",
        "ko": "어린 시절 사람들의 이동 수단과 오늘날과의 차이를 설명해 주세요."
      },
      {
        "id": "transportation-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know how people get to work or school in your area. Do they drive cars or take buses? Tell me how people typically get around your area.",
        "ko": "지역 사람들이 직장이나 학교에 가는 방법과 평소 이동 수단을 말해 주세요."
      },
      {
        "id": "transportation-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "How did you travel when you were a child? Were the types of transportation different back then? Describe for me how people used to get around in your city or town.",
        "ko": "어린 시절 사람들의 이동 수단과 오늘날과의 차이를 설명해 주세요."
      },
      {
        "id": "transportation-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Problems related to transportation often arise. Cars break down, trains run late or traffic could get bad. Tell me about a transportation problem that you once had. What did you do to deal with the situation?",
        "ko": "겪었던 교통 문제와 그 상황에 어떻게 대처했는지 말해 주세요."
      },
      {
        "id": "transportation-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "I’d like to know how people get to work or school in your area. Do they drive cars or take buses? Tell me how people typically get around your area.",
        "ko": "지역 사람들이 직장이나 학교에 가는 방법과 평소 이동 수단을 말해 주세요."
      },
      {
        "id": "transportation-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "How did you travel when you were a child? Were the types of transportation different back then? Describe for me how people used to get around in your city or town.",
        "ko": "어린 시절 사람들의 이동 수단과 오늘날과의 차이를 설명해 주세요."
      },
      {
        "id": "transportation-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Problems related to transportation often arise. Cars break down, trains run late or traffic could get bad. Tell me about a transportation problem that you once had. What did you do to deal with the situation?",
        "ko": "겪었던 교통 문제와 그 상황에 어떻게 대처했는지 말해 주세요."
      },
      {
        "id": "transportation-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I’d like to give you a situation and ask you to act it out. You are driving your car through a small town and have car trouble. Go to the nearest service station and ask for help. Ask three or four questions in order to get the information you need to get your car fixed.",
        "ko": "작은 마을에서 자동차 문제가 생겨 정비소에 도움을 요청하고 서너 가지 질문을 하세요."
      },
      {
        "id": "transportation-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I’m sorry, but there is a problem which I need you to resolve. Because of the car trouble, you will miss an important business meeting. Call your client and explain the situation and offer some alternative solutions.",
        "ko": "자동차 문제로 중요한 회의에 늦게 된 상황을 고객에게 설명하고 대안을 제시하세요."
      },
      {
        "id": "transportation-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Tell me about the last time you had trouble with your car. What was the problem and how did you deal with it? Give me lots of details.",
        "ko": "가장 최근 자동차 문제를 겪었던 경험과 해결 방법을 자세히 말해 주세요."
      }
    ]
  },
  {
    "id": "friends-family",
    "category": "surprise",
    "ko": "친구 & 가족",
    "en": "Friends & Family",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["friends-family"],
    "questions": [
      {
        "id": "friends-family-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Describe a family member or a friend you have. What is he or she like? What is special about that person?",
        "ko": "가족이나 친구 한 명의 성격과 특별한 점을 설명해 주세요."
      },
      {
        "id": "friends-family-combo1-q3",
        "number": "3",
        "type": "routine",
        "source": "provided",
        "en": "When you get together with friends or family, what kinds of things do you like to do together and why?",
        "ko": "친구나 가족과 만날 때 함께 무엇을 하고 왜 좋아하는지 말해 주세요."
      },
      {
        "id": "friends-family-combo1-q4",
        "number": "4",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last time when you got together with your friends or family. Who was there and when was it? Tell me everything you did that day from beginning to end.",
        "ko": "가장 최근 친구나 가족과 만났을 때 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Describe a family member or a friend you have. What is he or she like? What is special about that person?",
        "ko": "가족이나 친구 한 명의 성격과 특별한 점을 설명해 주세요."
      },
      {
        "id": "friends-family-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last time when you got together with your friends or family. Who was there and when was it? Tell me everything you did that day from beginning to end.",
        "ko": "가장 최근 친구나 가족과 만났을 때 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Could you tell me about a special event or a holiday you celebrated with your family or friends? Tell me all about that event or the holiday from beginning to end.",
        "ko": "가족이나 친구와 함께 기념한 특별한 행사나 공휴일을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo3-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Describe a family member or a friend you have. What is he or she like? What is special about that person?",
        "ko": "가족이나 친구 한 명의 성격과 특별한 점을 설명해 주세요."
      },
      {
        "id": "friends-family-combo3-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last time when you got together with your friends or family. Who was there and when was it? Tell me everything you did that day from beginning to end.",
        "ko": "가장 최근 친구나 가족과 만났을 때 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo3-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about a time when you visited a friend or a family member. What did you do when you visited them? What was memorable about that visit? Tell me everything from beginning to end.",
        "ko": "친구나 가족을 방문했을 때 한 일과 기억에 남은 점을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo4-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Tell me about visits to a friend's or a family member's house. What do you normally do when you go there?",
        "ko": "친구나 가족의 집을 방문할 때 보통 무엇을 하는지 말해 주세요."
      },
      {
        "id": "friends-family-combo4-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a visit to a friend or a family member in your childhood. Who did you visit and whom did you go with? What do you remember about that visit? What made the visit special?",
        "ko": "어린 시절 친구나 가족을 방문했던 기억과 특별했던 점을 말해 주세요."
      },
      {
        "id": "friends-family-combo4-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about a time when you visited a friend or a family member. What did you do when you visited them? What was memorable about that visit? Tell me everything from beginning to end.",
        "ko": "친구나 가족을 방문했을 때 한 일과 기억에 남은 점을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo5-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Describe a family member or a friend you have. What is he or she like? What is special about that person?",
        "ko": "가족이나 친구 한 명의 성격과 특별한 점을 설명해 주세요."
      },
      {
        "id": "friends-family-combo5-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last time when you got together with your friends or family. Who was there and when was it? Tell me everything you did that day from beginning to end.",
        "ko": "가장 최근 친구나 가족과 만났을 때 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo5-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Could you tell me about a special event or a holiday you celebrated with your family or friends? Tell me all about that event or the holiday from beginning to end.",
        "ko": "가족이나 친구와 함께 기념한 특별한 행사나 공휴일을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo6-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Describe a family member or a friend you have. What is he or she like? What is special about that person?",
        "ko": "가족이나 친구 한 명의 성격과 특별한 점을 설명해 주세요."
      },
      {
        "id": "friends-family-combo6-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the last time when you got together with your friends or family. Who was there and when was it? Tell me everything you did that day from beginning to end.",
        "ko": "가장 최근 친구나 가족과 만났을 때 누구와 무엇을 했는지 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo6-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about a time when you visited a friend or a family member. What did you do when you visited them? What was memorable about that visit? Tell me everything from beginning to end.",
        "ko": "친구나 가족을 방문했을 때 한 일과 기억에 남은 점을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-combo7-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Tell me about visits to a friend's or a family member's house. What do you normally do when you go there?",
        "ko": "친구나 가족의 집을 방문할 때 보통 무엇을 하는지 말해 주세요."
      },
      {
        "id": "friends-family-combo7-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Talk about a visit to a friend or a family member in your childhood. Who did you visit and whom did you go with? What do you remember about that visit? What made the visit special?",
        "ko": "어린 시절 친구나 가족을 방문했던 기억과 특별했던 점을 말해 주세요."
      },
      {
        "id": "friends-family-combo7-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Talk about a time when you visited a friend or a family member. What did you do when you visited them? What was memorable about that visit? Tell me everything from beginning to end.",
        "ko": "친구나 가족을 방문했을 때 한 일과 기억에 남은 점을 처음부터 끝까지 말해 주세요."
      },
      {
        "id": "friends-family-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You want to meet up with your friend on the weekend. Call your friend and ask 3 or 4 questions about what you can do together and when you can meet.",
        "ko": "주말에 친구와 만나 함께 할 일과 만날 시간에 관해 서너 가지 질문을 하세요."
      },
      {
        "id": "friends-family-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I’m sorry, but there is a problem which I need you to resolve. You are unable to meet your friend at the time and place that was agreed upon. Call your friend and give two to three alternatives to address the problem.",
        "ko": "약속한 시간과 장소에서 친구를 만날 수 없는 상황을 설명하고 두세 가지 대안을 제시하세요."
      },
      {
        "id": "friends-family-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Was there a time when you had to cancel your plans with someone? Maybe the weather was bad. Maybe you had work or chores that took up your free time. What did you do to deal with the situation that unexpectedly took up your free time?",
        "ko": "누군가와의 계획을 취소해야 했던 경험과 갑자기 시간을 빼앗긴 상황에 어떻게 대처했는지 말해 주세요."
      },
      {
        "id": "friends-family-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Describe two different friends or family members. Describe each of them in as much detail as you can. And then, tell me about the things they have in common and the differences between them.",
        "ko": "친구나 가족 두 명을 자세히 설명하고 공통점과 차이점을 말해 주세요."
      },
      {
        "id": "friends-family-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "When you get together with friends or family, what are some of the topics or interests you discuss? Why are these things of interest or concern to you? How do these things affect your life?",
        "ko": "친구나 가족과 나누는 주제나 관심사, 그 이유와 삶에 미치는 영향을 말해 주세요."
      }
    ]
  },
  {
    "id": "internet",
    "category": "surprise",
    "ko": "인터넷 & 웹서핑 & 비디오",
    "en": "Internet & Web Surfing & Video",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.internet,
    "questions": [
      {
        "id": "internet-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What do people usually do on the Internet? Do they play games, watch television, etc? Talk about the things people do online in detail.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "What are your usual habits when you are online? Do you usually share videos, do your shopping, read the news, etc? What do you usually do online?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "When did you first become interested in surfing the Tell me about your first experience or experiences of surfing the Internet in great detail. What were your first impressions of it? What do you remember about it?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo2-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kinds of videos do you like to watch online for fun, for work or for school? Tell me about the kinds of videos you like to watch online. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo2-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about your typical routine online. What do you do? Tell me about your online activities.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo2-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Describe something memorable you saw online for work or for leisure. Maybe it was something impressive, unusual, humorous or meaningful for you. What did you notice about it? What made it special?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo3-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What are your usual habits when you are online? Do you usually share videos, do your shopping, read the news, etc? What do you usually do online?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo3-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about your favorite website or type of website you visit. Why do you like it? Give me as many details as you can.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo3-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "When did you first become interested in surfing the Tell me about your first experience or experiences of surfing the Internet in great detail. What were your first impressions of it? What do you remember about it?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo4-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What are your usual habits when you are online? Do you usually share videos, do your shopping, read the news, etc? What do you usually do online?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo4-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "When did you first become interested in surfing the Tell me about your first experience or experiences of surfing the Internet in great detail. What were your first impressions of it? What do you remember about it?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo4-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about a project that you worked on that involved doing research on the Internet. Start with giving me some background about the project: when and where it was. And then, tell me how you used the Internet to get the project done.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo5-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What kinds of videos do you like to watch online for fun, for work or for school? Tell me about the kinds of videos you like to watch online. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo5-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Describe something memorable you saw online for work or for leisure. Maybe it was something impressive, unusual, humorous or meaningful for you. What did you notice about it? What made it special?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo5-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "What did you do on the Internet yesterday? What websites did you visit? Tell me about the things you did online yesterday.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo6-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What are your usual habits when you are online? Do you usually share videos, do your shopping, read the news, etc? What do you usually do online?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo6-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "When did you first become interested in surfing the Tell me about your first experience or experiences of surfing the Internet in great detail. What were your first impressions of it? What do you remember about it?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo6-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about a project that you worked on that involved doing research on the Internet. Start with giving me some background about the project: when and where it was. And then, tell me how you used the Internet to get the project done.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo7-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What kinds of videos do you like to watch online for fun, for work or for school? Tell me about the kinds of videos you like to watch online. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo7-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Describe something memorable you saw online for work or for leisure. Maybe it was something impressive, unusual, humorous or meaningful for you. What did you notice about it? What made it special?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-combo7-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "What did you do on the Internet yesterday? What websites did you visit? Tell me about the things you did online yesterday.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "internet-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. Your friend has found a cool website. Call your friend and ask three or four questions about the website he or she has found. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "You are having trouble using a website. Contact technical support to resolve the problem. Leave a message describing the issue. Emphasize that you need the problem solved as quickly as possible. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever had any trouble on the Internet? Perhaps you had difficulty using a website, or you lost Internet connection. What was the exact problem? And how did you deal with the situation?",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You are planning your trip abroad and need some help. Call a friend who knows a lot about travel websites. Explain your situation, ask your friend to recommend a travel website, and ask two or three questions about using the website to plan your trip.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem I need you to resolve. You and your friend were planning a trip overseas. However, an earthquake has occurred in the country you were planning to visit, so you can't go there anymore. Call your friend, explain what happened, and suggest two or three alternative plans for your trip.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Tell me about a time when you were planning a trip and got some travel information from a website. Did you change your original plans based on the information you found? What kind of information did you find, and how did your plans change? Tell me about the experience in as much detail as possible.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "internet-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "What kinds of concerns do people have about Internet use nowadays? They could be about issues regarding safety, privacy or security. How have these concerns affected people's lives?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "internet-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "How is Internet usage different among people in different age groups? How do young people use the Internet differently? Discuss this matter in detail.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "internet-advanced2-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Internet usage has changed over the years. How did people use to search for information on the Internet in the past? How do people access information online nowadays? If it has changed, how is it different? Please, compare the differences and provide the details.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "internet-advanced2-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "What kinds of concerns do people have about Internet use nowadays? They could be about issues regarding safety, privacy or security. How have these concerns affected people's lives?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      }
    ]
  }
,
  {
    "id": "health",
    "category": "surprise",
    "ko": "건강",
    "en": "Health",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.health,
    "questions": [
      {
        "id": "health-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the kinds of foods healthy people eat. What foods are they? Where do they buy these foods?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about all the things you do in order to stay healthy. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Ideas about what good health is and how to maintain it change frequently. What did people do to maintain good health when you were a child? What was considered to be a healthy diet at that time? How did people usually exercise? Describe how our ideas of what is healthy have changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo2-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about a local health food stores or grocery market. What do this place look like?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo2-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "What are the eating habits of healthy people? What do they usually eat during the week, for breakfast, lunch, dinner, snacks, etc?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo2-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Ideas about what good health is and how to maintain it change frequently. What did people do to maintain good health when you were a child? What was considered to be a healthy diet at that time? How did people usually exercise? Describe how our ideas of what is healthy have changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo3-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Describe a healthy person you know of. What makes that person healthy? Tell me everything that makes that person healthier. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo3-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a time when you or someone you know did something new to become healthier. Maybe it was playing a sport or eating some healthy food. Tell me about the change in detail. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo3-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "People do a lot of things to try to be healthy. They might join a healthy cooking class or join a new exercise program. Tell me about something you have done to try to improve your health. Tell me why you chose that particular activity and how it all worked out. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo4-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Describe a healthy person you know of. What makes that person healthy? Tell me everything that makes that person healthier. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo4-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about a time when you or someone you know did something new to become healthier. Maybe it was playing a sport or eating some healthy food. Tell me about the change in detail. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-combo4-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "People do a lot of things to try to be healthy. They might join a healthy cooking class or join a new exercise program. Tell me about something you have done to try to improve your health. Tell me why you chose that particular activity and how it all worked out. ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "health-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You are interested in joining a new gym that has recently opened in your town. Call the gym and ask three or four questions to get some information about the gym.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. There is an emergency and you can't make it to a training session with your personal trainer. Call your trainer and explain the situation and give some alternatives to make arrangements for a schedule change.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Maintaining one's health can be a big challenge. Tell me in detail about a challenge you faced related to maintaining or improving your health. Maybe you tried a difficult diet or maybe you tried to stop smoking. Tell me everything that you did. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You are interested in joining a new gym that has recently opened in your town. Call the gym and ask three or four questions to get some information about the gym.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem I need you to resolve. You have signed up at the gym, but you are not satisfied with it. Maybe the gym is not clean enough or there are too many people. Call the manager of the gym and make arrangements to get a refund. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Maintaining one's health can be a big challenge. Tell me in detail about a challenge you faced related to maintaining or improving your health. Maybe you tried a difficult diet or maybe you tried to stop smoking. Tell me everything that you did. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "health-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Different generations have different views on what is healthy. Some generations think people have to be skinny in order to be healthy while others believe people must be muscular. What did your parents' generation think people have to be like to be healthy? How does that compare to what your generation believe?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "health-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Tell me about a recent news story that you saw related to health issues. Describe what the issue was about in detail. How did your community react to the news?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "health-advanced2-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Describe how people usually stayed in good shape when you were a child. What kinds of sports did they play? Were gyms popular then? Describe what fitness was like then, and how it has changed over the years?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "health-advanced2-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Describe a recent event in your area that involved health issues. Perhaps, something happened in the food or medical industries. Perhaps, something related to sports happened or something like smoking was banned. Describe what happened in detail including the reaction of your community.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      }
    ]
  },
  {
    "id": "phone",
    "category": "surprise",
    "ko": "전화",
    "en": "Phone",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["phone"],
    "questions": [
      {
        "id": "phone-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What do you like most about your phone? Maybe you like the camera or maybe you like certain applications. Tell me why you like those features.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "What do you and your friends do on your phones besides talking to each other over the phone? Do you make updates on your social media pages? Do you play games? Tell me what you typically do on your phone.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the first phone you used. How was it? How was it different from the phone you are using now?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What do you like most about your phone? Maybe you like the camera or maybe you like certain applications. Tell me why you like those features.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the first phone you used. How was it? How was it different from the phone you are using now? ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Some features and services on phones are easy to use. But you may have to get help from friends, family or the services. Tell me about a time when you had a problem using your phone. What was the problem and how did you deal with the situation?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo3-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What do you like most about your phone? Maybe you like the camera or maybe you like certain applications. Tell me why you like those features.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo3-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Tell me about the first phone you used. How was it? How was it different from the phone you are using now? ",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-combo3-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Some features and services on phones are easy to use. But you may have to get help from friends, family or the services. Tell me about a time when you had a problem using your phone. What was the problem and how did you deal with the situation?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. One of your friends bought the new version of the cellphone you're using. So you want to know about that cellphone. Call your friend and ask 3 or 4 questions about what new features it has.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. Your friend sent a document on his or her cellphone, but it doesn't open on your phone. Call your friend, explain the issue, and suggest two or three alternatives.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. Have you ever experienced your phone not functioning properly? Tell me about any issues or problems you've had while using your phone.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay2-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to ask it out. You'd like to buy a new cell phone. Call a store and ask 3 or 4 questions about a new phone you'd like to purchase.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay2-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem that I need you to resolve. You have received the new phone, but the feature is not what you expected. You'd like to return it to get a new phone. Call the store, explain the situation and make arrangements to get a new product.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay2-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situations Have you ever bought a piece of technology which was not what you wanted or was different from what you had expected? was the feature not what you wanted or did it just not work properly? Tell me about that experience in detail.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay3-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I'd like to give you a situation and ask you to act it out. You and your friend are going to be traveling internationally and you want to take your phone with you. Call your phone service provider, explain the situation, and ask two or three questions to learn about what you may need to do to use your phone overseas, what the charges may be, and other relevant information. ",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay3-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I'm sorry, but there is a problem which I need you to resolve. Before you leave on a trip overseas with the friend, you learn that your phone service plan is set up for international calls, but your friend's phone is not. Talk to your friend and offer two or three solutions to resolve this problem.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "phone-roleplay3-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That's the end of the situation. People sometimes have difficulties with their phones when they are traveling, commuting, or going from one place to another. Sometimes, their batteries run out. Sometimes, they cannot get a good signal when they make a phone call. Tell me about a time when you had difficulties using your phone while traveling or commuting.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      }
    ]
  }
,
  {
    "id": "phone-calls",
    "category": "surprise",
    "ko": "전화 통화",
    "en": "Phone Calls",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["phone-calls"],
    "questions": [
      {
        "id": "phone-calls-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the kinds of things you and your friends talk about on the phone.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "I'd like to know about your routine of talking on the phone. Who do you talk with, when do you usually talk on the phone and how long do you talk for? Do you do other things at the same time when you are on the phone?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Can you tell me about a memorable phone conversation you had using your phone? Maybe your friend or your relative told you some exciting news. Maybe something funny happened while you were on the phone. Tell me about that story from beginning to end with lots of details about why it was so memorable.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-combo2-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Tell me about the kinds of things you and your friends talk about on the phone.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-combo2-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "I'd like to know about your routine of talking on the phone. Who do you talk with, when do you usually talk on the phone and how long do you talk for? Do you do other things at the same time when you are on the phone?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-combo2-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "How did you choose the phone that you currently use? How did you hear about it? Did you do research? Tell me everything you can remember about your experience of choosing your phone from beginning to end",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "phone-calls-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "Describe how people used cell phones five years ago. What could they do with their phone functions and applications? What are some of the biggest changes as to how people use their phones? Describe the phone you used to use in the past in detail.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "phone-calls-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "In some societies, there is a concern that young people are not developing face-to-face communication skills because they spend too much time on their phones. What do people in your country think about the way in which young people use their phones?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      }
    ]
  },
  {
    "id": "technology",
    "category": "surprise",
    "ko": "테크놀러지",
    "en": "Technology",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets.technology,
    "questions": [
      {
        "id": "technology-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "What kind of technology do people typically use in your country? Do people use computers, cell phones or hand-held devices? What are some common forms of technology that people use?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "What piece of technology do you use most often? Do you use computers or mobile phones? Tell me about the most typical type of technology you use every day.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Technology has definitely changed over time. Tell me about an early memory that you have about a piece of technology. years ago. It could be a computer or a mobile phone from many years ago. Describe for me what this thing was like back then. How has that technology changed over time?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What kind of technology do people typically use in your country? Do people use computers, cell phones or hand-held devices? What are some common forms of technology that people use?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Technology has definitely changed over time. Tell me about an early memory that you have about a piece of technology. years ago. It could be a computer or a mobile phone from many years ago. Describe for me what this thing was like back then. How has that technology changed over time?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Problem often come up because of our dependence on technology. Think about a time when you experienced a problem because some piece of technology was not working properly. Maybe your computer crashed or maybe your cell phone had no service. Tell me about a time when you had some kind of problem getting your technology to work.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "technology-roleplay1-q11",
        "number": "11",
        "type": "roleplay_ask",
        "source": "provided",
        "en": "I’d like to give you a situation and ask you to act it out. You are writing a report on the technology industry. Your friend knows a lot about this industry. Call him and ask three or four questions to learn more about this industry.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "technology-roleplay1-q12",
        "number": "12",
        "type": "roleplay_problem",
        "source": "provided",
        "en": "I’m sorry, but there is a problem which I need you to resolve. Your friend offers to meet you so that you can learn more about the industry which he works in. However, a few days before the meeting, a member of your family has an emergency. Call your friend, explain the situation, and offer two or three alternatives to get the information later on.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "technology-roleplay1-q13",
        "number": "13",
        "type": "roleplay_experience",
        "source": "provided",
        "en": "That’s the end of the situation. Tell me about a time you learned about an exciting new product. It might have been the first time you learned about smartphones, video games, cars or other products. Tell me about the product and how you learned about it. Tell me everything you did from beginning to end in as much detail as possible.",
        "ko": "제시된 상황에 맞게 역할극으로 답해 주세요."
      },
      {
        "id": "technology-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "I'd like to know about popular technology in your country. How has that technology developed over the years? How was it different compared to technology now? How do they affect people's lives?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "technology-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Tell me about recent news you read or watched related to technology. What was the news regarding technology? Do people talk about those issues often? How do people handle these issues?",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      }
    ]
  },
  {
    "id": "free-time",
    "category": "surprise",
    "ko": "여가시간",
    "en": "Free Time",
    "emoji": "",
    "fixedPracticeSets": surveyPracticeSets["free-time"],
    "questions": [
      {
        "id": "free-time-combo1-q2",
        "number": "2",
        "type": "description",
        "source": "provided",
        "en": "Where do people in your country go to in their free time? Do they go to beaches? Do they go to parks or any other places? What are some popular locations that people like to visit in their free time?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo1-q3",
        "number": "3",
        "type": "experience",
        "source": "provided",
        "en": "What do people in your country like to do in their free time? What are some popular free time activities?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo1-q4",
        "number": "4",
        "type": "memorable",
        "source": "provided",
        "en": "Do you have more or less free time now than you did in the past? Describe for me how your free time has changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo2-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "Where do people in your country go to in their free time? Do they go to beaches? Do they go to parks or any other places? What are some popular locations that people like to visit in their free time?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo2-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Do you have more or less free time now than you did in the past? Describe for me how your free time has changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo2-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you had some free time. What did you do? Who did you spend your free time with? Tell me everything that happened the last time you had some free time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo3-q5",
        "number": "5",
        "type": "description",
        "source": "provided",
        "en": "What do people in your country like to do in their free time? What are some popular free time activities?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo3-q6",
        "number": "6",
        "type": "experience",
        "source": "provided",
        "en": "Do you have more or less free time now than you did in the past? Describe for me how your free time has changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo3-q7",
        "number": "7",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you had some free time. What did you do? Who did you spend your free time with? Tell me everything that happened the last time you had some free time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo4-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "Where do people in your country go to in their free time? Do they go to beaches? Do they go to parks or any other places? What are some popular locations that people like to visit in their free time?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo4-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Do you have more or less free time now than you did in the past? Describe for me how your free time has changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo4-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you had some free time. What did you do? Who did you spend your free time with? Tell me everything that happened the last time you had some free time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo5-q8",
        "number": "8",
        "type": "description",
        "source": "provided",
        "en": "What do people in your country like to do in their free time? What are some popular free time activities?",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo5-q9",
        "number": "9",
        "type": "experience",
        "source": "provided",
        "en": "Do you have more or less free time now than you did in the past? Describe for me how your free time has changed over time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-combo5-q10",
        "number": "10",
        "type": "memorable",
        "source": "provided",
        "en": "Tell me about the last time you had some free time. What did you do? Who did you spend your free time with? Tell me everything that happened the last time you had some free time.",
        "ko": "제시된 질문에 구체적으로 답해 주세요."
      },
      {
        "id": "free-time-advanced1-q14",
        "number": "14",
        "type": "comparison",
        "source": "provided",
        "en": "What trends have you noticed when it comes to free time in your area? Do people have more or less leisure time than in the past? Describe your observations.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      },
      {
        "id": "free-time-advanced1-q15",
        "number": "15",
        "type": "issue",
        "source": "provided",
        "en": "Technology has had a huge impact on how people use their free time. Describe some of the changes that technology has brought when it comes to free time and free time activities.",
        "ko": "제시된 주제를 비교하거나 쟁점을 자세히 설명해 주세요."
      }
    ]
  }
];

export const surpriseQuestionCount = surpriseTopics.reduce((sum, topic) => sum + topic.questions.length, 0);
