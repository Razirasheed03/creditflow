import type { AuditToolEntry, ToolRecommendation } from "@/types/audit";

import { buildEvalContext } from "./context";
import { finalizeRecommendation } from "./finalize";
import { buildInvalidEntryRecommendation } from "./invalid-entry";
import { runRulePipeline } from "./rules";

export function evaluateTool(
  entry: AuditToolEntry,
  teamSize: number,
  allEntries: AuditToolEntry[]
): ToolRecommendation {
  const ctx = buildEvalContext(entry, teamSize, allEntries);

  if (!ctx.isValidPlan || !ctx.currentTier) {
    return buildInvalidEntryRecommendation(
      ctx,
      `We couldn't match "${ctx.planDisplayName}" to a known ${ctx.pricing.displayName} plan. Select a plan from the dropdown so we can benchmark your spend accurately.`
    );
  }

  if (ctx.currentSpend <= 0) {
    return buildInvalidEntryRecommendation(
      ctx,
      `Monthly spend must be greater than $0 for ${ctx.pricing.displayName} to produce a credible recommendation.`
    );
  }

  const state = runRulePipeline(entry, teamSize, allEntries);
  return finalizeRecommendation(ctx, state);
}
