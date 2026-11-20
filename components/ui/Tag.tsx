// <Tag variant="sample" />
const variants = {
  sample: { label: "샘플", colors: "bg-surface text-text-sub" },
  ai: { label: "AI 생성", colors: "bg-primary-soft text-primary" },
  review: { label: "전문가 확인 필요", colors: "bg-warn-soft text-warn" },
  urgent: { label: "기한 임박", colors: "bg-warn text-white" },
};

export function Tag({ variant }: { variant: keyof typeof variants }) {
  const { label, colors } = variants[variant];
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${colors}`}>{label}</span>;
}
