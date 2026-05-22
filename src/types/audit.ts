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
  currentPlan: string;
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
  | "optimized";

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
  recommendationType: RecommendationType;
  reasoning: string;
  alreadyOptimized: boolean;
};

export type AuditResult = {
  generatedAt: string;
  teamSize: number;
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  isAlreadyOptimized: boolean;
  summaryMessage: string;
};
