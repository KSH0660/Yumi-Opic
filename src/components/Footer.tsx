export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-800 pt-6 pb-2">
      <p className="text-xs leading-relaxed text-ink-400">
        <strong className="text-emerald-300">기출 복원</strong> 표시가 붙은
        문항은 응시자들이 복원해 공개한 실제 출제 문항입니다. OPIc 공식 문제은행은
        공개되지 않으므로 이것도 복원본이며 실제 시험 문구와 다를 수 있습니다.{" "}
        <strong className="text-ink-300">형식 기반</strong> 표시가 붙은 문항은
        기출이 아니라 OPIc 형식을 따라 만든 연습 문항입니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        점수와 등급은 분량 · 유형별 필수 표현 · 연결어 · 어휘 다양성 · 문장
        구조를 기준으로 한 자체 추정치입니다. 실제 OPIc 등급과는 다를 수 있으니
        연습 방향을 잡는 용도로만 쓰세요.
      </p>
      <p className="mt-4 text-xs text-ink-500">
        © {new Date().getFullYear()} yumi-opic
      </p>
    </footer>
  );
}
