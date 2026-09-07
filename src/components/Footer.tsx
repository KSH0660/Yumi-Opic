export default function Footer() {
  return <footer className="mt-16 border-t border-line pb-2 pt-6">
    <p className="text-xs leading-relaxed text-fg-muted"><strong className="text-success-ink">공개 복원 기반</strong> 문항은 공개된 수험자 복원·기출 정리 자료에서 반복적으로 확인되는 질문 문형을 연습하기 좋게 다듬은 것입니다. 공식 OPIc 원문 인증이나 실제 출제 확률을 의미하지 않습니다.</p>
    <p className="mt-3 text-xs leading-relaxed text-fg-muted"><strong className="text-fg">출제형식 기반</strong> 문항은 직접 확인되는 복원이 부족한 토픽에서 비교·이슈·경험 유형을 연습할 수 있도록 OPIc 형식에 맞춰 보완한 문제입니다. 현재 버전은 11개 서베이 토픽만 활성화하며 11~13번 롤플레이는 제외합니다.</p>
    <p className="mt-4 text-xs text-fg-subtle">© {new Date().getFullYear()} yumi-opic</p>
  </footer>;
}
