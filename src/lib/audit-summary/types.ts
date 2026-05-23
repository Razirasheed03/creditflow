import type { AuditResult } from "@/types/audit";

export type SummaryProvider = "openai" | "anthropic";

export type SummarySource = "ai" | "fallback";

export type AuditSummaryResult = {
  text: string;
  wordCount: number;
  source: SummarySource;
  provider?: SummaryProvider;
  generatedAt: string;
};

export type SummaryToolFact = {
  toolName: string;
  currentPlan: string;
  currentSpendMonthly: number;
  recommendedPlan: string;
  monthlySavings: number;
  priority: string;
  recommendationType: string;
  alreadyOptimized: boolean;
};

export type SummaryContext = {
  teamSize: number;
  toolsAudited: number;
  optimizableToolCount: number;
  totalCurrentSpendMonthly: number;
  totalRecommendedSpendMonthly: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsRatePercent: number;
  isAlreadyOptimized: boolean;
  summaryMessage: string;
  tools: SummaryToolFact[];
  stackOverlaps: Array<{
    label: string;
    toolNames: string[];
    combinedSpendMonthly: number;
  }>;
  topOpportunities: Array<{
    toolName: string;
    monthlySavings: number;
    recommendedPlan: string;
  }>;
};

export type GenerateSummaryInput = {
  audit: AuditResult;
};
