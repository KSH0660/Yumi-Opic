export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-800 pt-6 pb-2">
      <p className="text-xs leading-relaxed text-ink-400">
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
