import styles from "./theme";
// <Tag variant="sample" />
const variants = {
  sample: { label: "샘플", colors: styles.tagSample },
  ai: { label: "AI 생성", colors: styles.tagAi },
  review: { label: "전문가 확인 필요", colors: styles.tagReview },
  urgent: { label: "기한 임박", colors: styles.tagUrgent },
};

export function Tag({ variant }: { variant: keyof typeof variants }) {
  const { label, colors } = variants[variant];
  return <span className={`inline-block rounded-full border border-transparent px-3 py-1 text-sm font-semibold ${colors}`}>{label}</span>;
}
