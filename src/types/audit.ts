export const PRIMARY_USE_CASES = [
  "coding",
  "writing",
  "research",
  "data_analysis",
  "mixed",
] as const;

export type PrimaryUseCase = (typeof PRIMARY_USE_CASES)[number];

export const SUPPORTED_TOOL_IDS = [
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
  "v0",
] as const;

export type SupportedToolId = (typeof SUPPORTED_TOOL_IDS)[number];

export type AuditToolEntry = {
  id: string;
  toolId: SupportedToolId;
  /** Canonical tier id from the pricing catalog (not free text). */
  planTierId: string;
  monthlySpend: number;
  seats: number;
  primaryUseCase: PrimaryUseCase;
};

export type AuditFormValues = {
  teamSize: number;
  tools: AuditToolEntry[];
};

export type RecommendationType =
  | "downgrade"
  | "alternative"
  | "credit"
  | "optimized"
  | "overlap";

export type RecommendationPriority = "high" | "medium" | "low";

export type StackOverlapWarning = {
  groupId: string;
  label: string;
  toolNames: string[];
  combinedSpend: number;
  message: string;
};

export type ToolRecommendation = {
  toolId: SupportedToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  primaryUseCase: PrimaryUseCase;
  recommendedPlan: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercent: number;
  recommendationType: RecommendationType;
  priority: RecommendationPriority;
  reasoning: string;
  actionItems: string[];
  alreadyOptimized: boolean;
  catalogBenchmark?: number;
  /** True when plan/tool combination could not be validated — no savings claimed. */
  inputInvalid?: boolean;
};

export type AuditResult = {
  generatedAt: string;
  teamSize: number;
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  savingsRatePercent: number;
  toolsAudited: number;
  optimizableToolCount: number;
  isAlreadyOptimized: boolean;
  summaryMessage: string;
  stackOverlaps: StackOverlapWarning[];
  trustNote: string;
  inputWarnings: string[];
  invalidToolCount: number;
};
