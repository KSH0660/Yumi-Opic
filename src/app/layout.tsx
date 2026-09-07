import type { Metadata, Viewport } from "next";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumi OPIc · 오픽 서베이 연습",
  description: "오픽 배경 설문 주제 11개를 묘사·습관·경험·롤플레이·비교·이슈 유형으로 반복 연습하는 모의고사 앱입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f6fe",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme={DEFAULT_THEME}>
      <head>
        {/* 저장된 테마를 첫 페인트 전에 적용해 다크 사용자의 화면 깜빡임을 막는다. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
