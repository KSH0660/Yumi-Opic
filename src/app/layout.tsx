import type { Metadata, Viewport } from "next";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumi OPIc · 서베이·돌발 주제 연습",
  description: "오픽 서베이 11개 주제와 돌발 7개 주제를 MP3 질문 듣기·답변·피드백으로 연습하는 모의고사 앱입니다.",
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
