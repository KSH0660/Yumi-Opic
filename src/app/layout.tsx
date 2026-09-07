import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumi OPIc — 오픽 모의고사 셔플",
  description:
    "서베이 주제와 돌발·롤플레이·고난도 문항을 섞어 매번 새로운 OPIc 모의고사를 만들고, 타이핑하거나 마이크로 입력한 답변을 문항별로 돌아보며 연습합니다.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
