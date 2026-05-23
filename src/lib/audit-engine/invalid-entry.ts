import { getPlanDisplayName } from "@/data/pricing";
import type { ToolRecommendation } from "@/types/audit";

import type { EvalContext } from "./context";

export function buildInvalidEntryRecommendation(
  ctx: EvalContext,
  reason: string
): ToolRecommendation {
  const planLabel = getPlanDisplayName(ctx.entry.toolId, ctx.entry.planTierId);

  return {
    toolId: ctx.entry.toolId,
    toolName: ctx.pricing.displayName,
    currentPlan: planLabel,
    currentSpend: ctx.currentSpend,
    seats: ctx.seats,
    primaryUseCase: ctx.useCase,
    recommendedPlan: planLabel,
    recommendedSpend: ctx.currentSpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    recommendationType: "optimized",
    priority: "low",
    reasoning: reason,
    actionItems: [
      "Return to the audit form and select a valid plan from the dropdown for this tool.",
    ],
    alreadyOptimized: true,
    inputInvalid: true,
    catalogBenchmark: undefined,
  };
}
