export type ApiErrorCode =
  | "BAD_INPUT"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "SERVER_ERROR";

export type ApiErrorResponse = {
  error: { code: ApiErrorCode; message: string };
};

export type InstitutionType = "bank" | "insurance" | "telecom" | "car" | "public";
export type TaskSource = "rule" | "ai" | "manual";

export type Answers = {
  relation: "spouse" | "child" | "parent" | "sibling" | "other" | "unknown";
  deathDate: string;
  region: string;
  heirCount: "1" | "2" | "3" | "4+" | "unknown";
  will: "yes" | "no" | "unknown";
};

export type AnswersResponse = {
  ok: true;
  taskCount: number;
};

export type Progress = {
  done: number;
  total: number;
  percent: number;
};

export type Task = {
  id: string;
  title: string;
  institutionId: string | null;
  institutionName: string | null;
  dueDate: string | null;
  dDay: number | null;
  done: boolean;
  source: TaskSource;
  needsExpert: boolean;
};

export type UrgentTask = {
  taskId: string;
  title: string;
  dueDate: string;
  dDay: number;
};

export type HomeResponse =
  | {
      hasAnswers: true;
      answers: Answers;
      urgent: UrgentTask | null;
      progress: Progress;
      tasks: Task[];
    }
  | {
      hasAnswers: false;
      answers: null;
      urgent: null;
      progress: Progress;
      tasks: [];
    };

export type TaskUpdateRequest = { done: boolean };

export type TaskUpdateResponse = {
  id: string;
  done: boolean;
  doneAt: string | null;
  progress: Progress;
};

export type AnalysisRequest = { maskedText: string };

export type AnalysisItem = {
  name: string;
  type: InstitutionType;
  count: number;
  institutionId: string | null;
};

export type AnalysisFallbackReason = "timeout" | "invalid" | "limit" | "no_key" | "error";

export type AnalysisResponse = {
  items: AnalysisItem[];
  remaining: number;
} & (
  | { source: "ai"; reason: null }
  | { source: "fallback"; reason: AnalysisFallbackReason }
);

export type AnalysisApplyRequest =
  | { source: "ai"; items: AnalysisItem[] }
  | { source: "manual"; items: (Omit<AnalysisItem, "count" | "institutionId"> & { institutionId: string })[] };

export type AnalysisApplyResponse = { added: number; skipped: number };

export type DeleteMeResponse = { ok: true };
