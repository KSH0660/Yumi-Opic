import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumi OPIc — 서베이 스프린트",
  description: "내가 선택한 OPIc 서베이 11개 주제를 묘사, 루틴, 경험, 비교, 이슈 유형으로 반복 연습합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
