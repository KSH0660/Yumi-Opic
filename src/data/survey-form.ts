import { DEFAULT_SURVEY_IDS } from "./survey-bank";

/**
 * 실제 오픽 Background Survey 화면의 8문항을 그대로 옮긴 것이다.
 * 문구와 순서는 2026년 서베이 항목 안내(https://baby.tali.kr/opic-survey)를 따른다.
 * 문제은행이 있는 항목만 topicId 를 갖고, 나머지는 실제 시험처럼 고를 수만 있다.
 */
export interface SurveyFormChoice {
  id: string;
  ko: string;
  topicId?: string;
}

export interface SurveyFormQuestion {
  id: string;
  number: number;
  /** 실제 서베이의 대분류 머리말. 이어지는 문항이 같은 값을 쓰면 머리말은 한 번만 보여 준다. */
  section: string;
  /** 대분류에 붙는 안내. 그 대분류의 첫 문항에만 둔다. */
  sectionNote?: string;
  title: string;
  /** 선택 개수 안내 문구. */
  guide: string;
  kind: "single" | "multi";
  choices: SurveyFormChoice[];
}

function c(id: string, ko: string, topicId?: string): SurveyFormChoice {
  return topicId ? { id, ko, topicId } : { id, ko };
}

export const surveyFormQuestions: SurveyFormQuestion[] = [
  {
    id: "job", number: 1, section: "직업 관련", title: "현재 귀하는 어느 분야에 종사하고 계신가요?",
    guide: "해당 1개", kind: "single",
    choices: [
      c("job-business", "사업/회사"),
      c("job-remote", "재택근무/재택사업"),
      c("job-teacher", "교사/교육자"),
      c("job-none", "일 경험 없음"),
    ],
  },
  {
    id: "student", number: 2, section: "직업 관련", title: "현재 당신은 학생인가요?",
    guide: "해당 1개", kind: "single",
    choices: [c("student-yes", "예"), c("student-no", "아니요")],
  },
  {
    id: "course", number: 3, section: "직업 관련", title: "최근 어떤 강의를 수강했습니까?",
    guide: "해당 1개", kind: "single",
    choices: [
      c("course-degree", "학위 과정 수업"),
      c("course-professional", "전문 기술 향상을 위한 평생 학습"),
      c("course-language", "어학 수업"),
      c("course-lapsed", "수강 후 5년 이상 지남"),
    ],
  },
  {
    id: "housing", number: 4, section: "거주지 관련", title: "현재 귀하는 어디에 살고 계십니까?",
    guide: "해당 1개", kind: "single",
    choices: [
      c("housing-alone", "개인 주택이나 아파트에 홀로 거주", "home"),
      c("housing-roommate", "친구나 룸메이트와 함께 주택이나 아파트에 거주"),
      c("housing-family", "가족(배우자/자녀/기타 가족)과 함께 주택이나 아파트에 거주"),
      c("housing-dorm", "학교 기숙사"),
      c("housing-military", "군대 막사, 군 시설"),
    ],
  },
  {
    id: "leisure", number: 5, section: "여가 활동 관련", sectionNote: "총 합산 12개 이상의 항목을 선택해야 함",
    title: "귀하는 여가 활동으로 주로 무엇을 하나요?", guide: "2개 이상", kind: "multi",
    choices: [
      c("leisure-movies", "영화보기"),
      c("leisure-club", "클럽/나이트클럽 가기"),
      c("leisure-museum", "박물관 가기"),
      c("leisure-park", "공원 가기", "park"),
      c("leisure-home-improvement", "주거 개선"),
      c("leisure-beach", "해변 가기", "beach"),
      c("leisure-sports-watching", "스포츠 관람"),
      c("leisure-cooking-shows", "요리 관련 프로그램 시청"),
      c("leisure-performances", "공연보기"),
      c("leisure-games", "게임하기"),
      c("leisure-camping", "캠핑하기"),
      c("leisure-sns", "SNS 글 올리기"),
      c("leisure-job-search", "구직 활동"),
      c("leisure-bars", "술집/바에 가기"),
      c("leisure-texting", "친구들과 문자 하기"),
      c("leisure-billiards", "당구 치기"),
      c("leisure-volunteering", "자원 봉사"),
      c("leisure-driving", "차 드라이브 하기"),
      c("leisure-test-prep", "시험 대비 과정 수강"),
      c("leisure-news", "뉴스 보거나 듣기"),
      c("leisure-cafe", "카페/커피 전문점 가기"),
      c("leisure-chess", "체스"),
      c("leisure-concerts", "콘서트 보기", "concert"),
      c("leisure-tv", "TV 시청"),
      c("leisure-shopping", "쇼핑하기", "shopping"),
      c("leisure-reality-shows", "리얼리티 쇼 보기"),
    ],
  },
  {
    id: "hobby", number: 6, section: "여가 활동 관련", title: "귀하의 취미나 관심사는 무엇인가요?",
    guide: "1개 이상", kind: "multi",
    choices: [
      c("hobby-travel-blogs", "여행 관련 잡지나 블로그 글 읽기"),
      c("hobby-dancing", "춤추기"),
      c("hobby-drawing", "그림 그리기"),
      c("hobby-music", "음악 감상하기", "music"),
      c("hobby-cooking", "요리하기"),
      c("hobby-photography", "사진 촬영하기"),
      c("hobby-instrument", "악기 연주하기"),
      c("hobby-investing", "주식 투자"),
      c("hobby-singing", "혼자 노래 부르거나 합창하기"),
      c("hobby-pets", "애완동물 키우기"),
      c("hobby-newspaper", "신문 읽기"),
      c("hobby-writing", "글쓰기"),
      c("hobby-reading", "독서"),
      c("hobby-reading-to-kids", "아이에게 책 읽어주기"),
    ],
  },
  {
    id: "sport", number: 7, section: "여가 활동 관련", title: "귀하는 주로 어떤 운동을 즐기십니까?",
    guide: "1개 이상", kind: "multi",
    choices: [
      c("sport-soccer", "축구"),
      c("sport-football", "미식 축구"),
      c("sport-basketball", "농구"),
      c("sport-baseball", "야구, 소프트볼"),
      c("sport-hockey", "하키"),
      c("sport-croquet", "크로켓"),
      c("sport-golf", "골프"),
      c("sport-volleyball", "배구"),
      c("sport-badminton", "배드민턴"),
      c("sport-table-tennis", "탁구"),
      c("sport-tennis", "테니스"),
      c("sport-swimming", "수영"),
      c("sport-cycling", "자전거"),
      c("sport-ski", "스키/스노보드"),
      c("sport-ice-skating", "아이스 스케이트"),
      c("sport-jogging", "조깅", "jogging"),
      c("sport-walking", "걷기", "walking"),
      c("sport-hiking", "하이킹, 트레킹"),
      c("sport-gym", "헬스", "gym"),
      c("sport-fishing", "낚시"),
      c("sport-yoga", "요가"),
      c("sport-taekwondo", "태권도"),
      c("sport-classes", "운동 수업 수강하기"),
      c("sport-none", "운동을 전혀 하지 않음"),
    ],
  },
  {
    id: "vacation", number: 8, section: "여가 활동 관련", title: "귀하는 어떤 휴가나 출장을 다녀온 경험이 있습니까?",
    guide: "1개 이상", kind: "multi",
    choices: [
      c("vacation-domestic-trip", "국내 여행"),
      c("vacation-overseas-trip", "해외 여행", "overseas"),
      c("vacation-home", "집에서 보내는 휴가", "staycation"),
      c("vacation-domestic-business", "국내 출장"),
      c("vacation-overseas-business", "해외 출장"),
    ],
  },
];

