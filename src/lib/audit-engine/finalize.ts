import { getPlanDisplayName } from "@/data/pricing";
import type {
  RecommendationPriority,
  RecommendationType,
  ToolRecommendation,
} from "@/types/audit";

import { catalogSpendFor, type EvalContext } from "./context";
import type { RuleState } from "./rules";

const MIN_SAVINGS_DOLLARS = 25;
const MIN_SAVINGS_PERCENT = 0.05;

export function finalizeRecommendation(
  ctx: EvalContext,
  state: RuleState
): ToolRecommendation {
  let recommendedSpend = Math.min(
    Math.max(0, state.recommendedSpend),
    ctx.currentSpend
  );

  if (ctx.currentSpend === 0) {
    return {
      toolId: ctx.entry.toolId,
      toolName: ctx.pricing.displayName,
      currentPlan: ctx.planDisplayName,
      currentSpend: 0,
      seats: ctx.seats,
      primaryUseCase: ctx.useCase,
      recommendedPlan: state.recommendedTier.name,
      recommendedSpend: 0,
      monthlySavings: 0,
      annualSavings: 0,
      savingsPercent: 0,
      recommendationType: "optimized",
      priority: "low",
      reasoning:
        state.reasoning ||
        `No spend reported for ${ctx.pricing.displayName}. Add invoice data for accurate recommendations.`,
      actionItems: state.actionItems,
      alreadyOptimized: true,
      catalogBenchmark: 0,
    };
  }

  const catalogBenchmark = catalogSpendFor(ctx, state.recommendedTier);
  let monthlySavings = Math.max(0, ctx.currentSpend - recommendedSpend);
  let recommendationType: RecommendationType = state.recommendationType;
  let priority: RecommendationPriority = state.priority;
  let reasoning = state.reasoning;
  let alreadyOptimized = false;

  const savingsPercent =
    ctx.currentSpend > 0 ? monthlySavings / ctx.currentSpend : 0;

  if (
    monthlySavings < MIN_SAVINGS_DOLLARS &&
    savingsPercent < MIN_SAVINGS_PERCENT
  ) {
    alreadyOptimized = true;
    recommendationType = "optimized";
    priority = "low";
    recommendedSpend = ctx.currentSpend;
    monthlySavings = 0;
    reasoning = `Your ${ctx.pricing.displayName} configuration is well-matched for a ${ctx.teamSize}-person team. We don't recommend changes that would save less than $${MIN_SAVINGS_DOLLARS}/mo — marginal gains aren't worth switching costs.`;
  }

  return {
    toolId: ctx.entry.toolId,
    toolName: ctx.pricing.displayName,
    currentPlan: getPlanDisplayName(ctx.entry.toolId, ctx.entry.planTierId),
    currentSpend: ctx.currentSpend,
    seats: ctx.seats,
    primaryUseCase: ctx.useCase,
    recommendedPlan: state.recommendedTier.name,
    recommendedSpend: alreadyOptimized ? ctx.currentSpend : recommendedSpend,
    monthlySavings: alreadyOptimized ? 0 : monthlySavings,
    annualSavings: alreadyOptimized ? 0 : monthlySavings * 12,
    savingsPercent: alreadyOptimized ? 0 : savingsPercent,
    recommendationType,
    priority: alreadyOptimized ? "low" : priority,
    reasoning,
    actionItems: dedupe(state.actionItems),
    alreadyOptimized,
    catalogBenchmark,
  };
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}
