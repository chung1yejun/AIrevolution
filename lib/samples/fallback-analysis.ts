import type { AnalysisItem } from "@/lib/types";

export const FALLBACK_ANALYSIS = {
  items: [
    { name: "하늘은행", type: "bank", count: 2, institutionId: null },
    { name: "든든생명", type: "insurance", count: 1, institutionId: null },
    { name: "차량등록사업소", type: "car", count: 1, institutionId: null },
  ],
} satisfies { items: AnalysisItem[] };
