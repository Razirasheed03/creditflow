import type { AuditResult } from "@/types/audit";

import type { SummaryContext } from "./types";

export function buildSummaryContext(audit: AuditResult): SummaryContext {
  const tools = audit.recommendations
    .filter((r) => !r.inputInvalid)
    .map((r) => ({
      toolName: r.toolName,
      currentPlan: r.currentPlan,
      currentSpendMonthly: r.currentSpend,
      recommendedPlan: r.recommendedPlan,
      monthlySavings: r.monthlySavings,
      priority: r.priority,
      recommendationType: r.recommendationType,
      alreadyOptimized: r.alreadyOptimized,
    }));

  const topOpportunities = audit.recommendations
    .filter((r) => !r.inputInvalid && !r.alreadyOptimized && r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map((r) => ({
      toolName: r.toolName,
      monthlySavings: r.monthlySavings,
      recommendedPlan: r.recommendedPlan,
    }));

  return {
    teamSize: audit.teamSize,
    toolsAudited: audit.toolsAudited,
    optimizableToolCount: audit.optimizableToolCount,
    totalCurrentSpendMonthly: audit.totalCurrentSpend,
    totalRecommendedSpendMonthly: audit.totalRecommendedSpend,
    totalMonthlySavings: audit.totalMonthlySavings,
    totalAnnualSavings: audit.totalAnnualSavings,
    savingsRatePercent: Math.round(audit.savingsRatePercent * 100),
    isAlreadyOptimized: audit.isAlreadyOptimized,
    summaryMessage: audit.summaryMessage,
    tools,
    stackOverlaps: audit.stackOverlaps.map((o) => ({
      label: o.label,
      toolNames: o.toolNames,
      combinedSpendMonthly: o.combinedSpend,
    })),
    topOpportunities,
  };
}

/** Dollar amounts the model is allowed to reference in prose. */
export function getAllowedDollarAmounts(context: SummaryContext): number[] {
  const amounts = new Set<number>([
    context.totalCurrentSpendMonthly,
    context.totalRecommendedSpendMonthly,
    context.totalMonthlySavings,
    context.totalAnnualSavings,
  ]);

  for (const tool of context.tools) {
    amounts.add(tool.currentSpendMonthly);
    amounts.add(tool.monthlySavings);
  }
  for (const overlap of context.stackOverlaps) {
    amounts.add(overlap.combinedSpendMonthly);
  }
  for (const opp of context.topOpportunities) {
    amounts.add(opp.monthlySavings);
  }

  return [...amounts].filter((n) => n > 0);
}
