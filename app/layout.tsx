import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "남김",
  description: "장례 이후 해지·명의변경·상속 업무를 한곳에서 챙기는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
