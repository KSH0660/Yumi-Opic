import { TEXTBOOK } from "@/data";
export default function Footer() {
  return <footer className="mt-16 border-t border-ink-800 pb-2 pt-6">
    <p className="text-xs leading-relaxed text-ink-400"><strong className="text-emerald-300">교재 수록</strong>은 제공된 {TEXTBOOK.title}의 영어 질문과 SET을 뜻합니다. {TEXTBOOK.edition}, 기출 분석 범위는 2020년 7월까지입니다. 공식 원본·최신 기출·출제 빈도를 검증했다는 의미가 아닙니다. 영문 문구는 유지하고 줄바꿈·공백을 정리했습니다.</p>
    <p className="mt-3 text-xs leading-relaxed text-ink-400">기존 공개 복원 및 자체 제작 문항은 별도 소스 파일로 보존하고 현재 모의고사에는 섞지 않습니다. 문항 유형 표시는 앱의 분류이며 교재의 Int/Adv 표기와 다릅니다.</p>
    <p className="mt-3 text-xs leading-relaxed text-ink-400">점수·등급·목표 시간·목표 단어 수는 이 앱의 연습용 추정치입니다. 실제 OPIc 평가나 공식 등급 판정이 아니며, 녹음의 유창성·발음·정확도를 종합 평가하지 않습니다.</p>
    <p className="mt-4 text-xs text-ink-500">© {new Date().getFullYear()} yumi-opic</p>
  </footer>;
}
