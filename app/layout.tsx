import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// 제목에만 쓰는 명조 글꼴(design.md 2장). 화면에서는 font-serif 클래스로 써요.
const serif = Gowun_Batang({
  weight: ["400", "700"],
  preload: false,
  display: "swap",
  variable: "--font-gowun",
});

export const metadata: Metadata = {
  title: "남김",
  description: "장례 이후 해지·명의변경·상속 업무를 한곳에서 챙기는 서비스",
};

export const viewport: Viewport = {
  themeColor: "#19263c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={serif.variable}>
      <body className="text-text antialiased">{children}</body>
    </html>
  );
}
