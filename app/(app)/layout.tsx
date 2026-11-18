// 로그인 후 화면의 공통 틀. 하단 탭은 S3에서 추가.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="mobile-frame">{children}</div>;
}