/** 실제 시험에서 여가·취미·운동·휴가 네 문항의 선택 개수를 합산해 세는 기준이다. */
export const OFFICIAL_MIN_CHOICES = 12;
/** 모의고사 한 회차는 주제 3개로 만든다. 그만큼은 문제은행이 있는 항목을 골라야 한다. */
export const MIN_PRACTICE_TOPICS = 3;

export const surveyFormChoices: SurveyFormChoice[] = surveyFormQuestions.flatMap((question) => question.choices);
export const surveyChoiceById = new Map(surveyFormChoices.map((choice) => [choice.id, choice]));
const choiceIdByTopicId = new Map(surveyFormChoices.flatMap((choice) => choice.topicId ? [[choice.topicId, choice.id] as const] : []));

/** 고른 선택지 가운데 문제은행이 있는 주제만 서베이 차례대로 돌려준다. */
export function topicIdsForChoices(choiceIds: readonly string[]): string[] {
  const chosen = new Set(choiceIds);
  return surveyFormChoices.flatMap((choice) => choice.topicId && chosen.has(choice.id) ? [choice.topicId] : []);
}

/** 주제 목록을 서베이 선택지로 되돌린다. 문제은행에 없는 주제는 대응하는 선택지가 없어 빠진다. */
export function choiceIdsForTopics(topicIds: readonly string[]): string[] {
  return topicIds.flatMap((topicId) => { const id = choiceIdByTopicId.get(topicId); return id ? [id] : []; });
}

/** 직업·학업 문항의 기본값. 실제 시험에서 업무와 학업 주제를 피할 때 쓰는 조합이다. */
export const DEFAULT_SINGLE_CHOICE_IDS = ["job-none", "student-no", "course-lapsed"];
export const DEFAULT_SURVEY_CHOICE_IDS = [
  ...new Set([...DEFAULT_SINGLE_CHOICE_IDS, ...choiceIdsForTopics(DEFAULT_SURVEY_IDS)]),
];
